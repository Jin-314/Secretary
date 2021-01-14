import os
from discord.ext import commands
import discord
import logging
import requests
import json
import numpy as np
from WeatherBot import Weather
from ToolsBot import Tools
from COVIDBot import COVID

BOT_PREFIX = ('!!')

class JapaneseHelpCommand(commands.DefaultHelpCommand):
    def __init__(self):
        super().__init__()
        self.commands_heading = "コマンド:"
        self.no_category = "その他"
        self.command_attrs["help"] = "コマンド一覧と簡単な説明を表示"

    def get_ending_note(self):
        return (f"各コマンドの説明: {BOT_PREFIX}help <コマンド名>\n"
                f"各カテゴリの説明: {BOT_PREFIX}help <カテゴリ名>\n")

client = commands.Bot(command_prefix=BOT_PREFIX, help_command=JapaneseHelpCommand())

activity = discord.Activity(name='メインモード', type=discord.ActivityType.playing)

formatter = '%(asctime)s:%(levelname)s:%(name)s: %(message)s'

logging.basicConfig(filename='/var/log/Maindiscord.log', level=logging.DEBUG, format=formatter)
logger = logging.getLogger('discord')

@client.event
async def on_message(message):
    await client.process_commands(message)

    #Botとメッセージの送信者が同じ場合は何もしない
    if client.user == message.author:
        return
    if message.content.startswith("こんにちは"):
        m = "こんにちは！" + message.author.name + "さん！\n"
        await message.channel.send(m)
    if message.content.startswith("にゃーん"):
        msg = "にゃ～ん" + message.author.name + "🐈\n"
        await message.channel.send(msg)

@client.event
async def on_command_error(ctx, error):
    logger.error(error)

@client.event
async def on_ready():
    logger.info('ユーザー名：' + client.user.name)
    logger.info('ユーザーid：' + str(client.user.id))
    await client.change_presence(activity=activity)

client.add_cog(Weather(bot=client))
client.add_cog(Tools(bot=client))
client.add_cog(COVID(bot=client))
client.run(os.environ.get("DISCORD_TOKEN"))
