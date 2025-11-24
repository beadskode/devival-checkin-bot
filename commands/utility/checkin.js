import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder().setName('checkin').setDescription('입실 체크');
export async function execute(interaction) {
    await interaction.reply('입실 완료!');
    return [interaction.user.id, interaction.user.globalName];
}