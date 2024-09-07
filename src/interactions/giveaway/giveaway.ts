import { ChatInput } from '@akki256/discord-interaction';
import { ApplicationCommandOptionType, TextChannel, GuildChannel } from 'discord.js';
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
    const channel = interaction.options.getChannel('channel') as GuildChannel | null;

    // Vérification que le channel est défini et est un TextChannel
    if (prize && duration && channel && channel instanceof TextChannel) {
      await startGiveaway(interaction, duration, prize, channel); // On sait que channel est un TextChannel ici
    } else {
      // Gestion de l'erreur si le channel n'est pas valide
      await interaction.reply({ content: "Veuillez spécifier un salon textuel valide.", ephemeral: true });
    }
  }
);

export default startGiveawayCommand;
