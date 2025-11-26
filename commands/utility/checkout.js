import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder().setName('out').setDescription('퇴실 체크'),
    async execute(interaction) {
        return null;
    }
}