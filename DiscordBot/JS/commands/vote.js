const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data : new SlashCommandBuilder()
        .setName('vote')
        .setDescription('投票関係のコマンド')
        .addSubcommand(subcommand =>
            subcommand
            .setName('start')
            .setDescription('投票を作成します。')
            .addStringOption(option =>
                option
                .setName('title')
                .setDescription('タイトル')
                .setRequired(true))
            .addStringOption(option =>
                option
                .setName('decription')
                .setDescription('説明')
                .setRequired(true))
            .addStringOption(option =>
                option
                .setName('choice1')
                .setDescription('選択肢1')
                .setRequired(true))
            .addStringOption(option =>
                option
                .setName('choice2')
                .setDescription('選択肢2')
                .setRequired(true))
            .addStringOption(option =>
                option
                .setName('choice3')
                .setDescription('選択肢3')
                .setRequired(false))
            .addStringOption(option =>
                option
                .setName('choice4')
                .setDescription('選択肢4')
                .setRequired(false))
            .addStringOption(option =>
                option
                .setName('choice5')
                .setDescription('選択肢5')
                .setRequired(false))),
    message : new Object(),
    async execute(interaction){
        if(interaction.options.getSubcommand() === "start"){
            if(this.message[interaction.guild.id] === undefined){
                this.message[interaction.guild.id] = new Array();
            }

            cnt = this.message[interaction.guild.id].length;
            
            this.message[interaction.guild.id].push(await interaction.reply({ content: "投票を作成中...", fetchReply: true }));
            var embed = new EmbedBuilder()
                .setTitle(interaction.options.getString('title'))
                .setColor("0x228b22")
                .setAuthor({ name : interaction.user.username, iconURL : interaction.user.avatarURL()})
                .setDescription(interaction.options.getString('decription'))
                .addFields(
                    {name: '1⃣', value: interaction.options.getString('choice1'), inline: true},
                    {name: '2⃣', value: interaction.options.getString('choice2'), inline: true})
                this.message[interaction.guild.id][cnt].react('1⃣');
                this.message[interaction.guild.id][cnt].react('2⃣');

            if(interaction.options.getString('choice5') !== null){
                embed.addFields(
                    {name: '3⃣', value: interaction.options.getString('choice3') + "", inline: true},
                    {name: '4⃣', value: interaction.options.getString('choice4') + "", inline: true},
                    {name: '5⃣', value: interaction.options.getString('choice5') + "", inline: true});
                this.message[interaction.guild.id][cnt].react('3⃣');
                this.message[interaction.guild.id][cnt].react('4⃣');
                this.message[interaction.guild.id][cnt].react('5⃣');

            }else if(interaction.options.getString('choice4') !== null){
                embed.addFields(
                    {name: '3⃣', value: interaction.options.getString('choice3') + "", inline: true},
                    {name: '4⃣', value: interaction.options.getString('choice4') + "", inline: true});
                this.message[interaction.guild.id][cnt].react('3⃣');
                this.message[interaction.guild.id][cnt].react('4⃣');
            }else if(interaction.options.getString('choice3') !== null){
                embed.addFields({name: '3⃣', value: interaction.options.getString('choice3') + "", inline: true});
                this.message[interaction.guild.id][cnt].react('3⃣');
            }


            await interaction.editReply('投票を開始します。')
            await interaction.editReply({ embeds : [embed] });
    
        }else if(interaction.options.getSubcommand() === "get"){

            if(this.message[interaction.guild.id] === undefined){
                await interaction.reply('現在開催されている投票はありません。');
                return;
            }

            await interaction.deferReply();

            var embed = new MessageEmbed()
                .setTitle('現在開催されている投票は...')
                .setColor('BLUE');
            
            for(var i = 0; i < this.message[interaction.guild.id].length; i++){
                embed.addFields({name: (i + 1).toString(), value: this.message[interaction.guild.id][i].embeds[0].title + "", inline: false});
            }

            await interaction.editReply({ embeds : [embed] });

        }
    }
}