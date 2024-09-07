import { ChannelType, EmbedBuilder, Events, Guild } from 'discord.js';
import { DiscordEventBuilder } from '../module/events';
import GuildCache from '../schemas/GuildCaches';

// ID du salon où les informations seront envoyées
const INFO_CHANNEL_ID = '1256686169282838640'; // Remplacez par l'ID du salon souhaité

// Fonction pour envoyer des informations lors de l'ajout d'un serveur
async function sendGuildInfo(guild: Guild) {
  const channel = guild.client.channels.cache.get(INFO_CHANNEL_ID);
  if (!channel || !channel.isTextBased()) return;

  const owner = await guild.fetchOwner();
  const embed = new EmbedBuilder()
    .setTitle('Nouveau Serveur!')
    .setDescription(`Le bot a été ajouté au serveur ${guild.name}.`)
    .addFields(
      { name: 'ID du Serveur', value: `${guild.id}`, inline: true },
      { name: 'Nombre de Membres', value: `${guild.memberCount}`, inline: true },
      { name: 'Nombre de Boosts', value: `${guild.premiumSubscriptionCount || 0}`, inline: true },
      { name: 'Créateur', value: `${owner.user.tag}`, inline: true }
    )
    .setColor('#00FF00');

  if (guild.bannerURL()) {
    embed.setImage(guild.bannerURL());
  }

  channel.send({ embeds: [embed] });
}

// Fonction pour envoyer des informations lors du retrait d'un serveur
async function sendGuildRemovalInfo(guild: Guild) {
  const channel = guild.client.channels.cache.get(INFO_CHANNEL_ID);
  if (!channel || !channel.isTextBased()) return;

  const embed = new EmbedBuilder()
    .setTitle('Bot Retiré!')
    .setDescription(`Le bot a été retiré du serveur ${guild.name}.`)
    .addFields(
      { name: 'ID du Serveur', value: `${guild.id}`, inline: true }
    )
    .setColor('#FF0000');

  channel.send({ embeds: [embed] });
}

const manageGuildCache = [
  new DiscordEventBuilder({
    type: Events.GuildCreate,
    execute: async (guild) => {
      await findOneAndCreateGuildCache(guild.id);
      await sendGuildInfo(guild);
    },
  }),
  new DiscordEventBuilder({
    type: Events.GuildDelete,
    execute: async (guild) => {
      await GuildCache.deleteOne({ serverId: guild.id }).exec();
      await sendGuildRemovalInfo(guild);
    },
  }),
  new DiscordEventBuilder({
    type: Events.MessageCreate,
    execute: async (message) => {
      if (!message.inGuild()) return;
      await findOneAndCreateGuildCache(message.guildId);
    },
  }),
];

async function findOneAndCreateGuildCache(guildId: string) {
  if (await GuildCache.findOne({ serverId: guildId })) return;
  (await GuildCache.create({ serverId: guildId })).save();
}

module.exports = [...manageGuildCache];