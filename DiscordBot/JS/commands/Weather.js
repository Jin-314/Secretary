const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data : new SlashCommandBuilder()
        .setName('wi')
        .setDescription('指定した都道府県のお天気情報を出します。'),
    async execute(interaction){
        
    }
}