import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import type {
  InstructorBasicInfo,
  UserInstructorProfile,
} from "@/types/actions";
import { InstructorLinkageSection } from "./instructor-linkage-section";

// Next.js routerをモック
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockInstructors: InstructorBasicInfo[] = [
  {
    id: 1,
    firstName: "太郎",
    lastName: "山田",
    firstNameKana: "タロウ",
    lastNameKana: "ヤマダ",
  },
];

const mockInstructorProfile: UserInstructorProfile = {
  id: 1,
  firstName: "太郎",
  lastName: "山田",
  firstNameKana: "タロウ",
  lastNameKana: "ヤマダ",
};

describe("InstructorLinkageSection", () => {
  const mockRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      refresh: mockRefresh,
    });
  });

  describe("Conditional Rendering", () => {
    it("instructorProfileがnullの場合、アラートが表示される", () => {
      render(
        <InstructorLinkageSection
          availableInstructors={mockInstructors}
          instructorProfile={null}
        />
      );

      expect(
        screen.getByText("インストラクター情報が設定されていません")
      ).toBeInTheDocument();
    });

    it("instructorProfileが存在する場合、何も表示されない", () => {
      const { container } = render(
        <InstructorLinkageSection
          availableInstructors={mockInstructors}
          instructorProfile={mockInstructorProfile}
        />
      );

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("Alert Content", () => {
    beforeEach(() => {
      render(
        <InstructorLinkageSection
          availableInstructors={mockInstructors}
          instructorProfile={null}
        />
      );
    });

    it("警告アイコンが表示される", () => {
      // lucide-reactのAlertTriangleアイコンはsvgとしてレンダリングされる
      const alert = screen.getByRole("alert");
      const alertIcon = alert.querySelector("svg");
      expect(alertIcon).toBeInTheDocument();
    });

    it("適切なタイトルが表示される", () => {
      expect(
        screen.getByText("インストラクター情報が設定されていません")
      ).toBeInTheDocument();
    });

    it("適切な説明文が表示される", () => {
      expect(
        screen.getByText(
          "スケジュール機能を利用するには、インストラクター情報を設定してください。"
        )
      ).toBeInTheDocument();
    });

    it("設定ボタンが表示される", () => {
      expect(screen.getByRole("button", { name: "設定" })).toBeInTheDocument();
    });
  });

  describe("Router Integration", () => {
    it("handleSuccess内でrouter.refresh()が呼ばれる準備ができている", () => {
      render(
        <InstructorLinkageSection
          availableInstructors={mockInstructors}
          instructorProfile={null}
        />
      );

      // useRouterが正しく呼ばれていることを確認
      expect(useRouter).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("アラートに適切なrole属性が設定されている", () => {
      render(
        <InstructorLinkageSection
          availableInstructors={mockInstructors}
          instructorProfile={null}
        />
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });
});
