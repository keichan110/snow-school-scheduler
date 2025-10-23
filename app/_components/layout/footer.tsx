export default function Footer() {
  return (
    <footer className="bg-transparent py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="mb-4 text-muted-foreground text-sm md:mb-0">
            © 2025 Keisuke Ito. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm">
            <a
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="/terms"
            >
              利用規約
            </a>
            <a
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="/privacy"
            >
              プライバシーポリシー
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
