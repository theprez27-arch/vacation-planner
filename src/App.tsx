import { useState, useRef, useEffect } from "react";
import { runRoadTripPlanner } from "./agent/planner";
import type { AgentStep } from "./agent/planner";
import ChatPanel from "./components/ChatPanel";
import ItineraryPanel from "./components/ItineraryPanel";

export default function App() {
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [itinerary, setItinerary] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [steps]);

  async function handlePlan() {
    if (!input.trim() || isRunning) return;
    setSteps([]);
    setItinerary("");
    setIsRunning(true);

    try {
      await runRoadTripPlanner(input, (step) => {
        setSteps(prev => [...prev, step]);
        if (step.type === "done") {
          setItinerary(step.itinerary);
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#11111b",
      fontFamily: "system-ui, sans-serif"
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 24px",
        background: "#1e1e2e",
        borderBottom: "1px solid #313244",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}>
        <span style={{ fontSize: "24px" }}>🚗</span>
        <div>
          <h1 style={{ margin: 0, color: "#cdd6f4", fontSize: "20px" }}>
            Weekend Road Trip Planner
          </h1>
          <p style={{ margin: 0, color: "#6c7086", fontSize: "13px" }}>
            Powered by Claude AI
          </p>
        </div>
      </div>

      {/* Input bar */}
      <div style={{
        padding: "16px 24px",
        background: "#181825",
        borderBottom: "1px solid #313244",
        display: "flex",
        gap: "12px"
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handlePlan()}
          placeholder="e.g. Weekend trip from Detroit, I love hiking and good food, budget $500"
          style={{
            flex: 1,
            padding: "12px 16px",
            background: "#1e1e2e",
            border: "1px solid #313244",
            borderRadius: "8px",
            color: "#cdd6f4",
            fontSize: "15px",
            outline: "none"
          }}
        />
        <button
          onClick={handlePlan}
          disabled={isRunning || !input.trim()}
          style={{
            padding: "12px 24px",
            background: isRunning ? "#313244" : "#89b4fa",
            color: isRunning ? "#6c7086" : "#11111b",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: 600,
            cursor: isRunning ? "not-allowed" : "pointer"
          }}
        >
          {isRunning ? "Planning..." : "Plan My Trip"}
        </button>
      </div>

      {/* Main panels */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        overflow: "hidden"
      }}>
        {/* Left: Agent reasoning */}
        <div style={{ borderRight: "1px solid #313244", overflow: "hidden" }}>
          <div style={{
            padding: "12px 16px",
            background: "#181825",
            borderBottom: "1px solid #313244",
            color: "#89b4fa",
            fontSize: "13px",
            fontWeight: 600
          }}>
            AGENT REASONING
          </div>
          <ChatPanel steps={steps} isRunning={isRunning} />
          <div ref={chatBottomRef} />
        </div>

        {/* Right: Itinerary */}
        <div style={{ overflow: "hidden" }}>
          <div style={{
            padding: "12px 16px",
            background: "#181825",
            borderBottom: "1px solid #313244",
            color: "#a6e3a1",
            fontSize: "13px",
            fontWeight: 600
          }}>
            YOUR ITINERARY
          </div>
          <ItineraryPanel itinerary={itinerary} />
        </div>
      </div>
    </div>
  );
}
