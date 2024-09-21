import { Colors, EmbedBuilder, Events } from 'discord.js';
import { DiscordEventBuilder } from '../module/events';
import BumpReminder from '../schemas/BumpReminder'; // Assurez-vous que le schéma est correct
import { setTimeout } from 'timers/promises';

const bumpReminderHandler = new DiscordEventBuilder({
  type: Events.InteractionCreate,
  execute: async (interaction) => {
    // Vérifie si l'interaction est une commande de Disboard et si c'est bien la commande bump
    if (!interaction.isCommand() || interaction.commandId !== '947088344167366698') return;

    const guild = interaction.guild;
    if (!guild) return;

    // Récupérer les paramètres de rappel de bump dans la base de données
    const bumpSettings = await BumpReminder.findOne({ serverId: guild.id });
    if (!bumpSettings || !bumpSettings.bumpChannel || !bumpSettings.bumpRole) return;

    const bumpChannel = guild.channels.cache.get(bumpSettings.bumpChannel);
    const bumpRole = guild.roles.cache.get(bumpSettings.bumpRole);

    if (!bumpChannel || !bumpRole || !bumpChannel.isTextBased()) return;

    // Envoie un rappel après deux heures
    await setTimeout(2 * 60 * 60 * 1000); // 2 heures en millisecondes

    // Envoie le message de rappel dans le salon configuré
    bumpChannel.send({
      content: `${bumpRole}, il est temps de bump le serveur à nouveau !`,
      embeds: [
        new EmbedBuilder()
          .setDescription(`\`⏰\` C'est l'heure de bump ! Utilisez la commande \`/bump\` de Disboard.`)
          .setColor(Colors.Blue),
      ],
    });
  },
});

module.exports = [bumpReminderHandler];