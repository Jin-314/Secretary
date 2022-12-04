const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const XMLHttpRequest = require('xhr2');

module.exports = {
    data : new SlashCommandBuilder()
        .setName('weather')
        .setDescription('都道府県の天気情報です。')
        .addSubcommand(subcommend =>
            subcommend
            .setName('info')
            .setDescription('都道府県の天気情報を出します。')
            .addStringOption(option=>
                option
                .setName('city_i')
                .setDescription('調べたい都市名')
                .setRequired(true)))
        .addSubcommand(subcommend=>
            subcommend
            .setName('forecast')
            .setDescription('都道府県の天気予報を出します。')
            .addStringOption(option=>
                option
                .setName('date')
                .setDescription('何日後の天気か')
                .setRequired(true))
            .addStringOption(option=>
                option
                .setName('city_f')
                .setDescription('調べたい都市名')
                .setRequired(true))),
    async execute(interaction){
        function sampleDate(date, format) {
 
            format = format.replace(/YYYY/, date.getFullYear());
            format = format.replace(/mm/, date.getMonth() + 1);
            format = format.replace(/dd/, date.getDate());
            format = format.replace(/HH/, date.getHours());
            format = format.replace(/MM/, date.getMinutes());
         
            return format;
        }

        await interaction.reply('Getting data...');

        var city = (interaction.options.getSubcommand() === "info") ? interaction.options.getString('city_i') : interaction.options.getString('city_f');
        var url = "https://map.yahooapis.jp/geocode/V1/geoCoder?appid=" + process.env.API_KEY_Y + "&output=json&query=" + city;
        var request = new XMLHttpRequest();
        request.open('GET', encodeURI(url));
        request.responseType = 'json';
        request.send();

        request.onload = async function(){
            if(request.response.ResultInfo.Count < 1){
                await interaction.editReply("都市名を正しく入力してください。");
                return;
            }
            const latitudeList = request.response.Feature[0].Geometry.Coordinates.split(',');
            url = "http://api.openweathermap.org/data/2.5/onecall?APPID=" + process.env.API_KEY + "&lat=" + latitudeList[1] + "&lon=" + latitudeList[0] + "&units=metric&lang=ja";
            request = new XMLHttpRequest();
            request.open('GET', encodeURI(url));
            request.responseType = 'json';            
            request.send();
            
            request.onload = async function(){
                const data = request.response;
                const embed = new EmbedBuilder();
                if(interaction.options.getSubcommand() === "info"){
                    imgurl = "http://openweathermap.org/img/w/" + data.current.weather[0].icon + ".png";
                    const dt = new Date(data.current.dt * 1000);
                    
                    embed.setTitle(city + "のお天気情報");
                    embed.setColor("0xff7f50");
                    embed.setImage(imgurl);
                    embed.addFields(
                        {name: "時刻", value: sampleDate(dt, 'YYYY/mm/dd HH:MM')},
                        {name: "天気", value: data.current.weather[0].main, inline: true},
                        {name: "説明", value: data.current.weather[0].description},
                        {name: "気温", value: data.current.temp + "℃", inline: true},
                        {name: "気圧", value: data.current.pressure + "hPa", inline: true},
                        {name: "湿度", value: data.current.humidity + "%", inline: true});

                }else if(interaction.options.getSubcommand() === "forecast"){
                    index = Number(interaction.options.getString('date'));
                    if(index < 1 || index > 7){
                        await interaction.editReply("予報の範囲外です。本日の天気は/weather infoで参照してください。");
                        return;
                    }
                    const dt = new Date(data.daily[index].dt * 1000);
                    imgurl = "http://openweathermap.org/img/w/" + data.daily[index].weather[0].icon + ".png";

                    embed.setTitle(city + "の" + sampleDate(dt, 'YYYY/mm/dd') + "の天気予報");
                    embed.setColor("0x008b8b");
                    embed.setImage(imgurl);
                    embed.addFields(
                        {name: "天気", value: data.daily[index].weather[0].main, inline: true},
                        {name: "説明", value: data.daily[index].weather[0].description},
                        {name: "気圧", value: data.daily[index].pressure + "hPa", inline: true},
                        {name: "湿度", value: data.daily[index].humidity + "%", inline: true},
                        {name: "気温", value: "気温の詳細です。"},
                        {name: "朝方", value: data.daily[index].temp.morn + "℃", inline: true},
                        {name: "日中", value: data.daily[index].temp.day + "℃", inline: true},
                        {name: "夜", value: data.daily[index].temp.night + "℃", inline: true},
                        {name: "最高気温", value: data.daily[index].temp.max + "℃", inline: true},
                        {name: "最低気温", value: data.daily[index].temp.min + "℃", inline: true});
                }
                await interaction.editReply("Getting data...Done");
                await interaction.editReply({ embeds : [embed] });
            }
        }
    }
}