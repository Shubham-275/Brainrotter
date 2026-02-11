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
    <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Total Memes Generated:
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-sm font-bold text-[#EF3604]"
        >
          {count !== null ? count.toLocaleString() : "..."}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
