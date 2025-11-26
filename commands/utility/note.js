import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder().setName('note')
    .setDescription('오늘 날짜의 특이사항을 제출합니다. 이미 제출한 경우, 출석부 시트에는 새로운 내용으로 덮어쓰기 됩니다.')
	.addStringOption((option) => option.setName('특이사항').setDescription('결석 사유 등을 입력해주세요.').setRequired(true)),
    async execute(interaction) {
        return null;
    }
}