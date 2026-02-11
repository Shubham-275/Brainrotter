"use client";

import { FormEvent, useState, useEffect } from "react";
import MemeSkeleton from "./components/MemeSkeleton";
import MemeCard from "./components/MemeCard";
import Logo from "./components/Logo";
import MemeProgress from "./components/MemeProgress";
import MemeCounter from "./components/MemeCounter";
import RecentlyGenerated from "./components/RecentlyGenerated";
import GenerationInfo from "./components/GenerationInfo";
import StreamViewer from "./components/StreamViewer";
import StickyFooter from "./components/StickyFooter";
import { MAX_CONCURRENT_MEMES } from "./config/constants";
import { motion } from "framer-motion";
import Link from "next/link";

interface Meme {
  index: number;
  imageUrl: string;
  templateName: string;
}

interface LoadingState {
  index: number;
  steps: string[];
  streamingUrl?: string;
  isComplete?: boolean;
}

export default function Home() {
  const [message, setMessage] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [memes, setMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState<LoadingState[]>(
    Array(MAX_CONCURRENT_MEMES)
      .fill(null)
      .map((_, index) => ({ index, steps: [] }))
  );
  const [recentMemes, setRecentMemes] = useState<
    (Meme & { query: string; timestamp: number })[]
  >([]);
  const [successfulMemes, setSuccessfulMemes] = useState(0);
  const [streamingUrls, setStreamingUrls] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSessions, setActiveSessions] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [allSessionsComplete, setAllSessionsComplete] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("recentMemes");
    if (saved) {
      try {
        setRecentMemes(JSON.parse(saved));
      } catch {
        // Ignore invalid data
      }
    }
  }, []);

  useEffect(() => {
    const urls = loadingStates
      .map((state) => state.streamingUrl)
      .filter((url): url is string => !!url);
    setStreamingUrls(urls);
  }, [loadingStates]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setMemes([]);
    setIsLoading(true);
    setSubmittedQuery(message);
    setSuccessfulMemes(0);
    setActiveSessions(MAX_CONCURRENT_MEMES);
    setAllSessionsComplete(false);
    setLoadingStates(
      Array(MAX_CONCURRENT_MEMES)
        .fill(null)
        .map((_, index) => ({ index, steps: [] }))
    );

    let firstResponseReceived = false;

    const apiCalls = Array(MAX_CONCURRENT_MEMES)
      .fill(null)
      .map((_, index) =>
        fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, sourceType: index }),
        })
          .then(async (res) => {
            const reader = res.body?.getReader();
            if (!reader) throw new Error("No reader available");

            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                try {
                  const data = JSON.parse(line.slice(6));

                  if (data.type === "streamingUrl") {
                    setLoadingStates((prev) =>
                      prev.map((state) =>
                        state.index === index
                          ? { ...state, streamingUrl: data.url }
                          : state
                      )
                    );
                  } else if (data.type === "step") {
                    setLoadingStates((prev) =>
                      prev.map((state) =>
                        state.index === index
                          ? {
                              ...state,
                              steps: [...state.steps, data.message],
                            }
                          : state
                      )
                    );
                  } else if (data.type === "complete") {
                    const result: Meme = {
                      index: data.index,
                      imageUrl: data.imageUrl,
                      templateName: data.templateName,
                    };

                    setMemes((prev) => [...prev, result]);
                    setSuccessfulMemes((prev) =>
                      Math.min(prev + 1, MAX_CONCURRENT_MEMES)
                    );
                    setActiveSessions((prev) => Math.max(0, prev - 1));
                    setLoadingStates((prev) =>
                      prev.map((state) =>
                        state.index === index
                          ? { ...state, isComplete: true }
                          : state
                      )
                    );

                    // Save to localStorage
                    const newMeme = {
                      ...result,
                      query: message,
                      timestamp: Date.now(),
                    };
                    const existing = JSON.parse(
                      localStorage.getItem("recentMemes") || "[]"
                    );
                    const updated = [newMeme, ...existing].slice(0, 12);
                    localStorage.setItem("recentMemes", JSON.stringify(updated));
                    setRecentMemes(updated);

                    if (!firstResponseReceived) {
                      firstResponseReceived = true;
                      setIsLoading(false);
                    }
                  } else if (data.type === "error") {
                    setLoadingStates((prev) =>
                      prev.map((state) =>
                        state.index === index
                          ? {
                              ...state,
                              steps: [
                                ...state.steps,
                                `Error: ${data.message}`,
                              ],
                              isComplete: true,
                            }
                          : state
                      )
                    );
                    setActiveSessions((prev) => Math.max(0, prev - 1));
                  }
                } catch {
                  // Not valid JSON, skip
                }
              }
            }
          })
          .catch((error) => {
            console.error(`Error in session ${index}:`, error);
            setActiveSessions((prev) => Math.max(0, prev - 1));
            setLoadingStates((prev) =>
              prev.map((state) =>
                state.index === index
                  ? {
                      ...state,
                      steps: [...state.steps, "Connection error"],
                      isComplete: true,
                    }
                  : state
              )
            );
          })
      );

    try {
      await Promise.all(apiCalls);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
      setMessage("");
      setAllSessionsComplete(true);
    }
  };

  return (
    <div className="p-6 pb-28 sm:p-16 sm:pb-28">
      <main className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
          {/* Left column - Header */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-16">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-wider text-[#1a1b1e] dark:text-white leading-tight">
              WELCOME TO
              <br />
              <span className="flex items-start">
                <Link href="https://www.tinyfish.ai" target="_blank">
                  <Logo className="h-8 sm:h-12 w-8 sm:w-12 mr-1 text-[#1a1b1e] dark:text-white mt-1" />
                </Link>
                RAINROTTER
              </span>
              <span className="block">GENERATOR</span>
            </h1>

            <MemeCounter />

            {!isMobile && (
              <StreamViewer
                streamingUrls={streamingUrls}
                activeSessions={activeSessions}
              />
            )}

            {/* How it works section */}
            <div className="mt-8 hidden lg:block">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                How it works
              </h3>
              <div className="space-y-3">
                {[
                  "Type anything you want to say",
                  "TinyFish agents browse imgflip.com",
                  "AI picks the perfect meme template",
                  "Captions are auto-filled and meme is generated",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#EF3604]/10 text-[#EF3604] flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Generator */}
          <div className="w-full lg:w-1/2">
            {/* Input section */}
            <div className="mb-4">
              <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300">
                Have something to say?
                <br />
                <span className="text-gray-500 dark:text-gray-400">
                  We&apos;ll make memes from it
                </span>
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type anything..."
                className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EF3604] focus:border-transparent transition-shadow duration-200"
                disabled={isLoading || !allSessionsComplete}
              />
              <motion.button
                type="submit"
                disabled={!message.trim() || isLoading || !allSessionsComplete}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="bg-[#EF3604] px-6 py-2.5 rounded-lg font-bold text-white hover:opacity-90 transition-all duration-200 border-2 border-[#1a1b1e]/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-[4px_4px_0px_#1a1b1e] hover:shadow-none active:translate-x-1 active:translate-y-1 hover:bg-[#FF4B1F]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span className="flex items-center justify-center gap-2">
                  GENERATE
                  {isHovered && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      ⚡
                    </motion.span>
                  )}
                </motion.span>
              </motion.button>
            </form>

            <GenerationInfo isVisible={isLoading} />

            {/* Progress bar */}
            <div className="mt-8 w-full">
              <MemeProgress
                current={successfulMemes}
                total={MAX_CONCURRENT_MEMES}
              />
            </div>

            {/* Mobile stream viewer */}
            {isMobile && (
              <StreamViewer
                streamingUrls={streamingUrls}
                activeSessions={activeSessions}
              />
            )}

            {/* Loading skeletons */}
            {isLoading && (
              <div className="mt-6 w-full">
                <div className="grid grid-cols-2 gap-4">
                  {loadingStates.map((state) => (
                    <MemeSkeleton
                      key={`loading-${state.index}`}
                      steps={state.steps}
                      index={state.index}
                      streamingUrl={state.streamingUrl}
                      isComplete={state.isComplete}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {!isLoading && memes.length > 0 && (
              <>
                <div className="mt-8 mb-4 text-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Results for: &quot;{submittedQuery}&quot;
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  {memes.map((meme, i) => (
                    <MemeCard
                      key={`${meme.index}-${i}`}
                      imageUrl={meme.imageUrl}
                      templateName={meme.templateName}
                      index={i}
                      total={MAX_CONCURRENT_MEMES}
                    />
                  ))}
                  {/* Show remaining skeletons for still-loading memes */}
                  {Array(MAX_CONCURRENT_MEMES)
                    .fill(null)
                    .map((_, i) => {
                      if (memes.find((m) => m.index === i)) return null;
                      return (
                        <MemeSkeleton
                          key={`remaining-${i}`}
                          steps={loadingStates[i]?.steps || []}
                          index={i}
                          streamingUrl={loadingStates[i]?.streamingUrl}
                          isComplete={loadingStates[i]?.isComplete}
                        />
                      );
                    })}
                </div>
              </>
            )}

            {/* Recent memes */}
            <RecentlyGenerated recentMemes={recentMemes} />
          </div>
        </div>
      </main>
      <StickyFooter />
    </div>
  );
}
