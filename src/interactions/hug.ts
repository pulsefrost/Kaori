import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';
import fetch from 'cross-fetch'; // Utilisation de cross-fetch

interface ApiResponse {
  results: {
    url: string;
    anime_name: string;
  }[];
}

const hugCommand = new ChatInput(
  {
    name: 'hug',
    description: 'Faites un câlin à un utilisateur',
    options: [
      {
        name: 'utilisateur',
        description: 'Utilisateur à qui faire le câlin',
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
      const response = await fetch('https://nekos.best/api/v2/hug');
      const responseData = await response.json();

      // Typage de responseData avec l'interface ApiResponse
      const data: ApiResponse = responseData;

      interaction.reply({
        content: `*${interaction.user.toString()} câline ${user.toString()}*`,
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
      console.error('Erreur lors de la récupération de l\'image de câlin :', error);
      interaction.reply({ content: '`❌` Une erreur est survenue lors de l\'envoi du câlin.', ephemeral: true });
    }
  },
);

export default hugCommand;