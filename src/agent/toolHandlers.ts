import { getRealWeatherForecast } from "./weatherApi";
import { getRealDriveTime } from "./mapsApi";

export async function handleToolCall(name: string, input: any): Promise<any> {
  await new Promise(r => setTimeout(r, 800));

  switch (name) {
    case "get_drive_time":
      return await getRealDriveTime(input.origin, input.destination);

    case "search_activities":
      return {
        destination: input.destination,
        activities: [
          {
            name: "Sleeping Bear Dunes National Lakeshore",
            type: "outdoor",
            description: "Massive sand dunes overlooking Lake Michigan with incredible views.",
            cost_per_person: 20,
            recommended_duration: "3-4 hours"
          },
          {
            name: "Crystal River Kayaking",
            type: "outdoor",
            description: "Paddle a crystal clear river through the woods. Rentals available.",
            cost_per_person: 45,
            recommended_duration: "2-3 hours"
          },
          {
            name: "Local State Park Trails",
            type: "hiking",
            description: "Well marked trails through forests and along scenic overlooks.",
            cost_per_person: 10,
            recommended_duration: "2 hours"
          }
        ]
      };

    case "search_dining":
      return {
        destination: input.destination,
        restaurants: [
          {
            name: "The Riverside Grille",
            cuisine: "American/Seafood",
            price_range: "$$",
            rating: 4.6,
            must_try: "Whitefish tacos"
          },
          {
            name: "Joe's Diner",
            cuisine: "Classic American",
            price_range: "$",
            rating: 4.3,
            must_try: "Breakfast skillet"
          },
          {
            name: "Moomers Homemade Ice Cream",
            cuisine: "Dessert",
            price_range: "$",
            rating: 4.8,
            must_try: "Seasonal fruit flavors"
          }
        ]
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
