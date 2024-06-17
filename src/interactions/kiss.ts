import { ApplicationCommandOptionType, EmbedBuilder, Colors } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';
import fetch from 'node-fetch';

interface ApiResponse {
  results: {
    url: string;
  }[];
}

const kissCommand = new ChatInput(
  {
    name: 'kiss',
    description: 'Envoyer un baiser à un utilisateur',
    options: [
      {
        name: 'utilisateur',
        description: 'Utilisateur à qui envoyer le baiser',
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

    // Utilisation de l'API nekos.best pour obtenir une image de baiser
    try {
      const response = await fetch('https://nekos.best/api/v2/kiss');
      const data = await response.json() as ApiResponse;

      interaction.reply({
        content: `*${interaction.user.username} envoie un baiser à ${user.user.username}*`,
        embeds: [
          new EmbedBuilder()
            .setImage(data.results[0].url)
            .setColor('#ffb8c6'),
        ],
        ephemeral: false,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'image de baiser :', error);
      interaction.reply({ content: '`❌` Une erreur est survenue lors de l\'envoi du baiser.', ephemeral: true });
    }
  },
);

export default kissCommand;
