import os
from discord.ext import commands
import discord
import logging
import numpy as np

BOT_PREFIX = ('!!')

client = commands.Bot(command_prefix=BOT_PREFIX)

activity = discord.Activity(name='メインモード', type=discord.ActivityType.playing)

formatter = '%(asctime)s:%(levelname)s:%(name)s: %(message)s'

logging.basicConfig(filename='/var/log/Maindiscord.log', level=logging.DEBUG, format=formatter)
logger = logging.getLogger('discord')

@client.command(description="後に続く数の和を求めます",
                brief="数の合計")
async def add(ctx, *num: float):
    await ctx.send(np.sum(num))

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
async def on_command_error(ctx, error):
    logger.error(error)

@client.event
async def on_ready():
    logger.info('ユーザー名：' + client.user.name)
    logger.info('ユーザーid：' + str(client.user.id))
    await client.change_presence(activity=activity)

client.run(os.environ.get("DISCORD_TOKEN"))
