import Link from "next/link";
import { Snowflake } from "@phosphor-icons/react/dist/ssr";

export default function Header() {
  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-50">
      <div className="bg-white/80 backdrop-blur-md shadow-lg border border-white/20 rounded-2xl">
        <div className="px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 via-blue-300 to-indigo-400 rounded-lg flex items-center justify-center">
                  <Snowflake className="w-6 h-6 text-white" weight="bold" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Fuyugyō
                </h1>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
