import Link from "next/link";
import { CalendarDots, Certificate, UsersThree } from "@phosphor-icons/react/dist/ssr";

export default function AdminPage() {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">管理者メニュー</h1>
          <p className="text-lg text-gray-600">スキースクール管理システム</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
            <Link href="" className="block p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Certificate className="w-8 h-8 text-blue-600" weight="regular" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">資格管理</h2>
              <p className="text-gray-600">インストラクターの資格情報を管理します</p>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
            <Link href="" className="block p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersThree className="w-8 h-8 text-green-600" weight="regular" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">インストラクター管理</h2>
              <p className="text-gray-600">インストラクターの基本情報を管理します</p>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
            <Link href="" className="block p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDots className="w-8 h-8 text-purple-600" weight="regular" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">シフト管理</h2>
              <p className="text-gray-600">インストラクターのシフト表を管理します</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
