import { Colors, EmbedBuilder, Events, Client } from 'discord.js';
import { DiscordEventBuilder } from '../module/events';
import BumpReminder from '../schemas/BumpReminder'; // Schéma correct de la DB
import { setTimeout as wait } from 'timers/promises'; // Importer la version async de setTimeout

// L'ID de la commande /bump de Disboard
const BUMP_COMMAND_ID = '947088344167366698'; // Remplacez par l'ID exact de la commande /bump

// Fonction pour recharger les rappels de bump en attente depuis la base de données
async function reloadBumpReminders(client: Client) {
  const reminders = await BumpReminder.find();
  for (const reminder of reminders) {
    const guild = client.guilds.cache.get(reminder.serverId);
    if (!guild) continue;

    const bumpChannel = reminder.bumpChannel ? guild.channels.cache.get(reminder.bumpChannel) : null;
    const bumpRole = reminder.bumpRole ? guild.roles.cache.get(reminder.bumpRole) : null;

    if (!bumpChannel || !bumpRole || !bumpChannel.isTextBased()) {
  console.error('Le canal de bump ou le rôle de bump est indéfini, ou le canal n\'est pas textuel.');
  continue;
}

    const timeLeft = new Date(reminder.reminderTime).getTime() - Date.now(); // S'assurer que reminderTime est un timestamp
    if (timeLeft > 0) {
      // Utiliser la version asynchrone de setTimeout de 'timers/promises'
      await wait(timeLeft);

      await bumpChannel.send({
        content: `${bumpRole}, il est temps de bump le serveur à nouveau !`,
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`⏰\` Utilisez la commande \`/bump\` de Disboard pour bump à nouveau.`)
            .setColor(Colors.Blue),
        ],
      });

      // Supprimer le rappel après l'envoi
      await BumpReminder.deleteOne({ serverId: reminder.serverId });
    } else {
      // Si le temps est déjà passé, envoyer directement le rappel
      await bumpChannel.send({
        content: `${bumpRole}, il est temps de bump le serveur à nouveau !`,
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`⏰\` Utilisez la commande \`/bump\` de Disboard pour bump à nouveau.`)
            .setColor(Colors.Blue),
        ],
      });

      // Supprimer l'entrée dans la DB
      await BumpReminder.deleteOne({ serverId: reminder.serverId });
    }
  }
}

const bumpReminderHandler = new DiscordEventBuilder({
  type: Events.InteractionCreate, // Écouter les interactions
  execute: async (interaction) => {
    if (!interaction.isCommand()) return; // Vérifie que c'est une commande
    if (interaction.commandId !== BUMP_COMMAND_ID) return; // Vérifie que c'est la bonne commande

    const guild = interaction.guild;
    if (!guild) return;

    // Récupérer les paramètres de rappel de bump dans la base de données
    const bumpSettings = await BumpReminder.findOne({ serverId: guild.id });
    if (!bumpSettings || !bumpSettings.bumpChannel || !bumpSettings.bumpRole) return;

    const bumpChannel = guild.channels.cache.get(bumpSettings.bumpChannel);
    const bumpRole = guild.roles.cache.get(bumpSettings.bumpRole);

    if (!bumpChannel || !bumpRole || !bumpChannel.isTextBased()) return;

    const bumpInitiator = interaction.user;

    // Enregistre le rappel dans la base de données
    const reminderEntry = new BumpReminder({
      serverId: guild.id,
      bumpChannel: bumpSettings.bumpChannel,
      bumpRole: bumpSettings.bumpRole,
      reminderTime: Date.now() + 2 * 60 * 60 * 1000, // Enregistre le temps du rappel
    });
    await reminderEntry.save();

    // Confirmation après la commande bump
    await bumpChannel.send({
      content: `<@${bumpInitiator.id}> Je vous rappellerai dans 2 heures pour bump à nouveau.`,
    });

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

module.exports = {
  bumpReminderHandler,
  reloadBumpReminders,
};