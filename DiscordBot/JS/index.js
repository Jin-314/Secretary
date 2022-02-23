const { Client, Collection, Intents} = require('discord.js');
const fs = require('fs');
const musicPlayer = require("./commands/PlayMusic");
const read = require("./commands/ReadBot.js");

const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES);

// Discord Clientのインスタンス作成
const client = new Client({ intents: myIntents })

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.on('ready', message =>{
    console.log('Bot準備完了！');
    client.user.setActivity('Jinとのあれこれ', {type : 'PLAYING'});
});

client.on('message', message =>{
    if(message.author.bot) return; //BOTのメッセージには反応しない

    if(message.content === "stop"){
        if(message.channel.toString() === musicPlayer.channel){
            if(musicPlayer.player.state.status === "playing"){
                message.reply('再生を終了します。');
                musicPlayer.player.stop();
            }
        }
    }
    if(read.isReadStarted && read.channel === message.channel.toString()){
        if(message.content === "/stop"){
            message.reply('読み上げを終了します。');
            read.player.stop();
            read.conn.destroy();
            read.isReadStarted = false;
        }else{
            read.talk(message);
        }        
    }

})

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'コマンド実行時にエラーが発生しました。', ephemeral: true});
    }
});

client.login(process.env.DISCORD_TOKEN);