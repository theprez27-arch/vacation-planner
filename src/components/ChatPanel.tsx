import type { AgentStep } from "../agent/planner";
interface Props {
  steps: AgentStep[];
  isRunning: boolean;
}

export default function ChatPanel({ steps, isRunning }: Props) {
  return (
    <div style={{
      height: "100%",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      padding: "16px"
    }}>
      {steps.map((step, i) => {
        if (step.type === "thinking") {
          return (
            <div key={i} style={{
              background: "#1e1e2e",
              border: "1px solid #313244",
              borderRadius: "8px",
              padding: "12px",
              color: "#cdd6f4",
              fontSize: "14px",
              lineHeight: "1.6"
            }}>
              <div style={{ color: "#89b4fa", fontWeight: 600, marginBottom: "6px" }}>
                🧠 Claude is thinking...
              </div>
              {step.text}
            </div>
          );
        }

        if (step.type === "tool_call") {
          return (
            <div key={i} style={{
              background: "#1e1e2e",
              border: "1px solid #f38ba8",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "13px"
            }}>
              <div style={{ color: "#f38ba8", fontWeight: 600, marginBottom: "6px" }}>
                🔧 Calling tool: {step.name}
              </div>
              <pre style={{
                color: "#a6e3a1",
                margin: 0,
                fontSize: "12px",
                overflowX: "auto"
              }}>
                {JSON.stringify(step.input, null, 2)}
              </pre>
            </div>
          );
        }

        if (step.type === "tool_result") {
          return (
            <div key={i} style={{
              background: "#1e1e2e",
              border: "1px solid #a6e3a1",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "13px"
            }}>
              <div style={{ color: "#a6e3a1", fontWeight: 600, marginBottom: "6px" }}>
                ✅ Result from: {step.name}
              </div>
              <pre style={{
                color: "#cdd6f4",
                margin: 0,
                fontSize: "12px",
                overflowX: "auto"
              }}>
                {JSON.stringify(step.result, null, 2)}
              </pre>
            </div>
          );
        }

        return null;
      })}

      {isRunning && (
        <div style={{
          color: "#89b4fa",
          fontSize: "14px",
          padding: "12px",
          animation: "pulse 1.5s infinite"
        }}>
          ⏳ Agent is working...
        </div>
      )}
    </div>
  );
}
