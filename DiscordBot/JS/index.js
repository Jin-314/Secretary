const { Client, Collection, Intents} = require('discord.js');
const fs = require('fs');
const path = require('path');
const read = require(path.join(__dirname, "/commands/ReadBot.js"));

const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES);

// Discord Clientのインスタンス作成
const client = new Client({ intents: myIntents })

client.commands = new Collection();

const commandFiles = fs.readdirSync(path.join(__dirname, "/commands/")).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(__dirname, `/commands/${file}`));
    client.commands.set(command.data.name, command);
}

client.on('ready', message =>{
    console.log('Bot準備完了！');
    client.user.setActivity('Jinとのあれこれ', {type : 'PLAYING'});
});

client.on('message', message =>{
    if(message.author.bot) return; //BOTのメッセージには反応しない

    if(read.isReadStarted && read.channel === message.channel.toString()){
        read.talk(message); 
    }
});

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