export interface LiveWeatherCity {
  city: string;
  country: string;
  tempC: number;
  tempF: number;
  condition: string;
  icon: string;
  humidity: number;
  wind: number;
  high: number;
  low: number;
}

const CITIES = [
  { city: "Kathmandu", country: "NP", lat: 27.7172, lon: 85.324 },
  { city: "New York",  country: "US", lat: 40.7128, lon: -74.006 },
  { city: "London",    country: "GB", lat: 51.5074, lon: -0.1278 },
  { city: "Tokyo",     country: "JP", lat: 35.6762, lon: 139.6503 },
  { city: "Sydney",    country: "AU", lat: -33.8688, lon: 151.2093 },
  { city: "Dubai",     country: "AE", lat: 25.2048, lon: 55.2708 },
];

function wmoToCondition(code: number): { label: string; icon: string } {
  if (code === 0)                   return { label: "Clear Sky",       icon: "☀️" };
  if (code === 1)                   return { label: "Mainly Clear",    icon: "🌤️" };
  if (code === 2)                   return { label: "Partly Cloudy",   icon: "⛅" };
  if (code === 3)                   return { label: "Overcast",        icon: "☁️" };
  if (code === 45 || code === 48)   return { label: "Foggy",           icon: "🌫️" };
  if (code >= 51 && code <= 57)     return { label: "Drizzle",         icon: "🌦️" };
  if (code >= 61 && code <= 67)     return { label: "Rainy",           icon: "🌧️" };
  if (code >= 71 && code <= 77)     return { label: "Snowy",           icon: "🌨️" };
  if (code >= 80 && code <= 82)     return { label: "Rain Showers",    icon: "🌦️" };
  if (code === 85 || code === 86)   return { label: "Snow Showers",    icon: "🌨️" };
  if (code === 95)                  return { label: "Thunderstorm",    icon: "⛈️" };
  if (code === 96 || code === 99)   return { label: "Severe Storm",    icon: "⛈️" };
  return { label: "Unknown", icon: "🌡️" };
}

function cToF(c: number) {
  return Math.round((c * 9) / 5 + 32);
}

async function fetchOneCity(
  city: (typeof CITIES)[number]
): Promise<LiveWeatherCity> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${city.lat}&longitude=${city.lon}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
    `&daily=temperature_2m_max,temperature_2m_min` +
    `&timezone=auto&forecast_days=1`;

  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) throw new Error(`Weather fetch failed for ${city.city}`);
  const data = await res.json();

  const tempC    = Math.round(data.current.temperature_2m);
  const humidity = Math.round(data.current.relative_humidity_2m);
  const wind     = Math.round(data.current.wind_speed_10m);
  const code     = data.current.weather_code as number;
  const high     = Math.round(data.daily.temperature_2m_max[0]);
  const low      = Math.round(data.daily.temperature_2m_min[0]);
  const { label, icon } = wmoToCondition(code);

  return {
    city:      city.city,
    country:   city.country,
    tempC,
    tempF:     cToF(tempC),
    condition: label,
    icon,
    humidity,
    wind,
    high,
    low,
  };
}

export async function fetchWeatherAll(): Promise<LiveWeatherCity[]> {
  const results = await Promise.allSettled(CITIES.map(fetchOneCity));
  return results
    .filter((r): r is PromiseFulfilledResult<LiveWeatherCity> => r.status === "fulfilled")
    .map((r) => r.value);
}
