import os
from discord.ext import commands
import discord
import numpy as np

BOT_PREFIX = ('??', '!!')

client = commands.Bot(command_prefix=BOT_PREFIX)

activity = discord.Activity(name='テストモード', type=discord.ActivityType.playing)

@client.command(description="あああああああああ",
                brief="いいいあｓだｓｄ")
async def add(*num: float):
    await client.say(np.sum(num))

@client.event
async def on_message(message):
    await client.process_commands(message)

    #Botとメッセージの送信者が同じ場合は何もしない
    if client.user == message.author:
        return
    if message.content.startswith("こんにちは"):
        m = "こんにちは！" + message.author.name + "さん！\n"
        await message.channel.send(m)

@client.event
async def on_ready():
    print('以下のユーザー名でログインしています')
    print('ユーザー名：' + client.user.name)
    print('ユーザーid：' + str(client.user.id))
    print('-------------------------------------')
    await client.change_presence(activity=activity)

client.run(os.environ.get("DISCORD_TOKEN"))
