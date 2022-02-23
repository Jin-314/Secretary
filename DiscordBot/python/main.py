import os
from discord.ext import commands
import discord
import logging
import requests
from WeatherBot import Weather
from ToolsBot import Tools
from COVIDBot import COVID
from ReadBot import Read
from voice_generator import creat_WAV

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
voice_client = None

activity = discord.Activity(name='メインモード', type=discord.ActivityType.playing)

formatter = '%(asctime)s:%(levelname)s:%(name)s: %(message)s'

logging.basicConfig(filename='/var/log/Maindiscord.log', level=logging.DEBUG, format=formatter)
logger = logging.getLogger('discord')

@client.event
async def on_message(message):
    global channelid

    #Botとメッセージの送信者が同じ場合は何もしない
    if client.user == message.author:
        return
    if message.content.startswith("こんにちは"):
        m = "こんにちは！" + message.author.name + "さん！\n"
        await message.channel.send(m)
    if message.content.startswith("にゃーん"):
        msg = "にゃ～ん" + message.author.name + "🐈\n"
        await message.channel.send(msg)

    if message.content == "!!join":
        channelid = message.channel.id
        print(channelid)

    if message.content.startswith(BOT_PREFIX):
        pass

    else:
        if message.guild.voice_client:
            if message.channel.id == channelid:
                print(message.content)
                creat_WAV(message.content)
                source = discord.FFmpegPCMAudio("output.wav")
                message.guild.voice_client.play(source)
            else:
                pass
    await client.process_commands(message)

@client.event
async def on_command_error(ctx, error):
    if isinstance(error, discord.ext.commands.errors.MissingPermissions):
        embed = discord.Embed(title=":x: 失敗 -MissingPermissions", description=f"実行者の必要な権限が無いため実行出来ません。", timestamp=ctx.message.created_at, color=discord.Colour.red())
        embed.set_footer(text="'!!help'でヘルプコマンドを参照してください")
        await ctx.send(embed=embed)
    elif isinstance(error, discord.ext.commands.errors.BotMissingPermissions):
        embed = discord.Embed(title=":x: 失敗 -BotMissingPermissions", description=f"Botの必要な権限が無いため実行出来ません。", timestamp=ctx.message.created_at, color=discord.Colour.red())
        embed.set_footer(text="'!!help'でヘルプコマンドを参照してください")
        await ctx.send(embed=embed)
    elif isinstance(error, discord.ext.commands.errors.CommandNotFound):
        embed = discord.Embed(title=":x: 失敗 -CommandNotFound", description=f"不明なコマンドもしくは現在使用不可能なコマンドです。", timestamp=ctx.message.created_at, color=discord.Colour.red())
        embed.set_footer(text="'!!help'でヘルプコマンドを参照してください")
        await ctx.send(embed=embed)
    elif isinstance(error, discord.ext.commands.errors.MemberNotFound):
        embed = discord.Embed(title=":x: 失敗 -MemberNotFound", description=f"指定されたメンバーが見つかりません。", timestamp=ctx.message.created_at, color=discord.Colour.red())
        embed.set_footer(text="'!!help'でヘルプコマンドを参照してください")
        await ctx.send(embed=embed)
    elif isinstance(error, discord.ext.commands.errors.BadArgument):
        embed = discord.Embed(title=":x: 失敗 -BadArgument", description=f"指定された引数がエラーを起こしているため実行出来ません。", timestamp=ctx.message.created_at, color=discord.Colour.red())
        embed.set_footer(text="'!!help'でヘルプコマンドを参照してください")
        await ctx.send(embed=embed) 
    elif isinstance(error, discord.ext.commands.errors.MissingRequiredArgument):
        embed = discord.Embed(title=":x: 失敗 -BadArgument", description=f"指定された引数が足りないため実行出来ません。", timestamp=ctx.message.created_at, color=discord.Colour.red())
        embed.set_footer(text="'!!help'でヘルプコマンドを参照してください")
        await ctx.send(embed=embed) 
    else:
        raise error
    
    logger.error(error)

@client.event
async def on_ready():
    logger.info('ユーザー名：' + client.user.name)
    logger.info('ユーザーid：' + str(client.user.id))
    await client.change_presence(activity=activity)

client.add_cog(Weather(bot=client))
client.add_cog(Tools(bot=client))
client.add_cog(COVID(bot=client))
client.add_cog(Read(bot=client))
client.run(os.environ.get("DISCORD_TOKEN"))
