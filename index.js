import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  MessageFlags,
} from 'discord.js';
import process from 'node:process';
import commands from './commands/index.js';
import { logger } from './logger.js';
import { findRowData, getSheetName, updateCell } from './sheet.js';

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
  if (!!command.data && !!command.execute) {
    client.commands.set(command.data.name, command);
  } else {
    console.log('error occured in process setting commands');
  }
}

function sendMessage(message) {
    const channelId = process.env.DISCORD_CHECKIN_CHANNEL_ID;
    const channel = client.channels.cache.get(channelId);
    if (channel) {
        channel.send(message);
    } else {
        console.error('Channel not found!');
    }
}

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        );
        return;
      }
      const today = new Date(interaction.createdTimestamp);

      const date = today
        .toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
        .replace(/\. /g, '-')
        .replace('.', '');

      const timestamp = today.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      //* 시트 이름 찾기
      const userId = interaction.user.id;
      const nickname = interaction.user.globalName;

      const sheetName = await getSheetName(userId, nickname);

      if (!sheetName) {
        await interaction.reply(
          {
            flags: MessageFlags.Ephemeral,
            content:'등록되지 않은 사용자입니다. 관리자에게 문의해주세요.'
          });
        return;
      }

      // Row Data 구하기
      const { rowNumber, rowData } = await findRowData(sheetName, date);

      switch (interaction.commandName) {
        // 입실시간 제출
        case 'in': {
          // 중복 컨펌
          if (rowData[2]) {
            await interaction.reply({
              flags: MessageFlags.Ephemeral,
              content:'이미 입실 체크를 완료했습니다.'
            });
            return;
          }
          await updateCell(sheetName, rowNumber, 'C', timestamp);
          await interaction.deferReply({ ephemeral: true });
          await interaction.deleteReply();
          sendMessage(`[${date}] ${sheetName ?? nickname}님 입실 완료! 힘내세요 💪 -- ${timestamp}`);
          break;
        }
        // 퇴실시간 제출
        case 'out': {
          // 중복 컨펌
          if (rowData[3]) {
            await interaction.reply({
              flags: MessageFlags.Ephemeral,
              content:'이미 퇴실 체크를 완료했습니다.'
            });
            return;
          }
          await updateCell(sheetName, rowNumber, 'D', timestamp);
          await interaction.deferReply({ ephemeral: true });
          await interaction.deleteReply();
          sendMessage(`[${date}] ${sheetName ?? nickname}님 퇴실 완료! 수고하셨습니다 👏 -- ${timestamp}`);
          break;
        }
        // 특이사항 제출
        case 'note': {
          // 중복 컨펌
          if (rowData[4]) {
            await interaction.reply({
              flags: MessageFlags.Ephemeral,
              content:'이미 특이사항을 제출했습니다. 수정은 관리자에게 문의하세요.'
            });
            return;
          }
          const note = interaction.options.getString('특이사항');
          await interaction.reply({
            flags: MessageFlags.Ephemeral,
            content: `특이사항을 제출했습니다! '${note}'`
          });
          await updateCell(sheetName, rowNumber, 'E', note);
          break;
        }
        default: {
        }
      }
    } else return;
  } catch (error) {   
    const errorTime = new Date(); 
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: '[CODE: 01] 에러가 발생했습니다! 관리자에게 문의해주세요.',
        flags: MessageFlags.Ephemeral,
      });
      logger.error(`[code: 01] time: ${errorTime.toString()}`);
    } else {
      await interaction.reply({
        content: '[CODE: 02] 에러가 발생했습니다! 관리자에게 문의해주세요.',
        flags: MessageFlags.Ephemeral,
      });
      logger.error(`[code: 02] time: ${errorTime.toString()}`);
    }
    logger.error(error);
  }
});

client.login(DISCORD_TOKEN);