import Link from "next/link";
import { Snowflake } from "@phosphor-icons/react/dist/ssr";

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
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
    </header>
  );
}
