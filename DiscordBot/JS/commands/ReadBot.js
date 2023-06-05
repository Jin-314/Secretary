const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, VoiceConnection, AudioPlayer } = require("@discordjs/voice");
const path = require('path');
const OpenJTalk = require(path.join(__dirname, '/CommandModules/OpenJTalk'));
const JSON5     = require('json5');
const emoji     = require('node-emoji');
const fs        = require('fs');
const voicePath = path.join(__dirname, "/BotData/VoiceData.json");

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
            .setDescription('テキスト読み上げを停止します。'))
        .addSubcommand(subcommand =>
            subcommand
            .setName('voice')
            .setDescription('声を変更します。')
            .addStringOption(option =>
                option
                .setName('name')
                .setDescription('誰の声にするか。"list"と入力すると読み上げ可能な音声のリストを取得できます。')
                .setRequired(true))),
    channels : new Array(),
    isReadStarted : {},
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
            takumi      : '/usr/share/hts-voice/takumi/takumi_normal',
            takumi_angry: '/usr/share/hts-voice/takumi/takumi_angry',
            takumi_happy: '/usr/share/hts-voice/takumi/takumi_happy',
            takumi_sad  : '/usr/share/hts-voice/takumi/takumi_sad',
            gentlemen   : '/usr/share/hts-voice/20代男性01_1.0/20代男性01',
            nitech      : '/usr/share/hts-voice/ts_voice_nitech_jp_atr503_m001-1.05/nitech_jp_atr503_m001',
            tohoku      : '/usr/share/hts-voice/tohoku/tohoku-f01-neutral',
            tohoku_angry: '/usr/share/hts-voice/tohoku/tohoku-f01-angry',
            tohoku_happy: '/usr/share/hts-voice/tohoku/tohoku-f01-happy',
            tohoku_sad  : '/usr/share/hts-voice/tohoku/tohoku-f01-sad',
            nanairo     : '/usr/share/hts-voice/なないろニジ_1.0/なないろニジ',
            giruko      : '/usr/share/hts-voice/カマ声ギル子_1.0/?カマ声ギル子',
            gurimaru    : '/usr/share/hts-voice/グリマルキン_1.0/グリマルキン_1.0',
            sranki      : '/usr/share/hts-voice/スランキ_1.0/スランキ ',
            watashi     : '/usr/share/hts-voice/ワタシ_1.0/ワタシ',
            wamea       : '/usr/share/hts-voice/飴音わめあ_1.0/飴音わめあ',
            sakura      : '/usr/share/hts-voice/闇夜 桜_1.0/闇夜 桜_1.0',
            ai          : '/usr/share/hts-voice/遠藤愛_1.0/遠藤愛',
            rakan       : '/usr/share/hts-voice/戯歌ラカン_1.0/戯歌ラカン',
            kaoru       : '/usr/share/hts-voice/京歌カオル_1.0/京歌カオル',
            kono        : '/usr/share/hts-voice/句音コノ。_1.0/句音コノ。',
            kanata      : '/usr/share/hts-voice/空唄カナタ_1.0/空唄カナタ',
            rami        : '/usr/share/hts-voice/月音ラミ_1.0/月音ラミ_1.0',
            homu        : '/usr/share/hts-voice/沙音ほむ_1.0/沙音ほむ',
            rou         : '/usr/share/hts-voice/獣音ロウ_1.0/獣音ロウ',
            yoe         : '/usr/share/hts-voice/唱地ヨエ_1.0/唱地ヨエ',
            matsuo      : '/usr/share/hts-voice/松尾P_1.0/松尾P',
            huuki       : '/usr/share/hts-voice/薪宮風季_1.0/薪宮風季',
            mizuki      : '/usr/share/hts-voice/瑞歌ミズキ_Talk_1.0/瑞歌ミズキ_Talk',
            koto        : '/usr/share/hts-voice/誠音コト_1.0/誠音コト',
            ikuto       : '/usr/share/hts-voice/想音いくと_1.0/想音いくと',
            ikuru       : '/usr/share/hts-voice/想音いくる_1.0/想音いくる',
            nero        : '/usr/share/hts-voice/蒼歌ネロ_1.0/蒼歌ネロ',
            riyon       : '/usr/share/hts-voice/天月りよん_1.0/天月りよん',
            momo        : '/usr/share/hts-voice/桃音モモ_1.0/桃音モモ',
            sou         : '/usr/share/hts-voice/能民音ソウ_1.0/能民音ソウ',
            mai         : '/usr/share/hts-voice/白狐舞_1.0/白狐舞',
            akesato     : '/usr/share/hts-voice/緋惺_1.0/緋惺',
            ichiri      : '/usr/share/hts-voice/遊音一莉_1.0/遊音一莉',
            shiba       : '/usr/share/hts-voice/和音シバ_1.0/和音シバ',
            miku_a      : '/usr/share/hts-voice/miku/miku-a',
            miku_b      : '/usr/share/hts-voice/miku/miku-b'
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
    VoiceSetting : {
        res : {},
        res_message : '',
    },
    player : new Array(),
    jtalks : new Object(),
    conn : new Object,
    async execute(interaction){
        if (interaction.options.getSubcommand() === "start"){
            const guild = interaction.guild;
            const guildid = interaction.guild.id;
            this.channels[guildid] = interaction.channel.toString();
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
    
            this.player[guildid] = new AudioPlayer();
            this.player[guildid] = createAudioPlayer();
            this.conn.subscribe(this.player[guildid]);
    
            this.isReadStarted[interaction.guild.id] = true;

        }else if(interaction.options.getSubcommand() === "stop"){
            const guildid = interaction.guild.id;
            if(this.isReadStarted[interaction.guild.id]){
                interaction.reply('読み上げを終了します。');
                this.player[guildid].stop();
                this.conn.destroy();
                this.isReadStarted[interaction.guild.id] = false;
            }else{
                interaction.reply('読み上げは開始されていません。')
            }
        }else if(interaction.options.getSubcommand() === "voice"){
            const userid = interaction.user.id;
            const data = JSON.parse(fs.readFileSync(voicePath, 'UTF-8'));
            const voice = interaction.options.getString('name');
            if(this.VoiceConfig.voice_list[voice] != null){
                data[userid] = "voice: '" + voice + "'";
                fs.writeFileSync(voicePath, JSON.stringify(data));
                await interaction.reply(`あなたの声を${voice}に設定しました。`);
            }else if(voice === "list"){
                let str = "\n**読み上げ可能な音声のリストです。**\n\n"
                for(const key in this.VoiceConfig.voice_list){
                    str += `> ${key}\n`;
                }
                await interaction.reply(str);
            }else{
                await interaction.reply(`${voice}は存在しない何者かの声です。`)
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
        const guildid = message.guild.id;
        const userid = message.author.id;
        const data = JSON.parse(fs.readFileSync(voicePath, 'UTF-8'));
        if(data[userid]!=null){
            this.VoiceSetting = this.parse_option(data[userid]);
        }else{
            var keys = Object.keys(this.VoiceConfig.voice_list);
            var randomKey = keys[Math.floor(Math.random()*keys.length)];
            data[userid] = "voice: '" + randomKey + "'";
            fs.writeFileSync(voicePath, JSON.stringify(data));
            this.VoiceSetting = this.parse_option(data[userid]);
            message.reply(`あなたの声を${randomKey}に設定しました。`)
        }
        if(this.VoiceSetting.res_message != ""){
            console.error("System Setting Parse Error", this.VoiceSetting);
        }
        if(message.guild == null) return;
        this.jtalks[guildid] = new OpenJTalk(this.VoiceConfig, this.VoiceSetting.res);

        let str = message.content;
        str=str.replace(/(h?ttps?:\/\/)([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=~]*)?/g, ' URL省略 ');
        str=str.replace(/<(@!|#)[0-9]+>/g, ''); // ユーザー・チャンネル名削除
        str=str.replace(/(<:[^:]+:[0-9]+>|:[\w_]+:)/g, ' 絵文字 ');
        str=str.replace(/\n/g, " ");
        str=str.replace(/～/g, "ー");
        str=emoji.replace(str, () => " 絵文字 "); // 絵文字除去
        
        console.log("str: ", str);
    
        this.jtalks[guildid].makeWav(str, (err, res)=>{
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
            this.player[guildid].play(resource);
        });
    }
}