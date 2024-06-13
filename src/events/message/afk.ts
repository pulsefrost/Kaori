import { Colors, EmbedBuilder, Events } from 'discord.js';
import { DiscordEventBuilder } from '../../module/events';
import ServerSettings from '../schemas/ServerSettings'; // assurez-vous de bien importer votre modèle

const handleAfkStatus = new DiscordEventBuilder({
  type: Events.MessageCreate,
  execute: async (message) => {
    if (message.author.bot) return;

    const serverId = message.guild.id;
    const userId = message.author.id;

    try {
      const serverSettings = await ServerSettings.findOne({ serverId });
      if (!serverSettings) return;

      const afkMessage = serverSettings.afk.get(userId);
      if (afkMessage) {
        // Retirer le statut AFK de l'utilisateur
        await ServerSettings.updateOne(
          { serverId },
          { $unset: { [`afk.${userId}`]: '' } }
        );

        message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`\`✅\` Votre statut AFK a été retiré.`)
              .setColor(Colors.Green),
          ],
        });
      }

      // Vérifier les mentions
      message.mentions.users.forEach(async (mentionedUser) => {
        const mentionedUserId = mentionedUser.id;
        const mentionedAfkMessage = serverSettings.afk.get(mentionedUserId);
        if (mentionedAfkMessage) {
          message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setDescription(`\`🔔\` ${mentionedUser} est AFK: ${mentionedAfkMessage}`)
                .setColor(Colors.Yellow),
            ],
          });
        }
      });
    } catch (err) {
      console.error('Erreur lors de la gestion des messages:', err);
    }
  },
});

module.exports = [handleAfkStatus];
