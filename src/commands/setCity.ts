import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { setDefaultCity } from '../services/cityStore';
import { getWeather } from '../services/weather';

export const data = new SlashCommandBuilder()
  .setName('날씨설정')
  .setDescription('기본 날씨 도시를 설정합니다.')
  .addStringOption((option) =>
    option
      .setName('도시')
      .setDescription('기본으로 설정할 도시 (예: 성남, 서울, London)')
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const city = interaction.options.getString('도시', true);

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const weather = await getWeather(city);
    setDefaultCity(interaction.user.id, city);
    await interaction.editReply(
      `✅ 기본 도시가 **${weather.city}**으로 설정되었습니다.\n이제 \`/날씨\` 입력 시 ${weather.city} 날씨가 표시됩니다.`
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    await interaction.editReply(`❌ ${message}`);
  }
}
