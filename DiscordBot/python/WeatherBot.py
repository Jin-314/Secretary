import os
from discord.ext import commands
import discord
import logging
import requests
import json
import datetime
import re
import sys

class Weather(commands.Cog):

    def __init__(self, bot):
        super().__init__()
        self.bot = bot

    def getLatitude(self, city_name):
        key = os.environ.get("API_KEY_Y")
        url = "https://map.yahooapis.jp/geocode/V1/geoCoder?appid=" + key + "&output=json&query=" + city_name

        response = requests.get(url)
        data = response.json()

        return data["Feature"][0]["Geometry"]["Coordinates"]

    def getData(self, city_name):
        latitudeList = self.getLatitude(city_name).split(",")
        key = os.environ.get("API_KEY")
        url = "http://api.openweathermap.org/data/2.5/onecall?APPID=" + key + "&lat=" + latitudeList[1] + "&lon=" + latitudeList[0] + "&units=metric&lang=ja"
        print(url)

        response=requests.get(url)
        data=response.json()
        data=json.loads(response.text)
        return data

    @commands.command(description="お天気を出します。", brief="お天気情報")
    async def W(self, ctx, city_name):
        data = self.getData(city_name)
        imgurl = "http://openweathermap.org/img/w/" + data["current"]["weather"][0]["icon"] + ".png"
        dt = datetime.datetime.fromtimestamp(data["current"]["dt"])

        embed = discord.Embed(title=city_name+"のお天気情報",color=0xff7f50)
        embed.set_image(url=imgurl)
        embed.add_field(name="時刻",value=dt.strftime('%Y/%m/%d %H:%M'),inline=False)
        embed.add_field(name="天気",value=data["current"]["weather"][0]["main"])
        embed.add_field(name="説明",value=data["current"]["weather"][0]["description"],inline=False)
        embed.add_field(name="気温",value=data["current"]["temp"])
        embed.add_field(name="気圧",value=data["current"]["pressure"])
        embed.add_field(name="湿度",value=data["current"]["humidity"])
        await ctx.send(embed=embed)

    @commands.command(description="お天気予報を出します。dateには何日後の予報か入力してください。", brief="お天気予報")
    async def WF(self, ctx, city_name, date):
        data = self.getData(city_name)
        index = int(re.sub("\\D", "", date))
        if index < 1 or index > 7:
            await ctx.send("範囲外です。0の場合は!!help Wを参照してください")
            return
        dt = datetime.datetime.fromtimestamp(data["daily"][index]["dt"])
        imgurl = "http://openweathermap.org/img/w/" + data["daily"][index]["weather"][0]["icon"] + ".png"

        embed = discord.Embed(title=city_name+"の"+dt.strftime('%Y/%m/%d')+"の天気予報",color=0x008b8b)
        embed.set_image(url=imgurl)
        embed.add_field(name="天気",value=data["daily"][index]["weather"][0]["main"])
        embed.add_field(name="説明",value=data["daily"][index]["weather"][0]["description"],inline=False)
        embed.add_field(name="気圧",value=str(data["daily"][index]["pressure"])+" hPa")
        embed.add_field(name="湿度",value=str(data["daily"][index]["humidity"])+" %")
        embed.add_field(name="気温",value="気温の詳細です。",inline=False)
        embed.add_field(name="最高気温",value=str(data["daily"][index]["temp"]["max"])+" ℃")
        embed.add_field(name="最低気温",value=str(data["daily"][index]["temp"]["min"])+" ℃")
        embed.add_field(name="朝方",value=str(data["daily"][index]["temp"]["morn"])+" ℃")
        embed.add_field(name="日中",value=str(data["daily"][index]["temp"]["day"])+" ℃")
        embed.add_field(name="夜",value=str(data["daily"][index]["temp"]["night"])+" ℃")
        await ctx.send(embed=embed)
