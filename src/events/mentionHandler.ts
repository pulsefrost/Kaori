import { Colors, EmbedBuilder, Events } from 'discord.js';
import { DiscordEventBuilder } from '../module/events';
import ServerSettings from '../schemas/ServerSettings'; // Assurez-vous que le chemin est correct

const mentionHandler = new DiscordEventBuilder({
  type: Events.MessageCreate,
  execute: async (message) => {
    if (message.author.bot) return;

    const guild = message.guild;
    if (!guild) return;  // Vérifiez que le message a bien été envoyé dans un serveur

    const serverSettings = await ServerSettings.findOne({ serverId: guild.id });
    if (!serverSettings) return;

    const mentionedUsers = message.mentions.users;
    mentionedUsers.forEach(user => {
      const afkStatus = serverSettings.afk.get(user.id);
      if (afkStatus) {
        message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setDescription(`\`💤\` ${user.tag} est actuellement AFK : ${afkStatus}`)
              .setColor(Colors.Yellow),
          ],
        });
      }
    });
  },
});

module.exports = [mentionHandler];
