export async function getRealDriveTime(
  origin: string,
  destination: string
) {
  // Step 1: Geocode origin
  const originGeo = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(origin)}&format=json&limit=1`,
    { headers: { "User-Agent": "vacation-planner-app" } }
  );
  const originData = await originGeo.json();

  // Step 2: Geocode destination
  const destGeo = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`,
    { headers: { "User-Agent": "vacation-planner-app" } }
  );
  const destData = await destGeo.json();

  if (!originData.length || !destData.length) {
    return {
      origin,
      destination,
      drive_time: "Unknown",
      distance_miles: null,
      error: "Could not geocode one or both locations"
    };
  }

  const originCoords = `${originData[0].lon},${originData[0].lat}`;
  const destCoords = `${destData[0].lon},${destData[0].lat}`;

  // Step 3: Get route from OSRM
  const routeRes = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${originCoords};${destCoords}?overview=false`
  );
  const routeData = await routeRes.json();

  if (routeData.code !== "Ok" || !routeData.routes.length) {
    return {
      origin,
      destination,
      drive_time: "Unknown",
      distance_miles: null,
      error: "Could not calculate route"
    };
  }

  const route = routeData.routes[0];
  const distanceMiles = Math.round(route.distance / 1609.34);
  const durationMinutes = Math.round(route.duration / 60);
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const driveTime = hours > 0
    ? `${hours} hr ${minutes} min`
    : `${minutes} min`;

  return {
    origin,
    destination,
    drive_time: driveTime,
    distance_miles: distanceMiles,
    distance_text: `${distanceMiles} miles`,
    route_summary: `Drive from ${origin} to ${destination}`
  };
}
