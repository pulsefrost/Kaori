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

    // Vérifie si le message contient un embed avec le texte de confirmation du bump
    const embed = message.embeds[0];
    if (!embed) return; // Si aucun embed, on ignore

    // Vérification pour le titre et la description en français et en anglais
    const isBumpConfirmation = (
      embed.title === "DISBOARD : La liste des serveurs publics" || embed.title === "DISBOARD: The Public Server List"
    ) && (
      embed.description?.includes("Bump effectué") || embed.description?.includes("Bump done")
    );

    if (isBumpConfirmation) {
      const guild = message.guild;
      if (!guild) return;

      // Récupérer les paramètres de rappel de bump dans la base de données
      const bumpSettings = await BumpReminder.findOne({ serverId: guild.id });
      if (!bumpSettings || !bumpSettings.bumpChannel || !bumpSettings.bumpRole) return;

      const bumpChannel = guild.channels.cache.get(bumpSettings.bumpChannel);
      const bumpRole = guild.roles.cache.get(bumpSettings.bumpRole);

      if (!bumpChannel || !bumpRole || !bumpChannel.isTextBased()) return;

      // Enregistre le rappel dans la base de données avec la mise à jour du temps de rappel
      const reminderEntry = await BumpReminder.findOneAndUpdate(
        { serverId: guild.id },
        { reminderTime: Date.now() + 2 * 60 * 60 * 1000 }, // Rappel dans 2h (timestamp)
        { upsert: true, new: true }
      );

      // Confirmation après la commande bump (message du bot Disboard détecté)
      await bumpChannel.send({
        content: `Le serveur a été bumpé avec succès ! Je vous rappellerai dans 2 heures pour bump à nouveau.`,
      });

      // Gestion du rappel avec un try-catch pour éviter qu'il plante
      try {
        // Attente de 2 heures avant d'envoyer le rappel
        await wait(2 * 60 * 60 * 1000);

        // Vérification que le rappel existe toujours dans la base de données
        const activeReminder = await BumpReminder.findOne({ serverId: guild.id });
        if (!activeReminder) {
          return; // Si le rappel n'existe plus
        }

        // Convertir le `reminderTime` en timestamp si c'est un objet `Date`
        const reminderTime = (activeReminder.reminderTime instanceof Date)
          ? activeReminder.reminderTime.getTime()
          : activeReminder.reminderTime;

        // Comparaison avec `Date.now()`
        if (reminderTime <= Date.now()) {
          return; // Si le temps de rappel est déjà écoulé
        }

        // Vérifie de nouveau si le salon et le rôle existent avant d'envoyer le rappel
        const validBumpChannel = guild.channels.cache.get(bumpSettings.bumpChannel);
        const validBumpRole = guild.roles.cache.get(bumpSettings.bumpRole);

        if (!validBumpChannel || !validBumpRole || !validBumpChannel.isTextBased()) {
          return;
        }

        // Envoie le message de rappel dans le salon configuré avec un embed
        await validBumpChannel.send({
          content: `${validBumpRole}, il est temps de bump le serveur à nouveau !`,
          embeds: [
            new EmbedBuilder()
              .setDescription(`\`⏰\` Utilisez la commande \`/bump\` de Disboard pour bump à nouveau.`)
              .setColor(Colors.Blue),
          ],
        });

        // Supprimer le rappel de la base de données après exécution
        await BumpReminder.deleteOne({ serverId: guild.id });

      } catch (error) {
        console.error('Erreur lors du rappel de bump :', error);
        // Optionnel : ajouter une action pour notifier les admins ou réessayer
      }
    }
  },
});

module.exports = [bumpReminderHandler];