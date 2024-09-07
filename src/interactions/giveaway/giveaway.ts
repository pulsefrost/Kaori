import { ChatInput } from '@akki256/discord-interaction';
import { ApplicationCommandOptionType, TextChannel } from 'discord.js';
import { startGiveaway } from '../../module/giveaway'; // Utilisation du module giveaway.ts

const startGiveawayCommand = new ChatInput(
  {
    name: 'giveaway',
    description: 'Démarrer un giveaway',
    options: [
      {
        name: 'prize',
        type: ApplicationCommandOptionType.String,
        description: 'Le prix du giveaway',
        required: true,
      },
      {
        name: 'duration',
        type: ApplicationCommandOptionType.String,
        description: 'La durée du giveaway (ex: 1s, 1m, 1d, 1w)',
        required: true,
      },
      {
        name: 'channel',
        type: ApplicationCommandOptionType.Channel,
        description: "Le salon où envoyer l'embed du giveaway",
        required: true,
      },
    ],
  },
  async (interaction) => {
    const prize = interaction.options.getString('prize');
    const duration = interaction.options.getString('duration');
    const channel = interaction.options.getChannel('channel') as TextChannel;

    // Vérification que duration, prize et channel sont bien définis
    if (prize && duration && channel) {
      await startGiveaway(interaction, duration, prize, channel); // Passer le channel au lieu de l'emote
    } else {
      // Gestion de l'erreur si prize, duration ou channel est null
      await interaction.reply({ content: "Une erreur est survenue avec le prize, la durée ou le salon.", ephemeral: true });
    }
  }
);

export default startGiveawayCommand;
