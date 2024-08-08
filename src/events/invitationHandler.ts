import { Colors, EmbedBuilder, Events, Message, TextChannel, Guild } from 'discord.js';
import { DiscordEventBuilder } from '../module/events';
import ServerSettings from '../schemas/ServerSettings';

const invitationHandler = new DiscordEventBuilder({
  type: Events.MessageCreate,
  execute: async (message: Message) => {
    if (message.author.bot) return;

    const guild = message.guild;
    if (!guild) return; // Vérifiez que le message a bien été envoyé dans un serveur

    // Vérifiez si le message contient un lien d'invitation Discord
    const inviteLinkPattern = /https:\/\/discord\.gg\/[a-zA-Z0-9]+/;
    if (!inviteLinkPattern.test(message.content)) return;

    try {
      // Récupérer les paramètres de configuration pour ce serveur
      const serverSettings = await ServerSettings.findOne({ serverId: guild.id });
      if (!serverSettings || !serverSettings.invitationStats.channelId) return;

      const channel = guild.channels.cache.get(serverSettings.invitationStats.channelId) as TextChannel;
      if (!channel) return;

      // Récupérer les invitations et les statistiques
      const invites = await guild.invites.fetch();
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000; // 1 semaine en millisecondes
      const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000; // 1 mois en millisecondes

      // Filtrer les invitations du créateur
      const creatorInvites = invites.filter(invite => invite.inviter?.id === message.author.id);

      const weeklyInvites = creatorInvites.filter(invite => invite.createdAt && invite.createdAt.getTime() >= oneWeekAgo).size;
      const monthlyInvites = creatorInvites.filter(invite => invite.createdAt && invite.createdAt.getTime() >= oneMonthAgo).size;

      // Créer l'embed avec les statistiques
      const statsEmbed = new EmbedBuilder()
        .setTitle('Statistiques de l\'Invitation')
        .setDescription(serverSettings.invitationStats.messageOptions.content || 'Voici les statistiques de l\'invitation :')
        .setColor(Colors.Blue);

      if (serverSettings.invitationStats.includeMembers) {
        statsEmbed.addFields({ name: 'Membres Totaux', value: `${guild.memberCount}` });
      }
      if (serverSettings.invitationStats.includeOnline) {
        statsEmbed.addFields({ name: 'Membres en Ligne', value: `${guild.members.cache.filter(member => member.presence?.status === 'online').size}` });
      }
      if (serverSettings.invitationStats.includeOffline) {
        statsEmbed.addFields({ name: 'Membres Hors Ligne', value: `${guild.members.cache.filter(member => member.presence?.status === 'offline').size}` });
      }
      if (serverSettings.invitationStats.includeInvitations) {
        statsEmbed.addFields({ name: 'Invitations Envoyées (Par vous)', value: `${creatorInvites.size}` });
      }
      if (serverSettings.invitationStats.includeInvitesWeekly) {
        statsEmbed.addFields({ name: 'Invitations Envoyées cette Semaine', value: `${weeklyInvites}` });
      }
      if (serverSettings.invitationStats.includeInvitesMonthly) {
        statsEmbed.addFields({ name: 'Invitations Envoyées ce Mois', value: `${monthlyInvites}` });
      }

      // Envoyer l'embed dans le salon configuré
      await channel.send({ embeds: [statsEmbed] });

    } catch (err) {
      console.error('Erreur lors de l\'envoi de l\'embed des statistiques :', err);
    }
  },
});

module.exports = [invitationHandler];