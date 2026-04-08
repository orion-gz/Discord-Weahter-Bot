# Discord 날씨 봇

Discord 슬래시 커맨드를 통해 실시간 날씨 정보를 제공하는 봇입니다. OpenWeatherMap API를 사용하여 전 세계 도시의 날씨를 조회할 수 있습니다.

## 기능

- `/날씨 [도시명]` - 입력한 도시의 현재 날씨 정보를 표시합니다
  - 날씨 상태 (맑음, 흐림, 비 등)
  - 현재 기온 및 체감 온도
  - 습도, 풍속 정보

## 사전 요구사항

- Node.js 18 이상
- Discord Bot Token ([Discord Developer Portal](https://discord.com/developers/applications) 에서 발급)
- OpenWeatherMap API Key ([OpenWeatherMap](https://openweathermap.org/api) 에서 무료 발급)

## 설치

```bash
npm install
```

## 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 입력합니다. (`.env.example` 파일 참고)

```
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here
OPENWEATHER_API_KEY=your_openweathermap_api_key_here
```

| 변수 | 설명 |
|------|------|
| `DISCORD_TOKEN` | Discord 봇 토큰 |
| `DISCORD_CLIENT_ID` | Discord 애플리케이션 클라이언트 ID |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API 키 |

## Discord Bot 설정

1. [Discord Developer Portal](https://discord.com/developers/applications) 에서 새 애플리케이션을 생성합니다.
2. **Bot** 탭에서 봇을 추가하고 토큰을 복사합니다.
3. **OAuth2 > URL Generator** 탭에서 다음 권한을 선택합니다:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Send Messages`, `Use Slash Commands`
4. 생성된 URL로 봇을 서버에 초대합니다.

## 슬래시 커맨드 등록

봇을 처음 실행하기 전에 Discord에 슬래시 커맨드를 등록해야 합니다:

```bash
npm run deploy
```

또는:

```bash
npx ts-node src/deploy-commands.ts
```

## 봇 실행

```bash
npm start
```

또는:

```bash
npx ts-node src/index.ts
```

## 사용 예시

```
/날씨 서울
/날씨 London
/날씨 Tokyo
/날씨 New York
```

## 프로젝트 구조

```
discord-weather-bot/
├── src/
│   ├── commands/        # 슬래시 커맨드 정의
│   ├── services/        # 외부 API 연동 서비스
│   ├── deploy-commands.ts  # 커맨드 등록 스크립트
│   └── index.ts         # 봇 진입점
├── .env.example         # 환경 변수 예시
├── .gitignore
├── package.json
└── tsconfig.json
```
