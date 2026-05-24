import Anthropic from "@anthropic-ai/sdk";
import { tools } from "./tools";
import { handleToolCall } from "./toolHandlers";

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true
});

const SYSTEM_PROMPT = `You are an expert weekend road trip planner for the United States.
When a user describes their ideal trip you:
1. Check drive time first — keep it under 4 hours each way
2. Check the weather forecast for the destination and dates
3. Search for activities based on their interests
4. Find great dining spots at the destination
5. Check the total cost against their budget — if it doesn't fit, adjust

Always think step by step and explain what you are doing before each tool call.
At the end produce a clear day-by-day itinerary covering Saturday and Sunday with
activities, dining recommendations, drive info, estimated costs, and packing tips.
No lodging needed — this is a day trip style weekend adventure.`;

export type AgentStep =
  | { type: "thinking"; text: string }
  | { type: "tool_call"; name: string; input: any }
  | { type: "tool_result"; name: string; result: any }
  | { type: "done"; itinerary: string };

export async function runRoadTripPlanner(
  userRequest: string,
  onStep: (step: AgentStep) => void
): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userRequest }
  ];

  while (true) {
    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: tools as any,
      messages
    });

    // Send each content block to the UI as it comes in
    for (const block of response.content) {
      if (block.type === "text" && block.text.trim()) {
        onStep({ type: "thinking", text: block.text });
      } else if (block.type === "tool_use") {
        onStep({ type: "tool_call", name: block.name, input: block.input });
      }
    }

    // Agent is finished — return the final itinerary
    if (response.stop_reason === "end_turn") {
      const finalText = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map(b => b.text)
        .join("");
      onStep({ type: "done", itinerary: finalText });
      return finalText;
    }

    // Agent made tool calls — execute them and feed results back
    if (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );

      const toolResults = await Promise.all(
        toolUseBlocks.map(async (block) => {
          const result = await handleToolCall(block.name, block.input);
          onStep({ type: "tool_result", name: block.name, result });
          return {
            type: "tool_result" as const,
            tool_use_id: block.id,
            content: JSON.stringify(result)
          };
        })
      );

      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: toolResults });
    }
  }
}
