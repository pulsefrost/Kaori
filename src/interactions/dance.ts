import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';
import fetch from 'cross-fetch'; // Utilisation de cross-fetch

interface ApiResponse {
  results: {
    url: string;
  }[];
}

const danceCommand = new ChatInput(
  {
    name: 'hug',
    description: 'Dance',
    dmPermission: false,
  },
  { coolTime: 5000 },
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    // Utilisation de cross-fetch pour récupérer les données
    try {
      const response = await fetch('https://nekos.best/api/v2/dance');
      const responseData = await response.json();

      // Typage de responseData avec l'interface ApiResponse
      const data: ApiResponse = responseData;

      interaction.reply({
        content: `*${interaction.user.toString()} est en train de dancer*`,
        embeds: [
          new EmbedBuilder()
            .setImage(data.results[0].url)
            .setColor('#2C2D31'),
        ],
        ephemeral: false,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'image de dance :', error);
      interaction.reply({ content: '`❌` Une erreur est survenue lors de l\'envoi de la dance.', ephemeral: true });
    }
  },
);

export default danceCommand;