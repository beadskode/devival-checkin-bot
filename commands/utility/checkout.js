import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder().setName('checkout').setDescription('퇴실 체크');
export async function execute(interaction) {
    await interaction.reply('퇴실 완료!');
    return [interaction.user.id, interaction.user.globalName];
}