"use client";

import { motion } from "framer-motion";

interface MemeProgressProps {
  current: number;
  total: number;
}

export default function MemeProgress({ current, total }: MemeProgressProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {current} / {total} memes generated
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#EF3604] to-[#FF6B3D] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
