import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getWeather } from '../services/weather';
import { buildWeatherEmbed } from '../utils/weatherEmbed';

export const data = new SlashCommandBuilder()
  .setName('날씨')
  .setDescription('도시의 현재 날씨와 예보를 알려줍니다.')
  .addStringOption((option) =>
    option
      .setName('도시')
      .setDescription('날씨를 확인할 도시 이름 (기본값: 성남 / 예: 서울, London)')
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const city = interaction.options.getString('도시') ?? '성남';

  await interaction.deferReply();

  try {
    const weather = await getWeather(city);
    const embed = buildWeatherEmbed(weather);
    await interaction.editReply({ embeds: [embed] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    await interaction.editReply(`❌ ${message}`);
  }
}
