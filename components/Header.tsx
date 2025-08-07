import Link from "next/link";
import { Snowflake } from "@phosphor-icons/react/dist/ssr";

export default function Header() {
  return (
    <header className="w-full px-4 py-4 sm:fixed sm:top-4 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-7xl sm:mx-auto sm:px-6 lg:px-8 z-50">
      <div className="bg-slate-50/80 backdrop-blur-md shadow-lg border border-slate-50/20 rounded-2xl">
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
