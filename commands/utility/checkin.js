import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder().setName('in').setDescription('입실 체크'),
    async execute(interaction) {
        return null;
    }
}