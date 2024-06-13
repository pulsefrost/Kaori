import { Colors, EmbedBuilder, Events } from 'discord.js';
import { DiscordEventBuilder } from '../module/events';
import ServerSettings from '../schemas/ServerSettings'; // Assurez-vous que le chemin est correct

const afkHandler = new DiscordEventBuilder({
  type: Events.MessageCreate,
  execute: async (message) => {
    if (message.author.bot) return;

    const guild = message.guild;
    if (!guild) return;  // Vérifiez que le message a bien été envoyé dans un serveur

    const userId = message.author.id;
    const serverSettings = await ServerSettings.findOne({ serverId: guild.id });
    if (!serverSettings) return;

    const afkStatus = serverSettings.afk.get(userId);
    if (afkStatus) {
      serverSettings.afk.delete(userId);
      await serverSettings.save();

      message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`✅\` Bienvenue de retour <@${userId}>. Votre statut AFK a été retiré.`)
            .setColor(Colors.Green),
        ],
      });
    }
  },
});

module.exports = [afkHandler];
