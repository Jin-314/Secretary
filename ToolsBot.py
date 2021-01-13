from discord.ext import commands
import discord
import numpy as np

class Tools(commands.Cog):

    def __init__(self, bot):
        super().__init__()
        self.bot = bot

    @commands.command(description="後に続く数の和を求めます。",
                    brief="数の合計")
    async def add(ctx, *num: float):
        await ctx.send(np.sum(num))
