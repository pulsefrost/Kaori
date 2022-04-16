
# Discord
「分かりやすい」をモットーに開発した多機能 (予定) DiscordBOTです。

一つ一つの機能の自由度が高く、ユーザーの希望にできる限り沿った設定が可能です。

# Features
【機能】
* 入退室ログ機能 ... BOTが稼働しているサーバーの入室した・退出したログを送信することができます。

【コマンド】
* settingコマンド ... 各機能の詳しい設定を行えます。機能の有効化・無効化に加え、設定の初期化等も行えます。 (写真は入退室ログの設定です)
![image](https://cdn.discordapp.com/attachments/958791423161954445/964864179276230706/unknown.png)


# Requirement
このBOTの動作には以下のライブラリが必要です。

* discord.js@13.6.0
* @discordjs/builders@0.12.0
* @discordjs/rest@0.3.0
* discord-api-types@0.30.0
* dotenv@16.0.0
* discord-modals@1.3.5

# Installation
以下のコマンドをコンソールに入力することで必要なライブラリをインストールできます。
```npm
npm i
```

# Usage
このBOTを起動する前に、Release欄にある`config.json`をダウンロードし、`index.js`と同じディレクトリに配置する必要があります。 

また、新規作成した`.env` にはDiscordBOTのtokenを入力します。

(注意:tokenは漏洩するとサーバー荒らし等に使用される場合があるため、取り扱いには十分注意してください。)
```
BOT_TOKEN=DiscordBOTのtoken
```

また、サーバーにスラッシュコマンドを登録するには、deploy-commands.jsを実行します。
(スラッシュコマンドの動作等を変更しない限り、一回の起動だけで大丈夫です。)
```
node .\deploy-commands.js
```

# Note
* このBOTは**1つのサーバー**のみの使用を前提に開発しています。2つ以上のサーバーで稼働させることはおすすめしません。(将来改善します)
* カスタマイズしたDiscordBOTの動作不良に関しては問い合わせても対応できかねます。
