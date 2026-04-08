import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
import * as weatherCommand from './commands/weather';

dotenv.config();

const commands = [weatherCommand.data.toJSON()];

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

if (!token || !clientId) {
  console.error('DISCORD_TOKEN 또는 DISCORD_CLIENT_ID 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log('슬래시 커맨드 등록 중...');
    const data = await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    }) as unknown[];
    console.log(`✅ ${data.length}개의 슬래시 커맨드가 등록되었습니다.`);
  } catch (error) {
    console.error('커맨드 등록 오류:', error);
  }
})();
