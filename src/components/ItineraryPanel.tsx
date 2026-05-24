interface Props {
  itinerary: string;
}

export default function ItineraryPanel({ itinerary }: Props) {
  if (!itinerary) {
    return (
      <div style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#6c7086",
        fontSize: "15px",
        textAlign: "center",
        padding: "32px"
      }}>
        Your road trip itinerary will appear here once the agent finishes planning.
      </div>
    );
  }

  return (
    <div style={{
      height: "100%",
      overflowY: "auto",
      padding: "24px",
      color: "#cdd6f4",
      fontSize: "15px",
      lineHeight: "1.8"
    }}>
      <h2 style={{ color: "#89b4fa", marginTop: 0 }}>🗺️ Your Road Trip Itinerary</h2>
      <div style={{ whiteSpace: "pre-wrap" }}>{itinerary}</div>
    </div>
  );
}
