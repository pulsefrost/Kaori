import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

import { ActivityType, AllowedMentionsTypes, Client, codeBlock, Colors, EmbedBuilder, Events, GatewayIntentBits, Partials, version } from 'discord.js';
import { DiscordInteractions, ErrorCodes, InteractionsError } from '@akki256/discord-interaction';
import { DiscordEvents } from './module/events';
import { guildId, admin } from '../config.json';
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
  console.log('[INFO] Le BOT est prêt !');
  console.table({
    'Utilisateur du BOT': client.user?.tag,
    'Serveur(s)': `${client.guilds.cache.size} Serveurs`,
    'En train d\'observer': `${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)} Membres`,
    'Discord.js': `v${version}`,
    'Node.js': process.version,
    'Plateforme': `${process.platform} | ${process.arch}`,
    'Mémoire': `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} Mo | ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} Mo`,
  });

  interactions.registerCommands({ guildId: guildId ?? undefined, deleteNoLoad: true });
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
      content: `\`🚫\` L'utilisation de ${interaction.client.user.username} sur ce serveur est interdite. Les réclamations peuvent être déposées [ici](https://discord.gg/fVcjCNn733)`,
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

  client.channels.fetch(admin.error).then(channel => {
    if (!channel?.isTextBased()) return;
    channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('`❌` Une exception a été levée')
          .setDescription(codeBlock(`${err.stack}`))
          .setColor(Colors.Red)
          .setTimestamp(),
      ],
    });
  });
});

function reloadActivity() {
  client.user?.setActivity({ name: `${client.guilds.cache.size} Serveurs`, type: ActivityType.Competing });
}

client.login(process.env.BOT_TOKEN);
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DBNAME });