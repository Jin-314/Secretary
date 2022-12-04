# Jin's Secretary
 
Jinの忠実なるしもべ"Jinの秘書"のオープンソースレポジトリです！！
<div>
 <img src="img/Secretary-Icon.png" width="320px">
</div>

# Requirement

このBOTは複数のSNSにて運用されるbotになります。
DiscordやTwitterなどに様々な情報を発信します。

自分の管理するDiscordサーバーに導入が可能です！
導入には管理者権限が必要です。
 
# Usage

DiscordBotの招待
以下のページにアクセス↓

https://discord.com/api/oauth2/authorize?client_id=1046616624934957106&permissions=8&scope=bot%20applications.commands

自分が管理者のサーバーを選択し、招待！！

# Commands

様々なスラッシュコマンドを実装しています。

## COVID

![image](https://user-images.githubusercontent.com/58265068/205469111-fbc1c9a5-16dd-4a8a-b89d-a37943ee6909.png)  
  
`/covid all`で1，2日前の日本全国の新型コロナウイルス感染情報を提示してくれます。  
`/covid prefecture <prefecture-name>`ではその都道府県の感染者情報を提示します。  
  
![image](https://user-images.githubusercontent.com/58265068/205469067-c3695637-781c-4554-8685-af98f7bcfa0c.png)
![image](https://user-images.githubusercontent.com/58265068/205469024-43df54bc-4527-415b-9bea-cee59b19d2f0.png)  

## Weather

![image](https://user-images.githubusercontent.com/58265068/205469119-1e829956-ed1e-40ad-aef7-63bf8e70dbb3.png)  
  
`/weather info <city-name>`ではその都市の現在の天気を、  
`/weather forecast <date(何日後か)> <city-name>`ではdata日後の都市の天気予報を提示してくれます。  
  
![image](https://user-images.githubusercontent.com/58265068/205469297-f4d6790b-918f-486c-94e2-9ec1e848164e.png)
![image](https://user-images.githubusercontent.com/58265068/205469304-1fc886d7-6f5d-4542-94d1-7ed97f277e58.png)

## Vote
 
`/vote start <title> <description> <choice1> <choice2> <choice3(option)> <choice4(option)> <choice5(option)>`  
このコマンドでは投票を開始できます。選択肢は2つが必須で最大5つまで可能です。リアクションで集計する感じです。（集計結果の表示などは今後実装予定...）  
![image](https://user-images.githubusercontent.com/58265068/205469435-a43ecaa8-6408-4a87-941f-c85cc0ec2ab8.png)

## Read

音声読み上げ機能も実装されています。`/read start`や`/read stop`で開始・終了できます。開始時はＶＣに接続しないと参加できませんのでご了承ください。
辞書追加や音声の変更は今後実装予定です。  
![image](https://user-images.githubusercontent.com/58265068/205469481-d7b61291-cd18-4b65-abed-858d2478bfc0.png)  

## Youtube再生

![image](https://user-images.githubusercontent.com/58265068/205469492-1d0afa51-ce90-41f9-969c-081cc9a02d7b.png)  
YoutubeをVCで再生することも可能です。`/movie play <url>`で開始します。キューを参照する場合は`/movie list`を使用してください。  
その他コマンドは基本的なプレイヤーの機能です。

## 音楽再生
![image](https://user-images.githubusercontent.com/58265068/205469545-aab07118-c7ec-4439-9609-864b915b26f1.png)  
`/music play`を使用すると癒しミュージックを再生してくれます。今のところは一曲しかありませんが今後増やしていくつもりですのでご期待ください。
 
# Note
 
サーバーは3時ごろに再起動します。

