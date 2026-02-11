"use client";

import { motion } from "framer-motion";

interface MemeSkeletonProps {
  steps: string[];
  index: number;
  streamingUrl?: string;
  isComplete?: boolean;
}

export default function MemeSkeleton({
  steps,
  index,
  streamingUrl,
  isComplete,
}: MemeSkeletonProps) {
  return (
    <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
          {isComplete ? "Completed" : "Generating..."}
        </h3>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Meme {index + 1}
        </span>
      </div>

      {/* Skeleton image area */}
      <div className="relative aspect-square rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden">
        {!isComplete && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
        )}

        {/* Live view iframe */}
        {streamingUrl && !isComplete && (
          <iframe
            src={streamingUrl}
            className="w-full h-full border-0 rounded-lg"
            title={`Live view - Meme ${index + 1}`}
            sandbox="allow-scripts allow-same-origin"
          />
        )}
      </div>

      {/* Steps log */}
      {steps.length > 0 && (
        <div className="mt-3 space-y-1 max-h-24 overflow-y-auto">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2"
            >
              <span className="text-[10px] text-green-500 mt-0.5">●</span>
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 leading-tight">
                {step}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
