export interface WeatherCity {
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

export const weatherData: WeatherCity[] = [
  {
    city: "Kathmandu",
    country: "NP",
    tempC: 18,
    tempF: 64,
    condition: "Partly Cloudy",
    icon: "partly-cloudy",
    humidity: 62,
    wind: 11,
    high: 22,
    low: 12,
  },
  {
    city: "New York",
    country: "US",
    tempC: 11,
    tempF: 52,
    condition: "Rainy",
    icon: "rainy",
    humidity: 78,
    wind: 23,
    high: 14,
    low: 8,
  },
  {
    city: "London",
    country: "GB",
    tempC: 9,
    tempF: 48,
    condition: "Overcast",
    icon: "cloudy",
    humidity: 83,
    wind: 18,
    high: 12,
    low: 6,
  },
  {
    city: "Tokyo",
    country: "JP",
    tempC: 16,
    tempF: 61,
    condition: "Sunny",
    icon: "sunny",
    humidity: 45,
    wind: 9,
    high: 19,
    low: 13,
  },
  {
    city: "Sydney",
    country: "AU",
    tempC: 23,
    tempF: 73,
    condition: "Clear",
    icon: "partly-cloudy",
    humidity: 55,
    wind: 15,
    high: 26,
    low: 19,
  },
  {
    city: "Dubai",
    country: "AE",
    tempC: 34,
    tempF: 93,
    condition: "Hot & Sunny",
    icon: "sunny",
    humidity: 38,
    wind: 14,
    high: 37,
    low: 28,
  },
];
