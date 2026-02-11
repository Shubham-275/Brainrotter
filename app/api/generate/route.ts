import { NextRequest } from "next/server";
import { MEME_SOURCES } from "../../config/constants";

export const maxDuration = 300;

const TINYFISH_ENDPOINT = "https://agent.tinyfish.ai/v1/automation/run-sse";

export async function POST(req: NextRequest) {
  const { message, sourceType = 0 } = await req.json();

  if (!message || typeof message !== "string") {
    return new Response(JSON.stringify({ error: "Message is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.TINYFISH_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "TINYFISH_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const source = MEME_SOURCES[sourceType] || MEME_SOURCES[0];

  const goal = `You are on the imgflip meme templates page. Your task:

1. Look at the meme templates on the page. Find a template that would work well with the message "${message}". Pick one that is relevant, funny, and fits the context.
2. Click on "Add Caption" for the template you think is the best match.
3. You are now on the meme caption editor page. Based on the message "${message}", fill in the text boxes with appropriate captions that relate to the meme template format. Understand the meme format and fill in the text boxes accordingly. Be creative and funny.
4. Click the "Generate Meme" button.
5. After the meme is generated, find the image URL. Look for an input field inside a container with class "img-code-wrap" - copy the value from the first input field there.

Return the result as JSON with this structure:
{
  "imageUrl": "the direct URL to the generated meme image",
  "templateName": "the name of the meme template used"
}`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        send({ type: "step", message: "Starting meme generation..." });
        send({
          type: "step",
          message: `Browsing ${source.name} for the perfect template...`,
        });

        const response = await fetch(TINYFISH_ENDPOINT, {
          method: "POST",
          headers: {
            "X-API-Key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: source.url, goal }),
        });

        if (!response.ok) {
          send({
            type: "error",
            message: `TinyFish API error: ${response.status}`,
          });
          controller.close();
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          send({ type: "error", message: "No response stream" });
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let result: Record<string, unknown> | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;

            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "STREAMING_URL" && data.streamingUrl) {
                send({
                  type: "streamingUrl",
                  url: data.streamingUrl,
                });
                send({
                  type: "step",
                  message: "Browser session started - agent is working...",
                });
              } else if (data.type === "COMPLETE") {
                result = data.resultJson ?? null;
              }
            } catch {
              // Not valid JSON, skip
            }
          }
        }

        if (result) {
          // Try to normalize the image URL
          let imageUrl = (result.imageUrl as string) || "";
          const templateName =
            (result.templateName as string) || "Unknown Template";

          // Convert imgflip page URLs to direct image URLs
          imageUrl = imageUrl.replace(
            /^https?:\/\/imgflip\.com\/i\/([a-zA-Z0-9]+)$/,
            "https://i.imgflip.com/$1.jpg"
          );

          send({
            type: "complete",
            index: sourceType,
            imageUrl,
            templateName,
          });

          // Increment counter
          try {
            const baseUrl =
              process.env.PRODUCTION_URL || "http://localhost:3000";
            await fetch(`${baseUrl}/api/meme-count`, { method: "POST" });
          } catch {
            // Counter increment is non-critical
          }
        } else {
          send({
            type: "error",
            message: "Failed to generate meme - no result returned",
          });
        }
      } catch (error) {
        send({
          type: "error",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
