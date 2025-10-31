import "@testing-library/jest-dom";
import "./__tests__/matchers";

// テスト環境変数の設定
process.env.NODE_ENV = "test";
process.env.TZ = "Asia/Tokyo";
process.env.DATABASE_URL = "file:./test.db";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.NEXT_PUBLIC_TEST_MODE = "true";

// 日本語ロケール設定
if (Intl?.DateTimeFormat) {
  global.Intl = Intl;
}

// Next.js Server Components用のグローバルオブジェクトのモック
if (typeof global.Request === "undefined") {
  global.Request = class Request {};
}
if (typeof global.Response === "undefined") {
  global.Response = class Response {};
}
if (typeof global.Headers === "undefined") {
  global.Headers = class Headers {};
}

// Date.now() のモック設定用ヘルパー（テストで使用）
global.mockDate = (isoDate) => {
  const mockDate = new Date(isoDate);
  jest.spyOn(Date, "now").mockReturnValue(mockDate.getTime());
  return mockDate;
};

// テスト後のクリーンアップ
afterEach(() => {
  // Date.now() モックをリストア
  if (jest.isMockFunction(Date.now)) {
    Date.now.mockRestore();
  }
});

// Next.js Router のモック設定（必要に応じてテストで上書き可能）
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    entries: jest.fn(),
    forEach: jest.fn(),
    toString: jest.fn(),
  })),
  usePathname: jest.fn(() => "/"),
  useParams: jest.fn(() => ({})),
}));

// window.matchMedia のモック（レスポンシブテスト用）
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// ResizeObserver のモック
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// IntersectionObserver のモック
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// PointerEvent polyfill for Radix UI
if (!global.PointerEvent) {
  class PointerEvent extends MouseEvent {
    constructor(type, params = {}) {
      super(type, params);
      this.pointerId = params.pointerId || 0;
      this.pointerType = params.pointerType || "mouse";
    }
  }
  global.PointerEvent = PointerEvent;
}

// hasPointerCapture polyfill for JSDOM
if (typeof Element !== "undefined") {
  Element.prototype.hasPointerCapture =
    Element.prototype.hasPointerCapture || (() => false);
  Element.prototype.setPointerCapture =
    Element.prototype.setPointerCapture ||
    (() => {
      /* no-op */
    });
  Element.prototype.releasePointerCapture =
    Element.prototype.releasePointerCapture ||
    (() => {
      /* no-op */
    });
}

// console のテスト時の抑制設定
if (process.env.NODE_ENV === "test") {
  // エラーやワーニングは表示するが、ログは抑制
  // biome-ignore lint/suspicious/noConsole: テストセットアップでのconsole制御が必要
  const originalError = console.error;
  // biome-ignore lint/suspicious/noConsole: テストセットアップでのconsole制御が必要
  const originalWarn = console.warn;

  console.error = (...args) => {
    // React の開発モード警告は抑制
    if (typeof args[0] === "string" && args[0].includes("Warning:")) {
      return;
    }
    originalError.apply(console, args);
  };

  console.warn = (...args) => {
    // 特定の警告は抑制
    if (
      typeof args[0] === "string" &&
      (args[0].includes("componentWillReceiveProps") ||
        args[0].includes("componentWillUpdate") ||
        args[0].includes("Missing `Description`") ||
        args[0].includes("aria-describedby"))
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}
