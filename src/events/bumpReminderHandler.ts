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

      // Vérification du dernier rappel pour éviter les rappels trop fréquents
      const lastBump = await BumpReminder.findOne({ serverId: guild.id });
      
      // Conversion du `reminderTime` en nombre si c'est un objet `Date`
      const lastBumpReminderTime = (lastBump?.reminderTime instanceof Date)
        ? lastBump.reminderTime.getTime()
        : lastBump?.reminderTime;

      if (lastBump && lastBumpReminderTime && Date.now() < lastBumpReminderTime) {
        // Il est trop tôt pour un autre rappel
        return;
      }

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
          // Si le temps de rappel est écoulé, on envoie le rappel
          await bumpChannel.send({
            content: `${bumpRole}, il est temps de bump le serveur à nouveau !`,
            embeds: [
              new EmbedBuilder()
                .setDescription(`\`⏰\` Utilisez la commande </bump:947088344167366698> de Disboard pour bump à nouveau.`)
                .setImage('https://i.imgur.com/zQaqB1E.png')
                .setColor('#2b2d31'),
            ],
          });

        }

      } catch (error) {
        console.error('Erreur lors du rappel de bump :', error);
        // Optionnel : ajouter une action pour notifier les admins ou réessayer
      }
    }
  },
});

module.exports = [bumpReminderHandler];