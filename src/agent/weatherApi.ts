export async function getRealWeatherForecast(
  destination: string,
  start_date: string,
  end_date: string
) {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

  // Strip state abbreviations and clean up the location name
  const cleanDestination = destination
    .replace(/,\s*[A-Z]{2}$/, "")  // remove ", MI" style suffixes
    .trim();

  // Step 1: Convert city name to coordinates
  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cleanDestination)}&limit=5&appid=${apiKey}`;
  const geoRes = await fetch(geoUrl);
  const geoData = await geoRes.json();

  if (!geoData || geoData.length === 0) {
    // Return a friendly fallback instead of crashing
    return {
      destination: destination,
      note: "Weather data unavailable for this location, but plan looks great!",
      forecast: [
        {
          date: start_date,
          condition: "Check local forecast",
          high_f: null,
          low_f: null,
          precipitation_chance: null
        },
        {
          date: end_date,
          condition: "Check local forecast",
          high_f: null,
          low_f: null,
          precipitation_chance: null
        }
      ]
    };
  }

  const { lat, lon, name, state } = geoData[0];

  // Step 2: Get 5-day forecast using coordinates
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
  const forecastRes = await fetch(forecastUrl);
  const forecastData = await forecastRes.json();

  // Step 3: Filter forecast to just the dates we care about
  const startMs = new Date(start_date).getTime();
  const endMs = new Date(end_date).getTime() + 86400000;

  const relevantForecasts = forecastData.list.filter((item: any) => {
    const itemMs = item.dt * 1000;
    return itemMs >= startMs && itemMs <= endMs;
  });

  // If no forecasts in range, just use the first available days
  const forecastSource = relevantForecasts.length > 0
    ? relevantForecasts
    : forecastData.list.slice(0, 8);

  // Step 4: Summarize by day
  const byDay: Record<string, any[]> = {};
  for (const item of forecastSource) {
    const date = new Date(item.dt * 1000).toISOString().split("T")[0];
    if (!byDay[date]) byDay[date] = [];
    byDay[date].push(item);
  }

  const forecast = Object.entries(byDay).map(([date, items]) => {
    const highs = items.map((i: any) => i.main.temp_max);
    const lows = items.map((i: any) => i.main.temp_min);
    const conditions = items.map((i: any) => i.weather[0].main);
    const rain = items.some((i: any) =>
      i.weather[0].main.toLowerCase().includes("rain")
    );

    return {
      date,
      condition: conditions[Math.floor(conditions.length / 2)],
      high_f: Math.round(Math.max(...highs)),
      low_f: Math.round(Math.min(...lows)),
      precipitation_chance: rain ? 70 : 10
    };
  });

  return {
    destination: `${name}${state ? ", " + state : ""}`,
    coordinates: { lat, lon },
    forecast
  };
}
