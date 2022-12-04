const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const XMLHttpRequest = require('xhr2');

module.exports = {
    data : new SlashCommandBuilder()
        .setName('covid')
        .setDescription('COVID情報を出します。')
        .addSubcommand(subcommand =>
            subcommand
            .setName('all')
            .setDescription('全国のCOVID情報を出します。'))
        .addSubcommand(subcommand =>
            subcommand
            .setName('prefecture')
            .setDescription('県ごとのCOVID情報を出します。')
            .addStringOption(option =>
                option
                .setName('prefecture')
                .setDescription('調べたい都道府県')
                .setRequired(true))),
    async execute(interaction){
        if(interaction.options.getSubcommand() === "all"){

            await interaction.reply('Getting data...');

            var request = new XMLHttpRequest();
            request.open('GET', "https://data.corona.go.jp/converted-json/covid19japan-npatients.json");
            request.responseType = 'json';
            request.send();
    
            request.onload = async function(){
                var data = request.response;
                var idx = data.length - 1;
                const dt = new Date(data[idx].date);

                const embed = new EmbedBuilder()
                    .setColor("0xff0000")
                    .setTitle("全国の" + dt.getFullYear() + "年" + (dt.getMonth() + 1) + "月" + dt.getDate() + "日のCOVID情報")
                    .addFields(
                        {name: "感染者情報", value: "全国の感染者情報です。"},
                        {name: "累計感染者数", value: data[idx].npatients + "人", inline: true},
                        {name: "1日の感染者数", value: data[idx].adpatients + "人", inline: true})
                
                request = new XMLHttpRequest();
                request.open('GET', "https://data.corona.go.jp/converted-json/covid19japan-ndeaths.json");
                request.responseType = 'json';
                request.send();

                request.onload = async function(){
                    data = request.response;
                    idx = data.length - 1;
    
                    embed.addFields(
                        {name: "死者情報", value: "全国の死者情報です。"},
                        {name: "累計死者数", value: data[idx].ndeaths + "人", inline: true},
                        {name: "1日の死者数", value: (data[idx].ndeaths - data[idx-1].ndeaths) + "人", inline: true});
                    
                    await interaction.editReply('Getting data...Done');
                    await interaction.editReply({ embeds : [embed] });
                }
            }
        
        }else if(interaction.options.getSubcommand() === "prefecture"){

            await interaction.reply('Getting data...');

            const request = new XMLHttpRequest();
            request.open('GET', encodeURI("https://opendata.corona.go.jp/api/Covid19JapanAll?dataName=" + interaction.options.getString('prefecture')));
            request.responseType = 'json';
            request.send();

            const embed = new EmbedBuilder().setColor("0x4b0082");

            request.onload = async function(){
                const data = request.response;
                if(data.itemList.length > 0){
                    const dt = new Date(data.itemList[0].date);

                    embed.setTitle(interaction.options.getString('prefecture') + "の" + dt.getFullYear() + "年"
                                        + (dt.getMonth() + 1) + "月" + dt.getDate() + "日のCOVID情報");
                    embed.addFields(
                        {name: "感染者情報", value: interaction.options.getString('prefecture') + "の感染者情報です。"},
                        {name: "累計感染者数", value: data.itemList[0].npatients + "人", inline: true},
                        {name: "1日の感染者数", value: (data.itemList[0].npatients - data.itemList[1].npatients) + "人", inline: true});
    
                    await interaction.editReply('Getting data...Done');
                    await interaction.editReply({ embeds : [embed] });
                }else{
                    await interaction.editReply('県名を正しく入力してください。');
                    return;
                }
            }
        }
    }
}