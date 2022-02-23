const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, VoiceConnection, AudioPlayer } = require("@discordjs/voice");
const path = require('path');
const OpenJTalk = require(path.join(__dirname, '/CommandModules/OpenJTalk'));
const JSON5     = require('json5');
const emoji     = require('node-emoji');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('read')
        .setDescription('テキストを読み上げます。')
        .addSubcommand(subcommand =>
            subcommand
            .setName('start')
            .setDescription('テキスト読み上げを開始します。'))
        .addSubcommand(subcommand =>
            subcommand
            .setName('stop')
            .setDescription('テキスト読み上げを停止します。')),
    channel : '',
    isReadStarted : false,
    VoiceConfig : {
        openjtalk_bin : 'open_jtalk',
        dic_dir       : '/var/lib/mecab/dic/open-jtalk/naist-jdic',
        wav_dir       : path.join(__dirname, '/tmp_wav/'),
        voice_list : {
            mei         : '/usr/share/hts-voice/mei/mei_normal',
            mei_angry   : '/usr/share/hts-voice/mei/mei_angry',
            mei_bashful : '/usr/share/hts-voice/mei/mei_bashful',
            mei_happy   : '/usr/share/hts-voice/mei/mei_happy',
            mei_sad     : '/usr/share/hts-voice/mei/mei_sad',
        }
    },
    OpenJTalkOptions : [
        ["g",  -99, 99],
        ["a",    0, 1],
        ["b",    0, 1],
        ["u",    0, 1],
        ["jm",   0, 99],
        ["jf",   0, 99],
        ["r",    0, 99],
        ["fm", -99, 99]
    ],
    VoiceSettings : [
        'voice:"mei"'
    ],
    VoiceSetting : {
        res : {},
        res_message : '',
    },
    player : new AudioPlayer(),
    conn : {},
    async execute(interaction){
        if (interaction.options.getSubcommand() === "start"){
            this.channel = interaction.channel.toString();
    
            const guild = interaction.guild;
            const member = await guild.members.fetch(interaction.member.id);
            const memberVC = member.voice.channel;
    
            if (!memberVC) {
                return interaction.reply({
                    content: "接続先のVCが見つかりません。",
                    ephemeral: true,
                });
            }
            if (!memberVC.joinable) {
                return interaction.reply({
                    content: "VCに接続できません。",
                    ephemeral: true,
                });
            }
            if (!memberVC.speakable) {
                return interaction.reply({
                    content: "VCで音声を再生する権限がありません。",
                    ephemeral: true,
                });
            }
            
            interaction.reply('読み上げを開始します。');
    
            this.conn = joinVoiceChannel({
                guildId: guild.id,
                channelId: memberVC.id,
                adapterCreator: guild.voiceAdapterCreator,
                selfMute: false,
            });
    
            this.player = createAudioPlayer();
            this.conn.subscribe(this.player);
    
            this.isReadStarted = true;

        }else if(interaction.options.getSubcommand() === "stop"){
            if(this.isReadStarted){
                interaction.reply('読み上げを終了します。');
                this.player.stop();
                this.conn.destroy();
                this.isReadStarted = false;
            }else{
                interaction.reply('読み上げは開始されていません。')
            }
        }
    },
    
    parse_option(config){
        config = "{" + config + "}";
        config = config.replace("=", ":");
        var obj = {};
        var res = {};
        var res_message = "";
        try {
            obj = JSON5.parse(config);
        } catch (e) {
            obj = null;
        }
        if(obj == null) {
            res_message += "Invalid format.\n";
        } else {
            if(obj.voice != null) {
                if(obj.voice in this.VoiceConfig.voice_list) {
                    res.voice = obj.voice;
                } else {
                    res_message += "Voice " + obj.voice + " is not found.\n";
                }
            }
            for (const e of this.OpenJTalkOptions) {
                if(e[0] in obj) {
                    const v = obj[e[0]];
                    if(typeof v != 'number') {
                        res_message += "Option " + e[0] + " is not number. (type: "+ typeof v() +" val:" + v +")\n";
                        continue;
                    }
                    if(!(e[1] <= v && v <= e[2])) {
                        res_message += "Option " + e[0] + " is out of range. (range: [" + e[1]+", "+e[2] + "] val:" + v +")\n";
                        continue;
                    }
                    res[e[0]] = v;
                }
            }
        }
        return {res, res_message};
    },
    talk(message) {
        this.VoiceSetting = this.parse_option(this.VoiceSettings[0]);
        if(this.VoiceSetting.res_message != ""){
            console.error("System Setting Parse Error", VoiceSetting);
        }
        var jtalks = new Object();
        if(message.guild == null) return;
        const gid = message.guild.id;
        jtalks[gid] = new OpenJTalk(this.VoiceConfig, this.VoiceSetting.res);
    
        let str = message.content;
        str=str.replace(/(h?ttps?:\/\/)([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=~]*)?/g, ' URL省略 ');
        str=str.replace(/<(@!|#)[0-9]+>/g, ''); // ユーザー・チャンネル名削除
        str=str.replace(/(<:[^:]+:[0-9]+>|:[\w_]+:)/g, ' 絵文字 ');
        str=str.replace(/\n/g, " ");
        str=str.replace(/～/g, "ー");
        str=emoji.replace(str, () => " 絵文字 "); // 絵文字除去
        
        console.log("str: ", str);
    
        jtalks[gid].makeWav(str, (err, res)=>{
            try {
                fs.unlinkSync(res.txt_path);
            } catch (error) {
            }
            if(err != null) {
                console.error(err);
                try {
                    fs.unlinkSync(res.wav);
                } catch (error) {}
                return;
            }
            const resource = createAudioResource(res.wav);
            this.player.play(resource);
        });
    }
}