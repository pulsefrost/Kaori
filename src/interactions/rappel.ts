import { ApplicationCommandOptionType, Colors, EmbedBuilder } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';
import Reminder from '../schemas/Reminder'; // Import du modèle de rappel
import { setTimeout } from 'timers/promises';

const reminderCommand = new ChatInput(
  {
    name: 'rappel',
    description: 'Configurer un rappel pour vous ou un autre utilisateur',
    options: [
      {
        name: 'message',
        description: 'Message du rappel',
        type: ApplicationCommandOptionType.String,
        required: true, // Cette option est requise
      },
      {
        name: 'temps',
        description: 'Temps en minutes avant l\'envoi du rappel',
        type: ApplicationCommandOptionType.Integer,
        required: true, // Cette option est également requise
      },
      {
        name: 'utilisateur',
        description: 'Utilisateur à qui envoyer le rappel',
        type: ApplicationCommandOptionType.User,
        required: false, // Option non requise
      },
    ],
    defaultMemberPermissions: null, // Tout le monde peut utiliser cette commande
    dmPermission: true,
  },
  { coolTime: 5000 },
  async (interaction) => {
    // Obtenir les valeurs des options
    const user = interaction.options.getUser('utilisateur') || interaction.user; // Si aucun utilisateur spécifié, utiliser l'utilisateur courant
    const message = interaction.options.getString('message');
    const timeInMinutes = interaction.options.getInteger('temps');

    // Vérifier si timeInMinutes est valide
    if (timeInMinutes === null || timeInMinutes < 1) {
      return interaction.reply({
        content: '`❌` Le temps doit être supérieur à 0 minute.',
        ephemeral: true,
      });
    }

    const timeInMs = timeInMinutes * 60 * 1000; // Convertir les minutes en millisecondes
    const remindAt = new Date(Date.now() + timeInMs); // Calculer le moment où le rappel sera envoyé

    // Enregistrer le rappel dans la base de données
    try {
      await Reminder.create({
        userId: user.id,
        message,
        remindAt,
      });

      // Confirmation immédiate de la configuration du rappel
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`⏰\` Un rappel a été configuré pour **${user.username}** dans ${timeInMinutes} minute(s).\n\n**Message** : ${message}`)
            .setColor(Colors.Blue),
        ],
        ephemeral: true,
      });

      // Attendre le temps défini
      await setTimeout(timeInMs);

      // Envoyer le rappel à l'utilisateur dans un message privé
      await user.send({
        embeds: [
          new EmbedBuilder()
            .setTitle('Rappel ⏰')
            .setDescription(`**Rappel :** ${message}`)
            .setColor(Colors.Green)
            .setTimestamp(),
        ],
      });

      // Mettre à jour le statut du rappel comme "envoyé"
      await Reminder.updateOne({ userId: user.id, message, remindAt }, { $set: { isSent: true } });
    } catch (err) {
      console.error(`Erreur lors de l'enregistrement ou de l'envoi du rappel : ${err}`);
      await interaction.followUp({
        content: `\`❌\` Une erreur s'est produite lors de la configuration du rappel.`,
        ephemeral: true,
      });
    }
  },
);

module.exports = [reminderCommand];