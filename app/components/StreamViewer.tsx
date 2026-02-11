"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Monitor, X } from "lucide-react";
import { useState } from "react";

interface StreamViewerProps {
  streamingUrls: string[];
  activeSessions: number;
}

export default function StreamViewer({
  streamingUrls,
  activeSessions,
}: StreamViewerProps) {
  const [expanded, setExpanded] = useState(false);
  const activeUrls = streamingUrls.filter(Boolean);

  if (activeUrls.length === 0) return null;

  return (
    <div className="mt-4 w-full">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#EF3604] transition-colors"
      >
        <Monitor size={16} />
        <span>
          {activeSessions > 0
            ? `${activeSessions} agent${activeSessions > 1 ? "s" : ""} working`
            : "All agents finished"}
        </span>
        <span className="text-xs">
          {expanded ? "(hide live view)" : "(show live view)"}
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 space-y-3 overflow-hidden"
          >
            {activeUrls.map((url, i) => (
              <div
                key={url}
                className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-3 py-1.5">
                  <span className="text-xs text-gray-500">
                    Agent {i + 1} - Live View
                  </span>
                  <button
                    onClick={() => setExpanded(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                </div>
                <iframe
                  src={url}
                  className="w-full h-[300px] border-0"
                  title={`Agent ${i + 1} live view`}
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
