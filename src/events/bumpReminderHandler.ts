import { Colors, EmbedBuilder, Events } from 'discord.js';
import { DiscordEventBuilder } from '../module/events';
import BumpReminder from '../schemas/BumpReminder'; // Assurez-vous que le schéma est correct
import { setTimeout } from 'timers/promises';

// L'ID du bot Disboard
const DISBOARD_BOT_ID = '302050872383242240'; // ID du bot Disboard

const bumpReminderHandler = new DiscordEventBuilder({
  type: Events.MessageCreate, // Surveiller les messages
  execute: async (message) => {
    // Vérifie si le message vient du bot Disboard
    if (message.author.id !== DISBOARD_BOT_ID) return;

    const guild = message.guild;
    if (!guild) return;

    // Récupérer les paramètres de rappel de bump dans la base de données
    const bumpSettings = await BumpReminder.findOne({ serverId: guild.id });
    if (!bumpSettings || !bumpSettings.bumpChannel || !bumpSettings.bumpRole) return;

    const bumpChannel = guild.channels.cache.get(bumpSettings.bumpChannel);
    const bumpRole = guild.roles.cache.get(bumpSettings.bumpRole);

    if (!bumpChannel || !bumpRole || !bumpChannel.isTextBased()) return;

    // Mentionner la personne qui a exécuté la commande bump
    const bumpInitiator = message.interaction?.user || message.author;

    // Confirmation après la commande bump
    await bumpChannel.send({
      content: `<@${bumpInitiator.id}> Je vous rappellerai dans 2 heures pour bump à nouveau.`,
    });

    // Envoie un rappel après deux heures
    await setTimeout(2 * 60 * 60 * 1000); // 2 heures en millisecondes

    // Envoie le message de rappel dans le salon configuré avec un embed
    bumpChannel.send({
      content: `${bumpRole}, il est temps de bump le serveur à nouveau !`,
      embeds: [
        new EmbedBuilder()
          .setDescription(`\`⏰\` Utilisez la commande \`/bump\` de Disboard pour bump à nouveau.`)
          .setColor(Colors.Blue),
      ],
    });
  },
});

module.exports = [bumpReminderHandler];