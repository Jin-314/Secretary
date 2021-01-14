from discord.ext import commands
import discord
import requests
import json
import datetime

class COVID(commands.Cog):

    def __init__(self, bot):
        super(COVID, self).__init__()
        self.bot = bot

    @commands.command(description="全国のCOVID情報を出します。",
                    brief="全国のCOVID情報")
    async def CA(self, ctx):
        urlPatient = "https://data.corona.go.jp/converted-json/covid19japan-npatients.json"
        urlDeath = "https://data.corona.go.jp/converted-json/covid19japan-ndeaths.json"
        responsePatient = requests.get(urlPatient)
        responseDeath = requests.get(urlDeath)
        dataPatient = responsePatient.json()
        dataDeath = responseDeath.json()
        dataPatient = json.loads(responsePatient.text)
        dataDeath = json.loads(responseDeath.text)

        idxPatient = len(dataPatient) - 1
        idxDeath = len(dataDeath) - 1
        dt=datetime.datetime.strptime(dataPatient[idxPatient]["date"], '%Y-%m-%d')

        embed = discord.Embed(title="全国の"+dt.strftime('%Y年%m月%d日')+"のCOVID情報",color=0xff0000)
        embed.add_field(name="感染者情報",value="全国の感染者情報です。",inline=False)
        embed.add_field(name="累計感染者数",value=str(dataPatient[idxPatient]["npatients"])+"人")
        embed.add_field(name="1日の感染者数",value=str(dataPatient[idxPatient]["adpatients"])+"人")
        embed.add_field(name="死者情報",value="全国の死者情報です。",inline=False)
        embed.add_field(name="累計死者数",value=str(dataDeath[idxDeath]["ndeaths"])+"人")
        embed.add_field(name="1日の死者数",value=str(dataDeath[idxDeath]["ndeaths"]-dataDeath[idxDeath-1]["ndeaths"])+"人")
        await ctx.send(embed=embed)

    @commands.command(description="県ごとのCOVID情報を出します。",
                    brief="県ごとのCOVID情報")
    async def CP(self, ctx, prefecture):
        url="https://opendata.corona.go.jp/api/Covid19JapanAll?dataName=" + prefecture
        response=requests.get(url)
        data=response.json()
        data=json.loads(response.text)
        dt=datetime.datetime.strptime(data["itemList"][0]["date"], '%Y-%m-%d')

        embed = discord.Embed(title=prefecture+"の"+dt.strftime('%Y年%m月%d日')+"のCOVID情報",color=0x4b0082)
        embed.add_field(name="感染者情報", value=prefecture+"の感染者情報です。",inline=False)
        embed.add_field(name="累計感染者数",value=str(data["itemList"][0]["npatients"])+"人")
        embed.add_field(name="1日の感染者数",value=str(int(data["itemList"][0]["npatients"])-int(data["itemList"][1]["npatients"]))+"人")
        await ctx.send(embed=embed)
