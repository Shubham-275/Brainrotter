"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MemeCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/meme-count")
      .then((res) => res.json())
      .then((data) => setCount(data.count))
      .catch(() => setCount(0));
  }, []);

  return (
    <div className="inline-flex items-center gap-2.5 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-5 py-2.5 border border-gray-200 dark:border-gray-700 shadow-sm">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF3604] opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#EF3604]" />
      </span>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        Total Memes Generated:
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-sm font-black text-[#EF3604] tabular-nums"
        >
          {count !== null ? count.toLocaleString() : "..."}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
