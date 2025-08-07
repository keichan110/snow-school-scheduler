import Link from "next/link";
import { SlidersHorizontal } from "@phosphor-icons/react/dist/ssr";

export default function Footer() {
  return (
    <footer className="bg-transparent py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-600 mb-4 md:mb-0">
            © 2025 Keisuke Ito. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <Link href="/admin" className="flex items-center text-gray-500 hover:text-gray-700 transition-colors">
              <SlidersHorizontal className="w-4 h-4 mr-2" weight="regular" />
              管理者機能
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
