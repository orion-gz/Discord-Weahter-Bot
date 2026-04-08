import { EmbedBuilder } from 'discord.js';
import { WeatherData, getWmoInfo } from '../services/weather';

function getEmbedColor(code: number): number {
  if (code <= 1)                     return 0xF9CA24; // 맑음 → 금색
  if (code <= 3)                     return 0x95A5A6; // 흐림 → 회색
  if (code >= 51 && code <= 67)      return 0x3498DB; // 비   → 파란색
  if (code >= 71 && code <= 77)      return 0xAED6F1; // 눈   → 하늘색
  if (code >= 80 && code <= 86)      return 0x2980B9; // 소나기 → 진파란색
  if (code >= 95)                    return 0x2C3E50; // 뇌우 → 어두운색
  return 0x3498DB;
}

export function buildWeatherEmbed(weather: WeatherData, isScheduled = false): EmbedBuilder {
  const { emoji, description } = getWmoInfo(weather.weatherCode);
  const today = weather.daily[0];

  // ⏰ 시간별 예보 — 8시간, 두 줄로 나눔
  const hourlyLine = weather.hourly
    .map((h) => {
      const rain = h.precipitationProbability >= 20 ? ` ☔${h.precipitationProbability}%` : '';
      return `\`${String(h.hour).padStart(2, '0')}시\` ${getWmoInfo(h.weatherCode).emoji} **${h.temperature}°**${rain}`;
    })
    .join('  ');

  // 📅 5일 예보
  const dailyLines = weather.daily
    .map((d, i) => {
      const { emoji: dEmoji } = getWmoInfo(d.weatherCode);
      const label = i === 0 ? '**오늘**' : i === 1 ? '**내일**' : `**${d.date} ${d.dayName}**`;
      const rain = d.precipitationProbability > 0 ? ` ☔ ${d.precipitationProbability}%` : '';
      return `${label}  ${dEmoji}  🔼 ${d.tempMax}° / 🔽 ${d.tempMin}°${rain}`;
    })
    .join('\n');

  return new EmbedBuilder()
    .setColor(getEmbedColor(weather.weatherCode))
    .setAuthor({ name: `📍 ${weather.city}, ${weather.country}` })
    .setTitle(`${emoji}  ${description}`)
    .setDescription(`> 현재 **${weather.temperature}°C** · 체감 **${weather.feelsLike}°C**`)
    .addFields(
      {
        name: '🌡️ 오늘 기온',
        value: `최고 **${today.tempMax}°C** / 최저 **${today.tempMin}°C**`,
        inline: true,
      },
      {
        name: '💧 습도',
        value: `**${weather.humidity}%**`,
        inline: true,
      },
      {
        name: '💨 풍속',
        value: `**${weather.windSpeed} m/s**`,
        inline: true,
      },
      { name: '\u200b', value: '\u200b' },
      {
        name: '⏰ 시간별 예보',
        value: hourlyLine || '데이터 없음',
      },
      { name: '\u200b', value: '\u200b' },
      {
        name: '📅 5일 예보',
        value: dailyLines || '데이터 없음',
      },
    )
    .setFooter({
      text: isScheduled
        ? '자동 날씨 알림 · Open-Meteo 제공'
        : 'Open-Meteo 제공',
    })
    .setTimestamp();
}
