import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { getCurrentWeather } from '../services/weather';

export const data = new SlashCommandBuilder()
  .setName('날씨')
  .setDescription('특정 도시의 현재 날씨를 알려줍니다.')
  .addStringOption((option) =>
    option
      .setName('도시')
      .setDescription('날씨를 확인할 도시 이름 (예: Seoul, London, Tokyo)')
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const city = interaction.options.getString('도시', true);

  await interaction.deferReply();

  try {
    const weather = await getCurrentWeather(city);

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(`${weather.emoji} ${weather.city}, ${weather.country} 날씨`)
      .setDescription(`**${weather.description}**`)
      .addFields(
        { name: '🌡️ 기온', value: `${weather.temperature}°C`, inline: true },
        { name: '🤔 체감 온도', value: `${weather.feelsLike}°C`, inline: true },
        { name: '💧 습도', value: `${weather.humidity}%`, inline: true },
        { name: '💨 풍속', value: `${weather.windSpeed} m/s`, inline: true }
      )
      .setThumbnail(`https://openweathermap.org/img/wn/${weather.icon}@2x.png`)
      .setFooter({ text: 'OpenWeatherMap 제공' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    await interaction.editReply(`❌ ${message}`);
  }
}
