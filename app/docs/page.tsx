import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs - Brainrotter",
  description: "Documentation for setting up and running Brainrotter.",
};

export default function DocsPage() {
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
          Documentation
        </h1>

        <div className="space-y-8 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-[#1a1b1e] dark:text-white mb-3">
              Getting Started
            </h2>
            <p className="mb-4">
              Follow these steps to run Brainrotter locally:
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-[#1a1b1e] dark:text-white mb-2">
                  1. Clone the repository
                </h3>
                <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto">
                  <code>git clone https://github.com/your-repo/brainrotter.git{"\n"}cd brainrotter</code>
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[#1a1b1e] dark:text-white mb-2">
                  2. Install dependencies
                </h3>
                <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto">
                  <code>npm install</code>
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[#1a1b1e] dark:text-white mb-2">
                  3. Set up environment variables
                </h3>
                <p className="mb-2">
                  Create a <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">.env.local</code> file in the project root:
                </p>
                <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto">
                  <code>{`# Required: Get your API key from https://www.tinyfish.ai
TINYFISH_API_KEY=your_api_key_here

# Optional: Set for production deployment
PRODUCTION_URL=https://your-domain.com`}</code>
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[#1a1b1e] dark:text-white mb-2">
                  4. Run the development server
                </h3>
                <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto">
                  <code>npm run dev</code>
                </pre>
                <p className="mt-2">
                  Open{" "}
                  <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                    http://localhost:3000
                  </code>{" "}
                  in your browser.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1a1b1e] dark:text-white mb-3">
              Environment Variables
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 pr-4 font-medium">Variable</th>
                    <th className="text-left py-2 pr-4 font-medium">Required</th>
                    <th className="text-left py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 pr-4">
                      <code className="text-[#EF3604]">TINYFISH_API_KEY</code>
                    </td>
                    <td className="py-2 pr-4">Yes</td>
                    <td className="py-2">
                      Your TinyFish API key for web agent automation
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 pr-4">
                      <code className="text-[#EF3604]">PRODUCTION_URL</code>
                    </td>
                    <td className="py-2 pr-4">No</td>
                    <td className="py-2">
                      Production URL for the meme counter API
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1a1b1e] dark:text-white mb-3">
              API Routes
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-[#1a1b1e] dark:text-white mb-1">
                  POST /api/generate
                </h3>
                <p className="text-sm mb-2">
                  Generate a meme from a text message. Returns a Server-Sent
                  Events stream with progress updates and the final result.
                </p>
                <pre className="bg-gray-100 dark:bg-gray-800 rounded p-3 text-xs overflow-x-auto">
                  <code>{`// Request body
{ "message": "your text here", "sourceType": 0 }

// SSE events
data: { "type": "step", "message": "..." }
data: { "type": "streamingUrl", "url": "..." }
data: { "type": "complete", "index": 0, "imageUrl": "...", "templateName": "..." }
data: { "type": "error", "message": "..." }`}</code>
                </pre>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-[#1a1b1e] dark:text-white mb-1">
                  GET /api/meme-count
                </h3>
                <p className="text-sm">
                  Returns the total number of memes generated.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-[#1a1b1e] dark:text-white mb-1">
                  POST /api/meme-count
                </h3>
                <p className="text-sm">Increments the meme counter by 1.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1a1b1e] dark:text-white mb-3">
              Project Structure
            </h2>
            <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto">
              <code>{`brainrotter/
├── app/
│   ├── api/
│   │   ├── generate/route.ts    # Meme generation (TinyFish)
│   │   └── meme-count/route.ts  # Meme counter
│   ├── about/page.tsx           # About page
│   ├── docs/page.tsx            # Documentation
│   ├── faq/page.tsx             # FAQ
│   ├── components/              # React components
│   ├── config/constants.ts      # Configuration
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── lib/
│   ├── tinyfish.ts              # TinyFish API helper
│   └── utils.ts                 # Utility functions
└── public/                      # Static assets`}</code>
            </pre>
          </section>
        </div>
      </main>
    </div>
  );
}
