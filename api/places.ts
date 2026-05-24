import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { query, location, type } = req.query;
  const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;

  // Step 1: Geocode the location to get coordinates
  const geoRes = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location as string)}&key=${apiKey}`
  );
  const geoData = await geoRes.json();

  if (!geoData.results.length) {
    return res.status(404).json({ error: "Location not found" });
  }

  const { lat, lng } = geoData.results[0].geometry.location;

  // Step 2: Search for places nearby
  const placesRes = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query as string)}&location=${lat},${lng}&radius=20000&key=${apiKey}`
  );
  const placesData = await placesRes.json();

  // Step 3: Return top 3 results cleaned up
  const results = placesData.results.slice(0, 3).map((place: any) => ({
    name: place.name,
    address: place.formatted_address,
    rating: place.rating,
    total_ratings: place.user_ratings_total,
    types: place.types,
    open_now: place.opening_hours?.open_now ?? null,
    price_level: place.price_level ?? null
  }));

  res.status(200).json({ results, location: { lat, lng } });
}