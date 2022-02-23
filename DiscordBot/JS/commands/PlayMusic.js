const { SlashCommandBuilder } = require('@discordjs/builders');
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
const { connected } = require('process');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('ボイスチャットで音楽を再生します。')
        .addSubcommand(subcommand =>
            subcommand
            .setName('stop')
            .setDescription('ボイスチャットで再生中の音楽を停止します。'))
        .addSubcommand(subcommand =>
            subcommand
            .setName('play')
            .setDescription('ボイスチャットで音楽を流します。')),
    player : new AudioPlayer,
    channel : '',
    async execute(interaction){
        if(interaction.options.getSubcommand() === "stop"){
            if(this.player.state.status === "playing"){
                interaction.reply("再生を停止します。");
                this.player.stop();
            }
            else{
                interaction.reply("再生中のものはありません。");
            }
        }else if(interaction.options.getSubcommand() === "play"){
            this.channel = interaction.channel.toString();
            const guild = interaction.guild;
            const member = await guild.members.fetch(interaction.member.id);
            const memberVC = member.voice.channel;
            if (!memberVC) {
                return await interaction.reply({
                    content: "接続先のVCが見つかりません。",
                    ephemeral: true,
                });
            }
            if (!memberVC.joinable) {
                return await interaction.reply({
                    content: "VCに接続できません。",
                    ephemeral: true,
                });
            }
            if (!memberVC.speakable) {
                return await interaction.reply({
                    content: "VCで音声を再生する権限がありません。",
                    ephemeral: true,
                });
            }
            const status = ["●Loading Sounds...", `●Connecting to ${memberVC}...`];
            const p = interaction.reply(status.join("\n"));
            const connection = joinVoiceChannel({
                guildId: guild.id,
                channelId: memberVC.id,
                adapterCreator: guild.voiceAdapterCreator,
                selfMute: false,
            });
            const resource = createAudioResource("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            {
                inputType: StreamType.Arbitrary,
            });
            this.player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause,
                },
            });
            this.player.play(resource);
            const promises = [];
            promises.push(entersState(this.player, AudioPlayerStatus.AutoPaused, 1000 * 10).then(() => status[0] += "Done!"));
            promises.push(entersState(connection, VoiceConnectionStatus.Ready, 1000 * 10).then(() => status[1] += "Done!"));
            await Promise.race(promises);
            await p;
            await Promise.all([...promises, interaction.editReply(status.join("\n"))]);
            connection.subscribe(this.player);
            await entersState(this.player, AudioPlayerStatus.Playing, 100);
            await interaction.editReply("Playing");
            await entersState(this.player, AudioPlayerStatus.Idle, 2 ** 31 - 1);
            await interaction.editReply("End");
            connection.destroy();
        }
    }
}