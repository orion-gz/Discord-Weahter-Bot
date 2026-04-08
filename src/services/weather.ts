import axios from 'axios';

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  emoji: string;
}

function getWeatherEmoji(iconCode: string): string {
  const code = iconCode.replace(/[dn]$/, '');
  const emojiMap: Record<string, string> = {
    '01': '☀️',
    '02': '⛅',
    '03': '☁️',
    '04': '☁️',
    '09': '🌧️',
    '10': '🌦️',
    '11': '⛈️',
    '13': '❄️',
    '50': '🌫️',
  };
  return emojiMap[code] || '🌡️';
}

export async function getCurrentWeather(city: string): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENWEATHER_API_KEY 환경변수가 설정되지 않았습니다.');
  }

  const url = 'https://api.openweathermap.org/data/2.5/weather';

  try {
    const response = await axios.get(url, {
      params: {
        q: city,
        appid: apiKey,
        units: 'metric',
        lang: 'kr',
      },
    });

    const data = response.data;
    const iconCode: string = data.weather[0].icon;

    return {
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      icon: iconCode,
      emoji: getWeatherEmoji(iconCode),
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`'${city}' 도시를 찾을 수 없습니다. 영문 도시명으로 다시 시도해주세요.`);
      }
      if (error.response?.status === 401) {
        throw new Error('OpenWeatherMap API 키가 유효하지 않습니다.');
      }
    }
    throw new Error('날씨 정보를 불러오는 중 오류가 발생했습니다.');
  }
}
