import { Client, Collection, Events, GatewayIntentBits, MessageFlags, time, TimestampStyles } from 'discord.js';
import process from 'node:process';
import * as commands from './commands';
import {
  createRow,
  findRowData,
  updateCell
} from './sheet';

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

// [Discord] 클라이언트 인스턴스 반환
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// [Discord] 클라이언트 준비 시 최초 1회 실행
client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// [Discord] 클라이언트에 커맨드 추가
client.commands = new Collection(); 

for (const command of commands) {
  if (!!command.data && !!command.excute) {
      client.commands.set(command.data.name, command);
  } else {
    console.log('error occured in process setting commands')
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
    try {
        const date = new Date();
        const timestamp = time(date, TimestampStyles.ShortTime);
        console.log('date: ', date);
        console.log('timestamp: ', timestamp);

        //! 시트 이름 찾기
        // const userId = interaction.user.id;
        // const nickname = interaction.user.globalName;
        // console.log('interaction.user.id: ', interaction.user.id);
        // console.log('interaction.user.globalName: ', interaction.user.globalName);
        const sheetName = ''; // QQQ

        // Row Data 구하기
        const {rowNumber, rowData} = await findRowData(date, userId);

        // Row 없을 경우 신규 행 생성
        if (!rowData) {
          createRow() // QQQ
        }

        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }
            switch (interaction.commandName) {
              // 입실시간 제출
              case 'checkin': {
                // 중복 컨펌
                if (rowData[2]) {
                  await interaction.reply('이미 입실 체크를 완료했습니다.');
                  return;
                }
                await updateCheckinTime(sheetName, rowNumber, 'C', timestamp);
                await interaction.reply('입실 완료!');
                break;
              }
              // 퇴실시간 제출
              case 'checkout': {
                // 중복 컨펌
                if (rowData[3]) {
                  await interaction.reply('이미 퇴실 체크를 완료했습니다.');
                  return;
                }
                await updateCell(sheetName, rowNumber, 'D', timestamp);
                await interaction.reply('퇴실 완료!');
                break;
              }
              // 특이사항 제출
              case 'note': {
                // 중복 컨펌
                if (rowData[4]) {
                  // QQQ: 실제 컨펌 또는 경고
                  await interaction.reply('이미 특이사항을 제출했습니다. 수정은 스터디장에게 문의하세요!');
                  return;
                }
                const note = ''; // QQQ
                await updateCell(sheetName, rowNumber, 'E', note);
                break;
              }
              default: {}
            }
        } else return;
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: 'There was an error while executing this command!',
                flags: MessageFlags.Ephemeral,
            });
        } else {
            await interaction.reply({
                content: 'There was an error while executing this command!',
                flags: MessageFlags.Ephemeral,
            });
        }
    }
 });

client.login(DISCORD_TOKEN);