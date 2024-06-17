import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';
import fetch from 'cross-fetch'; // Utilisation de cross-fetch

interface ApiResponse {
  results: {
    url: string;
  }[];
}

const slapCommand = new ChatInput(
  {
    name: 'slap',
    description: 'Gifler un utilisateur',
    options: [
      {
        name: 'utilisateur',
        description: 'Utilisateur à qui mettre la gifle',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
    ],
    dmPermission: false,
  },
  { coolTime: 5000 },
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    const user = interaction.options.getMember('utilisateur');

    if (!user)
      return interaction.reply({ content: '`❌` Utilisateur introuvable.', ephemeral: true });

    // Utilisation de cross-fetch pour récupérer les données
    try {
      const response = await fetch('https://nekos.best/api/v2/slap');
      const responseData = await response.json();

      // Typage de responseData avec l'interface ApiResponse
      const data: ApiResponse = responseData;

      interaction.reply({
        content: `*${interaction.user.toString()} a giflé ${user.toString()}*`,
        embeds: [
          new EmbedBuilder()
            .setImage(data.results[0].url)
            .setColor('#2C2D31'),
        ],
        ephemeral: false,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'image de gifle :', error);
      interaction.reply({ content: '`❌` Une erreur est survenue lors de l\'envoi de la gifle.', ephemeral: true });
    }
  },
);

export default slapCommand;