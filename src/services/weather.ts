import axios from 'axios';

export interface HourlyForecast {
  hour: number;
  temperature: number;
  precipitationProbability: number;
  weatherCode: number;
}

export interface DailyForecast {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
  weatherCode: number;
}

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

const WMO_CODES: Record<number, { emoji: string; description: string }> = {
  0:  { emoji: '☀️',  description: '맑음' },
  1:  { emoji: '🌤️', description: '대체로 맑음' },
  2:  { emoji: '⛅',  description: '구름 조금' },
  3:  { emoji: '☁️',  description: '흐림' },
  45: { emoji: '🌫️', description: '안개' },
  48: { emoji: '🌫️', description: '안개' },
  51: { emoji: '🌦️', description: '가벼운 이슬비' },
  53: { emoji: '🌦️', description: '이슬비' },
  55: { emoji: '🌧️', description: '강한 이슬비' },
  61: { emoji: '🌧️', description: '가벼운 비' },
  63: { emoji: '🌧️', description: '비' },
  65: { emoji: '🌧️', description: '강한 비' },
  71: { emoji: '❄️',  description: '가벼운 눈' },
  73: { emoji: '❄️',  description: '눈' },
  75: { emoji: '❄️',  description: '강한 눈' },
  77: { emoji: '🌨️', description: '눈보라' },
  80: { emoji: '🌦️', description: '소나기' },
  81: { emoji: '🌧️', description: '강한 소나기' },
  82: { emoji: '⛈️',  description: '매우 강한 소나기' },
  85: { emoji: '🌨️', description: '눈 소나기' },
  86: { emoji: '❄️',  description: '강한 눈 소나기' },
  95: { emoji: '⛈️',  description: '뇌우' },
  96: { emoji: '⛈️',  description: '우박 동반 뇌우' },
  99: { emoji: '⛈️',  description: '강한 우박 동반 뇌우' },
};

export function getWmoInfo(code: number): { emoji: string; description: string } {
  return WMO_CODES[code] ?? { emoji: '🌡️', description: '알 수 없음' };
}

// 행정 단위 접미사 제거: "성남시" → "성남", "서울특별시" → "서울"
function normalizeCity(input: string): string {
  const suffixes = ['특별자치시', '특별자치도', '특별시', '광역시', '시', '군', '구', '도'];
  const city = input.trim();
  for (const suffix of suffixes) {
    if (city.endsWith(suffix) && city.length > suffix.length + 1) {
      return city.slice(0, -suffix.length).trim();
    }
  }
  return city;
}

const KO_TO_EN: Record<string, string> = {
  // 특별시·광역시
  서울: 'Seoul', 부산: 'Busan', 인천: 'Incheon', 대구: 'Daegu',
  대전: 'Daejeon', 광주: 'Gwangju', 울산: 'Ulsan', 세종: 'Sejong',
  // 경기
  수원: 'Suwon', 성남: 'Seongnam', 고양: 'Goyang', 용인: 'Yongin',
  화성: 'Hwaseong', 안산: 'Ansan', 안양: 'Anyang', 남양주: 'Namyangju',
  평택: 'Pyeongtaek', 시흥: 'Siheung', 파주: 'Paju', 의정부: 'Uijeongbu',
  김포: 'Gimpo', 광명: 'Gwangmyeong', 군포: 'Gunpo', 하남: 'Hanam',
  오산: 'Osan', 이천: 'Icheon', 양주: 'Yangju', 구리: 'Guri',
  // 강원
  춘천: 'Chuncheon', 원주: 'Wonju', 강릉: 'Gangneung', 동해: 'Donghae',
  속초: 'Sokcho', 태백: 'Taebaek', 삼척: 'Samcheok',
  // 충청
  천안: 'Cheonan', 청주: 'Cheongju', 공주: 'Gongju', 아산: 'Asan',
  서산: 'Seosan', 논산: 'Nonsan', 당진: 'Dangjin', 보령: 'Boryeong',
  // 전라
  전주: 'Jeonju', 군산: 'Gunsan', 익산: 'Iksan', 정읍: 'Jeongeup',
  남원: 'Namwon', 목포: 'Mokpo', 여수: 'Yeosu', 순천: 'Suncheon',
  광양: 'Gwangyang', 나주: 'Naju',
  // 경상
  포항: 'Pohang', 경주: 'Gyeongju', 김천: 'Gimcheon', 안동: 'Andong',
  구미: 'Gumi', 영주: 'Yeongju', 영천: 'Yeongcheon', 상주: 'Sangju',
  경산: 'Gyeongsan', 창원: 'Changwon', 진주: 'Jinju', 통영: 'Tongyeong',
  사천: 'Sacheon', 김해: 'Gimhae', 밀양: 'Miryang', 거제: 'Geoje',
  양산: 'Yangsan',
  // 제주
  제주: 'Jeju', 서귀포: 'Seogwipo',
};

function translateCity(input: string): string {
  return KO_TO_EN[input] ?? input;
}

async function geocode(city: string): Promise<{ name: string; country: string; latitude: number; longitude: number }> {
  const normalized = normalizeCity(city);
  const translated = translateCity(normalized);

  const response = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
    params: { name: translated, count: 1, language: 'ko', format: 'json' },
  });

  const results = response.data.results;
  if (!results || results.length === 0) {
    throw new Error(`'${city}' 도시를 찾을 수 없습니다. 다른 도시명으로 시도해주세요.`);
  }

  return {
    name: results[0].name,
    country: results[0].country,
    latitude: results[0].latitude,
    longitude: results[0].longitude,
  };
}

export async function getWeather(city: string): Promise<WeatherData> {
  const location = await geocode(city);

  const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
    params: {
      latitude: location.latitude,
      longitude: location.longitude,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
      hourly: 'temperature_2m,precipitation_probability,weather_code',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      timezone: 'auto',
      forecast_days: 6,
    },
  });

  const data = response.data;
  const current = data.current;

  // Find current hour index using the API's local time string
  const currentTimeStr: string = current.time; // e.g. "2026-04-08T14:00"
  const hourlyTimes: string[] = data.hourly.time;
  let startIdx = hourlyTimes.findIndex((t) => t === currentTimeStr);
  if (startIdx === -1) startIdx = 0;

  const hourly: HourlyForecast[] = [];
  for (let i = startIdx; i < startIdx + 8 && i < hourlyTimes.length; i++) {
    hourly.push({
      hour: parseInt(hourlyTimes[i].slice(11, 13), 10),
      temperature: Math.round(data.hourly.temperature_2m[i]),
      precipitationProbability: data.hourly.precipitation_probability[i] ?? 0,
      weatherCode: data.hourly.weather_code[i],
    });
  }

  const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
  const daily: DailyForecast[] = [];
  for (let i = 0; i < 5; i++) {
    const dateStr: string = data.daily.time[i];
    const date = new Date(dateStr + 'T12:00:00Z');
    daily.push({
      date: `${String(date.getUTCMonth() + 1).padStart(2, '0')}/${String(date.getUTCDate()).padStart(2, '0')}`,
      dayName: DAY_NAMES[date.getUTCDay()],
      tempMax: Math.round(data.daily.temperature_2m_max[i]),
      tempMin: Math.round(data.daily.temperature_2m_min[i]),
      precipitationProbability: data.daily.precipitation_probability_max[i] ?? 0,
      weatherCode: data.daily.weather_code[i],
    });
  }

  return {
    city: location.name,
    country: location.country,
    temperature: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    weatherCode: current.weather_code,
    hourly,
    daily,
  };
}
