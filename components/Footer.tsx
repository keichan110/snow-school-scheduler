import Link from 'next/link';
import { SlidersHorizontal } from '@phosphor-icons/react/dist/ssr';

export default function Footer() {
  return (
    <footer className="bg-transparent py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="mb-4 text-sm text-muted-foreground md:mb-0">
            © 2025 Keisuke Ito. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <Link
              href="/admin"
              className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" weight="regular" />
              管理者機能
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
