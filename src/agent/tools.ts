export const tools = [
  {
    name: "get_drive_time",
    description: "Get driving distance and time between two locations",
    input_schema: {
      type: "object",
      properties: {
        origin: { type: "string", description: "Starting city or address" },
        destination: { type: "string", description: "Destination city or address" }
      },
      required: ["origin", "destination"]
    }
  },
  {
    name: "search_activities",
    description: "Find outdoor activities, attractions and things to do at a destination",
    input_schema: {
      type: "object",
      properties: {
        destination: { type: "string" },
        interests: {
          type: "array",
          items: { type: "string" },
          description: "e.g. hiking, history, beaches, museums, nightlife"
        },
        budget_level: { type: "string", enum: ["budget", "moderate", "luxury"] }
      },
      required: ["destination", "interests"]
    }
  },
  {
    name: "search_dining",
    description: "Find restaurants and food spots at a destination",
    input_schema: {
      type: "object",
      properties: {
        destination: { type: "string" },
        cuisine_preference: { type: "string", description: "e.g. BBQ, seafood, local diners, craft beer" },
        budget_level: { type: "string", enum: ["budget", "moderate", "luxury"] }
      },
      required: ["destination"]
    }
  },
  {
    name: "get_weather_forecast",
    description: "Get weekend weather forecast for a destination",
    input_schema: {
      type: "object",
      properties: {
        destination: { type: "string" },
        start_date: { type: "string" },
        end_date: { type: "string" }
      },
      required: ["destination", "start_date", "end_date"]
    }
  },
  {
    name: "check_budget",
    description: "Calculate if the total road trip cost fits the user budget",
    input_schema: {
      type: "object",
      properties: {
        gas_estimate: { type: "number" },
        food_estimate: { type: "number" },
        activities_total: { type: "number" },
        total_budget: { type: "number" }
      },
      required: ["total_budget"]
    }
  }
]