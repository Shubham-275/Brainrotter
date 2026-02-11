const ENDPOINT = "https://agent.tinyfish.ai/v1/automation/run-sse";

export interface TinyFishCallbacks {
  onStreamingUrl?: (url: string) => void;
  onStep?: (step: string) => void;
  onComplete?: (resultJson: Record<string, unknown>) => void;
  onError?: (error: string) => void;
}

export async function runTinyFishAgent(
  url: string,
  goal: string,
  apiKey: string,
  callbacks?: TinyFishCallbacks
): Promise<Record<string, unknown> | null> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, goal }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    callbacks?.onError?.(`TinyFish API error: ${response.status} - ${errorText}`);
    return null;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks?.onError?.("No response stream available");
    return null;
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
          callbacks?.onStreamingUrl?.(data.streamingUrl);
          callbacks?.onStep?.("Browser session started - agent is navigating...");
        } else if (data.type === "STEP" && data.message) {
          callbacks?.onStep?.(data.message);
        } else if (data.type === "COMPLETE") {
          result = data.resultJson ?? null;
          callbacks?.onComplete?.(data.resultJson);
        } else if (data.type === "ERROR") {
          callbacks?.onError?.(data.message || "Unknown error");
        }
      } catch {
        // Not valid JSON, skip
      }
    }
  }

  return result;
}
