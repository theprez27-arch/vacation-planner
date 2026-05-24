import { getRealWeatherForecast } from "./weatherApi";
import { getRealDriveTime } from "./mapsApi";

async function callPlacesAPI(query: string, location: string) {
  const res = await fetch(
    `/api/places?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`
  );
  const data = await res.json();
  return data.results;
}

export async function handleToolCall(name: string, input: any): Promise<any> {
  await new Promise(r => setTimeout(r, 800));

  switch (name) {
    case "get_drive_time":
      return await getRealDriveTime(input.origin, input.destination);

    case "search_activities":
      const activityQuery = `${input.interests?.join(" ")} activities attractions ${input.destination}`;
      const activities = await callPlacesAPI(activityQuery, input.destination);
      return {
        destination: input.destination,
        activities: activities.map((p: any) => ({
          name: p.name,
          address: p.address,
          rating: p.rating,
          total_ratings: p.total_ratings,
          cost_estimate: p.price_level
            ? "$".repeat(p.price_level)
            : "Free or varies",
          open_now: p.open_now
        }))
      };

    case "search_dining":
      const diningQuery = `${input.cuisine_preference || "restaurants"} ${input.destination}`;
      const dining = await callPlacesAPI(diningQuery, input.destination);
      return {
        destination: input.destination,
        restaurants: dining.map((p: any) => ({
          name: p.name,
          address: p.address,
          rating: p.rating,
          total_ratings: p.total_ratings,
          price_range: p.price_level
            ? "$".repeat(p.price_level)
            : "Unknown",
          open_now: p.open_now
        }))
      };

    case "get_weather_forecast":
      return await getRealWeatherForecast(
        input.destination,
        input.start_date,
        input.end_date
      );

    case "check_budget":
      const total = (input.gas_estimate || 0) +
                    (input.food_estimate || 0) +
                    (input.activities_total || 0);
      const remaining = input.total_budget - total;
      return {
        total_estimated_cost: total,
        total_budget: input.total_budget,
        remaining: remaining,
        fits_budget: remaining >= 0,
        breakdown: {
          gas: input.gas_estimate || 0,
          food: input.food_estimate || 0,
          activities: input.activities_total || 0
        }
      };

    default:
      return { error: `Unknown tool: ${name}` };
  }
}
