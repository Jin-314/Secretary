const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const {
    joinVoiceChannel,
    entersState,
    VoiceConnectionStatus,
    createAudioResource,
    StreamType,
    createAudioPlayer,
    AudioPlayerStatus,
    NoSubscriberBehavior,
    generateDependencyReport,
    AudioPlayer
} = require("@discordjs/voice");
const ytdl = require('ytdl-core');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('movie')
        .setDescription('動画を再生します。')
        .addSubcommand(subcommand =>
                subcommand
                .setName('play')
                .setDescription('リンクの動画をキューに追加します。')
                .addStringOption(option =>
                    option
                    .setName('url')
                    .setDescription('リンク')
                    .setRequired(true)))
        .addSubcommand(subcommand =>
                subcommand
                .setName('stop')
                .setDescription('動画の再生を停止します。'))
        .addSubcommand(subcommand =>
                subcommand
                .setName('skip')
                .setDescription('現在の動画をスキップします。'))
        .addSubcommand(subcommand =>
                subcommand
                .setName('list')
                .setDescription('動画のリスト一覧を表示します。'))
        .addSubcommand(subcommand =>
                subcommand
                .setName('pause')
                .setDescription('動画の再生を一時停止します。')),
    player : new Array(),
    connection : new Array(),
    playList : new Object(),
    playIdx : new Array(),
    async execute(interaction){
        if(interaction.options.getSubcommand() === "play"){

            const guild = interaction.guild;
            const guildid = guild.id;
            const videoID = ytdl.getURLVideoID(interaction.options.getString('url'));
            const info = await ytdl.getInfo(videoID);
            const videoTitle = info.player_response.videoDetails.title;

            if(!ytdl.validateURL(interaction.options.getString('url'))){
                return await interaction.reply({
                    content: `${url}は処理できません。`,
                    ephemeral: true,
                });
            }

            if(this.playList[guildid] === undefined){
                this.playList[guildid] = new Array();
            }
            this.playList[guildid].push(videoID);
            await interaction.reply(`${videoTitle}をキューに追加しました。`);

            if(this.player[guildid] == null || this.player[guildid].state.status === "idle"){

                const member = await guild.members.fetch(interaction.member.id);
                const memberVC = member.voice.channel;

                if (!memberVC) {
                    return await interaction.editReply({
                        content: "接続先のVCが見つかりません。",
                        ephemeral: true,
                    });
                }
                if (!memberVC.joinable) {
                    return await interaction.editReply({
                        content: "VCに接続できません。",
                        ephemeral: true,
                    });
                }
                if (!memberVC.speakable) {
                    return await interaction.editReply({
                        content: "VCで音声を再生する権限がありません。",
                        ephemeral: true,
                    });
                }

                const status = [`●Connecting to ${memberVC}...`];
                const p = interaction.followUp(status.join('\n'));
                this.connection[guildid] = joinVoiceChannel({
                    guildId: guildid,
                    channelId: memberVC.id,
                    adapterCreator: guild.voiceAdapterCreator,
                    selfMute: false,
                });
                this.player[guildid] = new AudioPlayer();
                this.player[guildid] = createAudioPlayer({
                    behaviors: {
                        noSubscriber: NoSubscriberBehavior.Pause,
                    },
                });

                const promises = [];
                promises.push(entersState(this.connection[guildid], VoiceConnectionStatus.Ready, 1000 * 10).then(() => status[0] += "Done!"));
                await Promise.race(promises);
                await p;
                await Promise.all([...promises, p.then(msg => {msg.edit(status.join('\n'))})]);

                this.playIdx[guildid] = 0;
                await this.playCue(interaction, p, status);
                this.connection[guildid].destroy();
                this.playIdx[guildid] = 0;
                this.playList[interaction.guild.id].splice(this.playIdx[guildid]);
            }
            
        }else if(interaction.options.getSubcommand() === 'stop'){
            const guildid = interaction.guild.id;
            if(this.player[guildid].state.status === "playing"){
                for(;this.playIdx[guildid] < this.playList[interaction.guild.id].length;this.playIdx[guildid]++){
                    this.player[guildid].stop();
                }
                await interaction.reply("再生を停止しました。");
            }
            else{
                await interaction.reply("再生中のものはありません。");
            }
        }else if(interaction.options.getSubcommand() === "skip"){
            const guildid = interaction.guild.id;
            
            if(this.player[guildid].state.status === "playing"){

                const info = await ytdl.getInfo(this.playList[interaction.guild.id][this.playIdx[guildid]]);
                const videoTitle = info.player_response.videoDetails.title;
    
                this.player[guildid].stop();
                await interaction.reply(`${videoTitle}をスキップしました。`);

            }else{
                await interaction.reply("再生中のものはありません。");
            }
        }else if(interaction.options.getSubcommand() === "list"){
            const guildid = interaction.guild.id;
            if(this.player[guildid].state.status !== "Idle"){
                
                await interaction.reply({ content: "プレイリストを作成中...", fetchReply: true });

                var embed = new EmbedBuilder()
                    .setTitle("プレイリスト一覧")
                    .setColor("0x228b22")
                    .setDescription("再生中のキュー一覧です。");
                let cnt = 1;
                for(let i = this.playIdx[guildid]; i < this.playList[interaction.guild.id].length; i++){

                    const info = await ytdl.getInfo(this.playList[interaction.guild.id][i]);
                    const videoTitle = info.player_response.videoDetails.title;

                    embed.addFields({name: cnt.toString(), value: videoTitle + ""});
                    cnt++;
                }

                await interaction.editReply({ embeds : [embed] });

            }else{
                await interaction.reply("再生中のものはありません。");
            }
        }else if(interaction.options.getSubcommand() === "pause"){
            const guildid = interaction.guild.id;

            if(this.player[guildid].state.status === "playing"){
                this.player[guildid].pause();
                await interaction.reply("一時停止しました。");
            }else if(this.player[guildid].state.status === "paused"){
                this.player[guildid].unpause();
                await interaction.reply("再開しました。");
            }else{
                await interaction.reply("再生中のものはありません。");
            }
        }
    },
    async playCue(interaction, reply, status){
        const guildid = interaction.guild.id;
        for(;this.playIdx[guildid] < this.playList[guildid].length; this.playIdx[guildid]++){
            
            const stream = ytdl(this.playList[guildid][this.playIdx[guildid]],{
                filter: (format) => format.audioCodec === 'opus' && format.container === 'webm',
                quality: 'highest',
                highWaterMark: 32 * 1024 * 1024,
            });
            const resource = createAudioResource(stream,
            {
                inputType: StreamType.WebmOpus,
            });

            this.player[guildid].play(resource);
            this.connection[guildid].subscribe(this.player[guildid]);

            await entersState(this.player[guildid], AudioPlayerStatus.Playing, 10 * 1000);
            await entersState(this.player[guildid], AudioPlayerStatus.Idle, 24 * 60 * 60 * 1000);
        }
    }
}