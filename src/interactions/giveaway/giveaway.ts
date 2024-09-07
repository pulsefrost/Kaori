import { ChatInput } from '@akki256/discord-interaction';
import { ApplicationCommandOptionType } from 'discord.js';
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
        name: 'emote',
        type: ApplicationCommandOptionType.String,
        description: "L'émote à utiliser pour rejoindre (facultatif)",
        required: false,
      },
    ],
  },
  async (interaction) => {
    const prize = interaction.options.getString('prize');
    const duration = interaction.options.getString('duration');
    const emote = interaction.options.getString('emote');

    // Vérification que duration et prize sont bien des strings avant de les passer à startGiveaway
    if (prize && duration) {
      await startGiveaway(interaction, duration, prize, emote || undefined); // Emote peut être undefined
    } else {
      // Gestion de l'erreur si prize ou duration est null
      await interaction.reply({ content: "Une erreur est survenue avec le prize ou la durée.", ephemeral: true });
    }
  }
);

export default startGiveawayCommand;