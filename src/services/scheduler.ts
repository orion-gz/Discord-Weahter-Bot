import cron from 'node-cron';
import { Client, TextChannel } from 'discord.js';
import { getWeather } from './weather';
import { buildWeatherEmbed } from '../utils/weatherEmbed';

export function startWeatherScheduler(client: Client): void {
  const channelId = process.env.DISCORD_CHANNEL_ID;
  const city = process.env.WEATHER_CITY || 'Seongnam-si';
  const schedule = process.env.WEATHER_SCHEDULE || '0 7 * * *';
  const timezone = process.env.TZ || 'Asia/Seoul';

  if (!channelId) {
    console.warn('⚠️  DISCORD_CHANNEL_ID가 설정되지 않아 자동 날씨 알림이 비활성화됩니다.');
    return;
  }

  if (!cron.validate(schedule)) {
    console.error(`❌ 유효하지 않은 cron 스케줄: "${schedule}"`);
    return;
  }

  cron.schedule(schedule, async () => {
    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel || !(channel instanceof TextChannel)) {
        console.error('❌ 채널을 찾을 수 없거나 텍스트 채널이 아닙니다.');
        return;
      }

      const weather = await getWeather(city);
      const embed = buildWeatherEmbed(weather, true);
      await channel.send({ embeds: [embed] });
      console.log(`✅ [${new Date().toLocaleString('ko-KR')}] ${city} 날씨 알림 전송 완료`);
    } catch (error) {
      console.error('날씨 알림 전송 오류:', error);
    }
  }, { timezone });

  console.log(`⏰ 날씨 스케줄러 시작: "${schedule}" (도시: ${city}, 시간대: ${timezone})`);
}
