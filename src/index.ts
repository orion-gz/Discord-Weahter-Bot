import { Client, Collection, GatewayIntentBits, Interaction } from 'discord.js';
import * as dotenv from 'dotenv';
import * as weatherCommand from './commands/weather';
import { startWeatherScheduler } from './services/scheduler';

dotenv.config();

interface Command {
  data: { name: string; toJSON(): unknown };
  execute(interaction: Parameters<typeof weatherCommand.execute>[0]): Promise<void>;
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const commands = new Collection<string, Command>();
commands.set(weatherCommand.data.name, weatherCommand);

client.once('ready', (readyClient) => {
  console.log(`✅ 봇이 ${readyClient.user.tag}으로 로그인되었습니다!`);
  startWeatherScheduler(readyClient);
});

client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('커맨드 실행 오류:', error);
    const errorMessage = '명령어 실행 중 오류가 발생했습니다.';
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, ephemeral: true });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('DISCORD_TOKEN 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

client.login(token);
