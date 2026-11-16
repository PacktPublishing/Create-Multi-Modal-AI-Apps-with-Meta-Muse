const DAILY = 'temperature_2m_max,temperature_2m_min,precipitation_probability_max';

export const weatherTool = {
  type: 'function',
  name: 'get_weather',
  description: 'Get the 7-day weather forecast for a city.',
  parameters: {
    type: 'object',
    properties: {
      city: { type: 'string', description: 'City name, for example Lisbon' },
    },
    required: ['city'],
    additionalProperties: false,
  },
  strict: true,
};

export async function getWeather(city) {
  const geoUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
  geoUrl.searchParams.set('name', city);
  geoUrl.searchParams.set('count', 1);
  const geo = await (await fetch(geoUrl)).json();
  const place = geo.results?.[0];
  if (!place) return { error: `No forecast found for ${city}` };

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', place.latitude);
  url.searchParams.set('longitude', place.longitude);
  url.searchParams.set('daily', DAILY);
  url.searchParams.set('timezone', 'auto');
  const { daily } = await (await fetch(url)).json();

  return {
    city: place.name,
    days: daily.time.map((date, i) => ({
      date,
      high: daily.temperature_2m_max[i],
      low: daily.temperature_2m_min[i],
      rainChance: daily.precipitation_probability_max[i],
    })),
  };
}
