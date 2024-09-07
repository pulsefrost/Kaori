import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';
import fetch from 'cross-fetch'; // Utilisation de cross-fetch

interface ApiResponse {
  results: {
    url: string;
    anime_name: string;
  }[];
}

const poutCommand = new ChatInput(
  {
    name: 'pout',
    description: 'Bouder',
    dmPermission: false,
  },
  { coolTime: 5000 },
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    // Utilisation de cross-fetch pour récupérer les données
    try {
      const response = await fetch('https://nekos.best/api/v2/pout');
      const responseData = await response.json();

      // Typage de responseData avec l'interface ApiResponse
      const data: ApiResponse = responseData;

      interaction.reply({
        content: `*${interaction.user.toString()} est en train de bouder*`,
        embeds: [
          new EmbedBuilder()
          .setTitle('Titre de l\'anime :')
          .setDescription(data.results[0].anime_name)
          .setImage(data.results[0].url)
            .setColor('#F4C1B3'),
        ],
        ephemeral: false,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'image de boude :', error);
      interaction.reply({ content: '`❌` Une erreur est survenue lors de l\'envoi de la boude.', ephemeral: true });
    }
  },
);

export default poutCommand;