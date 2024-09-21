import { Colors, EmbedBuilder, Events } from 'discord.js';
import { DiscordEventBuilder } from '../module/events';
import BumpReminder from '../schemas/BumpReminder'; // Schéma correct de la DB
import { setTimeout as wait } from 'timers/promises';

// L'ID du bot Disboard
const DISBOARD_BOT_ID = '302050872383242240'; // ID du bot Disboard

const bumpReminderHandler = new DiscordEventBuilder({
  type: Events.MessageCreate, // Écouter les messages envoyés dans le salon
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

    // Confirmation après la commande bump (message du bot Disboard détecté)
    await bumpChannel.send({
      content: `Le serveur a été bumpé avec succès ! Je vous rappellerai dans 2 heures pour bump à nouveau.`,
    });

    // Enregistre le rappel dans la base de données
    const reminderEntry = new BumpReminder({
      serverId: guild.id,
      bumpChannel: bumpSettings.bumpChannel,
      bumpRole: bumpSettings.bumpRole,
      reminderTime: Date.now() + 2 * 60 * 60 * 1000, // Enregistre le temps du rappel (2h)
    });
    await reminderEntry.save();

    // Envoie un rappel après deux heures
    await wait(2 * 60 * 60 * 1000); // 2 heures en millisecondes

    // Vérifier si le rappel existe encore dans la DB (en cas de redémarrage du bot)
    const activeReminder = await BumpReminder.findOne({ serverId: guild.id });
    if (!activeReminder) return; // Si le rappel a été supprimé, on arrête ici

    // Envoie le message de rappel dans le salon configuré avec un embed
    await bumpChannel.send({
      content: `${bumpRole}, il est temps de bump le serveur à nouveau !`,
      embeds: [
        new EmbedBuilder()
          .setDescription(`\`⏰\` Utilisez la commande \`/bump\` de Disboard pour bump à nouveau.`)
          .setColor(Colors.Blue),
      ],
    });

    // Supprimer le rappel de la base de données après exécution
    await BumpReminder.deleteOne({ serverId: guild.id });
  },
});

module.exports = [bumpReminderHandler];