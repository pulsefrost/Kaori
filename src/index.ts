import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

import { ActivityType, AllowedMentionsTypes, Client, codeBlock, Colors, EmbedBuilder, Events, GatewayIntentBits, Partials, version } from 'discord.js';
import { DiscordInteractions, ErrorCodes, InteractionsError } from '@akki256/discord-interaction';
import { DiscordEvents } from './module/events';
import { isBlocked } from './module/functions';
import mongoose from 'mongoose';
import cron from 'node-cron';
import changeVerificationLevel from './cron/changeVerificationLevel';
import ServerSettings from './schemas/ServerSettings';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [
    Partials.Channel, Partials.GuildMember,
    Partials.Message, Partials.User,
  ],
  allowedMentions: {
    parse: [
      AllowedMentionsTypes.Role, AllowedMentionsTypes.User,
    ],
  },
});

const events = new DiscordEvents(client);
const interactions = new DiscordInteractions(client);
interactions.loadRegistries(path.resolve(__dirname, './interactions'));

client.once(Events.ClientReady, () => {
  console.log('[INFO] BOT ready!');
  console.table({
    'Bot User': client.user?.tag,
    'Guild(s)': `${client.guilds.cache.size} Servers`,
    'Watching': `${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)} Members`,
    'Discord.js': `v${version}`,
    'Node.js': process.version,
    'Platform': `${process.platform} | ${process.arch}`,
    'Memory': `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB | ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)}MB`,
  });

  interactions.registerCommands({ guildId: process.env.GUILD_ID ?? undefined, deleteNoLoad: true });
  events.register(path.resolve(__dirname, './events'));
  reloadActivity();

  cron.schedule('0 * * * *', () => changeVerificationLevel(client));
});

client.on(Events.GuildCreate, () => reloadActivity());
client.on(Events.GuildDelete, async (guild) => {
  ServerSettings.deleteOne({ serverId: guild.id }).exec();
  reloadActivity();
});

client.on(Events.InteractionCreate, interaction => {
  if (!interaction.isRepliable()) return;

  if (isBlocked(interaction.guild))
    interaction.reply({
      content: `\`🚫\` L'utilisation de ${interaction.client.user.username} est interdite sur ce serveur. Pour faire appel, [cliquez ici](https://discord.gg/fVcjCNn733)`,
      ephemeral: true,
    });

  interactions.run(interaction)
    .catch((err) => {
      if (err instanceof InteractionsError && err.code === ErrorCodes.CommandHasCoolTime)
        return interaction.reply({ content: '`⌛` La commande est en cooldown', ephemeral: true });
      console.log(err);
    });
});

process.on('uncaughtException', (err) => {
  console.error(err);

  client.channels.fetch(process.env.LOG_CHANNEL_ID).then(channel => {
    if (!channel?.isTextBased()) return;
    channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('`❌` Une exception s\'est produite')
          .setDescription(codeBlock(`${err.stack}`))
          .setColor(Colors.Red)
          .setTimestamp(),
      ],
    });
  });
});

function reloadActivity() {
  client.user?.setActivity({ name: `${client.guilds.cache.size} serveurs`, type: ActivityType.Competing });
}

client.login(process.env.BOT_TOKEN);
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DBNAME });