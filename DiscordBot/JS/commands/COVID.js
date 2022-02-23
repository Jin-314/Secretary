const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
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

            let requestPatient = new XMLHttpRequest();
            let requestDeath = new XMLHttpRequest();
            requestPatient.open('GET', "https://data.corona.go.jp/converted-json/covid19japan-npatients.json");
            requestDeath.open('GET', "https://data.corona.go.jp/converted-json/covid19japan-ndeaths.json");
            requestPatient.responseType = 'json';
            requestDeath.responseType = 'json';
            requestPatient.send();
            requestDeath.send();
            const embed = new MessageEmbed().setColor("0xff0000");
    
            requestPatient.onload = async function(){
                const dataPatient = requestPatient.response;
                const idxPatient = dataPatient.length - 1;
                const dt = new Date(dataPatient[idxPatient].date);

                embed.setTitle("全国の" + dt.getFullYear() + "年" + (dt.getMonth() + 1) + "月" + dt.getDate() + "日のCOVID情報");
                embed.addField("感染者情報", "全国の感染者情報です。");
                embed.addField("累計感染者数", dataPatient[idxPatient].npatients + "人", true);
                embed.addField("1日の感染者数", dataPatient[idxPatient].adpatients + "人", true);
                
                await interaction.editReply('Getting data...Done');
                await interaction.editReply({ embeds : [embed]});
            }
            requestDeath.onload = async function(){
                const dataDeath = requestDeath.response;
                const idxDeath = dataDeath.length - 1;

                embed.addField("死者情報", "全国の死者情報です。");
                embed.addField("累計死者数", dataDeath[idxDeath].ndeaths + "人", true);
                embed.addField("1日の死者数", (dataDeath[idxDeath].ndeaths - dataDeath[idxDeath-1].ndeaths) + "人", true);
                
                await interaction.editReply('Getting data...Done');
                await interaction.editReply({ embeds : [embed] });
            }
        
        }else if(interaction.options.getSubcommand() === "prefecture"){

            await interaction.reply('Getting data...');

            const request = new XMLHttpRequest();
            request.open('GET', encodeURI("https://opendata.corona.go.jp/api/Covid19JapanAll?dataName=" + interaction.options.getString('prefecture')));
            request.responseType = 'json';
            request.send();

            const embed = new MessageEmbed().setColor("0x4b0082");

            request.onload = async function(){
                const data = request.response;
                const dt = new Date(data.itemList[0].date);

                embed.setTitle(interaction.options.getString('prefecture') + "の" + dt.getFullYear() + "年"
                                    + (dt.getMonth() + 1) + "月" + dt.getDate() + "日のCOVID情報");
                embed.addField("感染者情報", interaction.options.getString('prefecture') + "の感染者情報です。");
                embed.addField("累計感染者数", data.itemList[0].npatients + "人");
                embed.addField("1日の感染者数", (data.itemList[0].npatients - data.itemList[1].npatients) + "人");

                await interaction.editReply('Getting data...Done');
                await interaction.editReply({ embeds : [embed] })
            }
        }
    }
}