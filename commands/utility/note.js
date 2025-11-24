import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder().setName('note')
	.addStringOption((option) => option.setName('note').setDescription('특이사항을 제출합니다. 오늘 이미 제출한 경우, 출석부 시트에는 새로운 내용으로 덮어쓰기 됩니다.'));
export async function execute(interaction) {
    return [interaction.user.id, interaction.user.globalName, interaction.options.getString('note') ?? ''];
}