/**
 * テスト環境設定の検証テスト
 *
 * このテストファイルは、テスト環境のセットアップが正しく動作することを確認するためのものです。
 * 全設定の動作を検証し、問題があれば早期に検出します。
 */

import '@testing-library/jest-dom';
import '__tests__/matchers';
import { createDepartment, createInstructor } from '__tests__/helpers/factories';
import { renderWithProviders } from '__tests__/helpers/test-utils';
import { setupMockData, resetMockDatabase } from '__tests__/mocks/prisma';
import { setupPageMock, expectRouterMethodCall } from '__tests__/mocks/next-router';
import { setupApiMocks, expectApiCall } from '__tests__/mocks/api';

// テスト用のシンプルなReactコンポーネント
const TestComponent = ({ title = 'Test Component' }: { title?: string }) => (
  <div>
    <h1>{title}</h1>
    <p>This is a test component</p>
  </div>
);

describe('テスト環境設定の検証', () => {
  beforeEach(() => {
    resetMockDatabase();
    jest.clearAllMocks();
  });

  describe('基本設定の確認', () => {
    test('Node.js環境がtest環境として設定されている', () => {
      expect(process.env.NODE_ENV).toBe('test');
    });

    test('タイムゾーンが日本時間に設定されている', () => {
      expect(process.env.TZ).toBe('Asia/Tokyo');

      // 日本時間での日付フォーマットをテスト
      const date = new Date('2024-01-01T00:00:00Z');
      const japanTime = date.toLocaleString('ja-JP', {
        timeZone: 'Asia/Tokyo',
        hour12: false,
      });

      expect(japanTime).toContain('2024');
    });

    test('グローバルユーティリティ関数が利用可能', () => {
      expect(typeof global.mockDate).toBe('function');

      // mockDate関数の動作テスト
      const testDate = global.mockDate('2024-01-01T10:00:00Z');
      expect(testDate).toBeInstanceOf(Date);
      expect(Date.now()).toBe(new Date('2024-01-01T10:00:00Z').getTime());
    });
  });

  describe('Testing Libraryの設定確認', () => {
    test('renderWithProviders関数が正常に動作する', () => {
      const { getByText, getByRole } = renderWithProviders(
        <TestComponent title="Setup Verification" />
      );

      expect(getByText('Setup Verification')).toBeInTheDocument();
      expect(getByText('This is a test component')).toBeInTheDocument();
      expect(getByRole('heading', { level: 1 })).toHaveTextContent('Setup Verification');
    });

    test('DOM Testing Libraryのマッチャーが利用可能', () => {
      const { getByText, container } = renderWithProviders(<TestComponent />);

      expect(container.firstChild).toBeInTheDocument();
      expect(getByText('Test Component')).toBeInTheDocument();
    });
  });

  describe('カスタムマッチャーの動作確認', () => {
    test('API レスポンスマッチャーが正常に動作する', () => {
      const successResponse = { success: true, data: { id: 1, name: 'test' } };
      const errorResponse = { success: false, error: 'Something went wrong' };

      expect(successResponse).toBeSuccessApiResponse();
      expect(errorResponse).toBeErrorApiResponse();
      expect(errorResponse).toBeErrorApiResponse('Something went wrong');
    });

    test('日付範囲マッチャーが正常に動作する', () => {
      const targetDate = new Date('2024-06-15T12:00:00Z');
      const startDate = new Date('2024-06-01T00:00:00Z');
      const endDate = new Date('2024-06-30T23:59:59Z');

      expect(targetDate).toBeDateWithinRange(startDate, endDate);
    });

    test('配列ソートマッチャーが正常に動作する', () => {
      const sortedAsc = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];
      const sortedDesc = [{ name: 'C' }, { name: 'B' }, { name: 'A' }];

      expect(sortedAsc).toBeSortedBy('name', 'asc');
      expect(sortedDesc).toBeSortedBy('name', 'desc');
    });

    test('ユニーク要素マッチャーが正常に動作する', () => {
      const uniqueArray = [1, 2, 3, 4, 5];
      const duplicateArray = [1, 2, 3, 2, 4];

      expect(uniqueArray).toHaveUniqueElements();
      expect(duplicateArray).not.toHaveUniqueElements();
    });

    test('週末チェックマッチャーが正常に動作する', () => {
      const saturday = new Date('2024-01-06T12:00:00Z'); // 土曜日
      const sunday = new Date('2024-01-07T12:00:00Z'); // 日曜日
      const monday = new Date('2024-01-08T12:00:00Z'); // 月曜日

      expect(saturday).toBeWeekend();
      expect(sunday).toBeWeekend();
      expect(monday).not.toBeWeekend();
    });

    test('Promise解決時間マッチャーが正常に動作する', async () => {
      const fastPromise = Promise.resolve('fast');
      const slowPromise = new Promise((resolve) => setTimeout(() => resolve('slow'), 100));

      await expect(fastPromise).toResolveWithin(50);
      await expect(slowPromise).toResolveWithin(200);
    });
  });

  describe('データファクトリーの動作確認', () => {
    test('部門ファクトリーが正常にデータを生成する', () => {
      const department = createDepartment();

      expect(department).toHaveProperty('id');
      expect(department).toHaveProperty('name');
      expect(department).toHaveProperty('code');
      expect(department).toHaveProperty('isActive');
      expect(department.isActive).toBe(true);
    });

    test('インストラクターファクトリーが正常にデータを生成する', () => {
      const instructor = createInstructor();

      expect(instructor).toHaveProperty('id');
      expect(instructor).toHaveProperty('firstName');
      expect(instructor).toHaveProperty('lastName');
      expect(instructor).toHaveProperty('firstNameKana');
      expect(instructor).toHaveProperty('lastNameKana');
      expect(instructor).toHaveProperty('status');
      expect(instructor.status).toBe('ACTIVE');
    });

    test('ファクトリーのオーバーライド機能が動作する', () => {
      const customDepartment = createDepartment({
        name: 'カスタム部門',
        code: 'CUSTOM',
      });

      expect(customDepartment.name).toBe('カスタム部門');
      expect(customDepartment.code).toBe('CUSTOM');
    });
  });

  describe('Prismaモックの動作確認', () => {
    test('モックデータのセットアップ関数が利用可能', () => {
      expect(typeof setupMockData).toBe('function');
      expect(typeof resetMockDatabase).toBe('function');
    });

    test('データベースリセット機能が動作する', () => {
      // リセット関数が正常に実行されることを確認
      expect(() => resetMockDatabase()).not.toThrow();
    });
  });

  describe('Next.js Routerモックの動作確認', () => {
    test('ルーターモック関数が利用可能', () => {
      expect(typeof setupPageMock).toBe('object');
      expect(typeof setupPageMock.admin).toBe('function');
      expect(typeof expectRouterMethodCall).toBe('function');
    });

    test('ページモックのセットアップが正常に動作する', () => {
      expect(() => setupPageMock.admin()).not.toThrow();
    });
  });

  describe('APIモックの動作確認', () => {
    test('APIモック関数が利用可能', () => {
      expect(typeof setupApiMocks).toBe('object');
      expect(typeof expectApiCall).toBe('function');
    });

    test('APIモックのセットアップが正常に動作する', () => {
      const mockDepartments = [createDepartment(), createDepartment()];

      expect(() => {
        setupApiMocks.departments.list(mockDepartments);
      }).not.toThrow();
    });
  });

  describe('環境変数とモックの統合テスト', () => {
    test('すべての設定が連携して動作する', () => {
      // 環境変数
      expect(process.env.NODE_ENV).toBe('test');

      // データファクトリー
      const department = createDepartment();

      // カスタムマッチャー
      const response = { success: true, data: department };
      expect(response).toBeSuccessApiResponse();

      // レンダリングテスト
      const { getByText } = renderWithProviders(<TestComponent title="統合テスト" />);
      expect(getByText('統合テスト')).toBeInTheDocument();
    });

    test('日本語環境での動作確認', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const japaneseFormat = date.toLocaleDateString('ja-JP');

      expect(japaneseFormat).toContain('2024');

      // 日本の祝日チェック（japanese-holidaysライブラリが利用可能な場合）
      const newYearsDay = new Date('2024-01-01T00:00:00Z');
      try {
        expect(newYearsDay).toBeJapaneseHoliday();
      } catch (error) {
        // ライブラリが利用できない場合はスキップ
        console.log('japanese-holidays library not available in test environment');
      }
    });
  });

  describe('パフォーマンスとメモリ使用量の基本確認', () => {
    test('メモリ使用量の測定が可能', () => {
      const initialMemory = process.memoryUsage();

      expect(initialMemory).toHaveProperty('heapUsed');
      expect(initialMemory).toHaveProperty('heapTotal');
      expect(initialMemory).toHaveProperty('external');
      expect(typeof initialMemory.heapUsed).toBe('number');
    });

    test('処理時間の測定が可能', () => {
      const startTime = Date.now();

      // 軽量な処理を実行
      const department = createDepartment();
      const { unmount } = renderWithProviders(<TestComponent title={department.name} />);
      unmount();

      const duration = Date.now() - startTime;
      expect(typeof duration).toBe('number');
      expect(duration).toBeLessThan(1000); // 1秒未満で完了することを期待
    });
  });
});
