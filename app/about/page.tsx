import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - Brainrotter",
  description: "Learn about Brainrotter, the AI-powered meme generator.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen p-8 sm:p-16">
      <main className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="text-sm text-[#EF3604] hover:underline mb-8 inline-block"
        >
          &larr; Back to Generator
        </Link>

        <h1 className="text-4xl font-bold text-[#1a1b1e] dark:text-white mb-8">
          About Brainrotter
        </h1>

        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-[#1a1b1e] dark:text-white mb-3">
              What is Brainrotter?
            </h2>
            <p>
              Brainrotter is an AI-powered meme generator that takes any text
              input and automatically creates relevant, funny memes. Simply type
              what you want to say, and our AI agents will browse the web, find
              the perfect meme template, fill in witty captions, and generate
              your meme.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1a1b1e] dark:text-white mb-3">
              How does it work?
            </h2>
            <p>
              Brainrotter uses{" "}
              <a
                href="https://www.tinyfish.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#EF3604] hover:underline"
              >
                TinyFish
              </a>{" "}
              web agents to automate the entire meme creation process. When you
              submit a message:
            </p>
            <ol className="list-decimal list-inside mt-3 space-y-2 pl-4">
              <li>
                A TinyFish AI agent opens a browser and navigates to imgflip.com
              </li>
              <li>
                The agent analyzes trending meme templates and picks the best
                match for your message
              </li>
              <li>
                It fills in appropriate captions that match the meme format
              </li>
              <li>The meme is generated and the image is returned to you</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1a1b1e] dark:text-white mb-3">
              Technology Stack
            </h2>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>
                <strong>Next.js</strong> - React framework for the web
                application
              </li>
              <li>
                <strong>TinyFish</strong> - AI web agents for browser automation
              </li>
              <li>
                <strong>Tailwind CSS</strong> - Utility-first CSS framework
              </li>
              <li>
                <strong>Framer Motion</strong> - Animation library for smooth
                interactions
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1a1b1e] dark:text-white mb-3">
              Inspiration
            </h2>
            <p>
              Brainrotter is inspired by{" "}
              <a
                href="https://www.brainrot.run"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#EF3604] hover:underline"
              >
                brainrot.run
              </a>
              , the Browserbase meme generator built with Stagehand. Our version
              reimagines the concept using TinyFish web agents for the browser
              automation layer.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
