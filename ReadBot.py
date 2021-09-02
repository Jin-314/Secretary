import discord
from discord.ext import commands
import subprocess
import ffmpeg
from voice_generator import creat_WAV

class Read(commands.Cog):

    def __init__(self, bot):
        super(Read, self).__init__()
        self.bot = bot

    @commands.command(description="ボイスチャンネルに接続し、読み上げを開始します。",
                      brief="読み上げの開始")
    async def join(self, ctx):
        print('voicechannelを取得')
        vc = ctx.author.voice.channel
        print('voicechannelに接続')
        await vc.connect()

    @commands.command(description="ボイスチャンネルから切断し、読み上げを終了します。",
                      brief="読み上げの終了")
    async def bye(self, ctx):
        print ('切断')
        await ctx.voice_client.disconnect()
