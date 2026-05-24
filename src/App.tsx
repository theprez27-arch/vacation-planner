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
  const [activeTab, setActiveTab] = useState<"reasoning" | "itinerary">("reasoning");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [steps]);

  async function handlePlan() {
    if (!input.trim() || isRunning) return;
    setSteps([]);
    setItinerary("");
    setIsRunning(true);
    setActiveTab("reasoning");

    try {
      await runRoadTripPlanner(input, (step) => {
        setSteps(prev => [...prev, step]);
        if (step.type === "done") {
          setItinerary(step.itinerary);
          setActiveTab("itinerary");
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
      height: "100dvh",
      display: "flex",
      flexDirection: "column",
      background: "#11111b",
      fontFamily: "system-ui, sans-serif"
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px",
        background: "#1e1e2e",
        borderBottom: "1px solid #313244",
        display: "flex",
        alignItems: "center",
        gap: "10px"
      }}>
        <span style={{ fontSize: "22px" }}>🚗</span>
        <div>
          <h1 style={{ margin: 0, color: "#cdd6f4", fontSize: "17px" }}>
            Weekend Road Trip Planner
          </h1>
          <p style={{ margin: 0, color: "#6c7086", fontSize: "12px" }}>
            Powered by Claude AI
          </p>
        </div>
      </div>

      {/* Input bar */}
      <div style={{
        padding: "12px 16px",
        background: "#181825",
        borderBottom: "1px solid #313244",
        display: "flex",
        gap: "8px"
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handlePlan()}
          placeholder="e.g. Trip from Detroit, love hiking, budget $500"
          style={{
            flex: 1,
            padding: "10px 12px",
            background: "#1e1e2e",
            border: "1px solid #313244",
            borderRadius: "8px",
            color: "#cdd6f4",
            fontSize: "14px",
            outline: "none",
            minWidth: 0
          }}
        />
        <button
          onClick={handlePlan}
          disabled={isRunning || !input.trim()}
          style={{
            padding: "10px 16px",
            background: isRunning ? "#313244" : "#89b4fa",
            color: isRunning ? "#6c7086" : "#11111b",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: isRunning ? "not-allowed" : "pointer",
            whiteSpace: "nowrap"
          }}
        >
          {isRunning ? "Planning..." : "Plan Trip"}
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        background: "#181825",
        borderBottom: "1px solid #313244"
      }}>
        <button
          onClick={() => setActiveTab("reasoning")}
          style={{
            flex: 1,
            padding: "10px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "reasoning"
              ? "2px solid #89b4fa"
              : "2px solid transparent",
            color: activeTab === "reasoning" ? "#89b4fa" : "#6c7086",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          AGENT REASONING
          {isRunning && " ⏳"}
        </button>
        <button
          onClick={() => setActiveTab("itinerary")}
          style={{
            flex: 1,
            padding: "10px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "itinerary"
              ? "2px solid #a6e3a1"
              : "2px solid transparent",
            color: activeTab === "itinerary" ? "#a6e3a1" : "#6c7086",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          YOUR ITINERARY
          {itinerary && " ✅"}
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {activeTab === "reasoning" ? (
          <div style={{ height: "100%", overflowY: "auto" }}>
            <ChatPanel steps={steps} isRunning={isRunning} />
            <div ref={chatBottomRef} />
          </div>
        ) : (
          <div style={{ height: "100%", overflowY: "auto" }}>
            <ItineraryPanel itinerary={itinerary} />
          </div>
        )}
      </div>
    </div>
  );
}
