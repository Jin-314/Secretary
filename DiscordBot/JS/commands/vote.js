const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data : new SlashCommandBuilder()
        .setName('vote')
        .setDescription('投票を作成します。'),
    async execute(interaction){
        
    }
}