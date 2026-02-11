"use client";

import Link from "next/link";

export default function StickyFooter() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <Link
            href="/about"
            className="hover:text-[#EF3604] transition-colors"
          >
            About
          </Link>
          <Link
            href="/docs"
            className="hover:text-[#EF3604] transition-colors"
          >
            Docs
          </Link>
          <Link
            href="/faq"
            className="hover:text-[#EF3604] transition-colors"
          >
            FAQ
          </Link>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
          Built with
          <a
            href="https://www.tinyfish.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#EF3604] hover:underline font-medium"
          >
            TinyFish
          </a>
        </div>
      </div>
    </footer>
  );
}
