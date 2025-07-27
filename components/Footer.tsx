import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-600 mb-4 md:mb-0">
            © 2025 Keisuke Ito. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <Link href="/admin" className="text-gray-500 hover:text-gray-700 transition-colors">
              管理者機能
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
