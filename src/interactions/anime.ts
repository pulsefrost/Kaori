import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';
import fetch from 'cross-fetch'; // Utilisation de cross-fetch

interface ApiResponse {
  results: {
    url: string;
    anime_name: string;
  }[];
}

// Liste des actions disponibles dans l'API
const actions = {
  hug: 'hug',
  kiss: 'kiss',
  slap: 'slap',
  sleep: 'sleep',
  // Ajoutez d'autres actions supportées par l'API ici
} as const;

type ActionType = keyof typeof actions;

const animeCommand = new ChatInput(
  {
    name: 'anime',
    description: 'Effectuez une action sur un utilisateur',
    options: [
      {
        name: 'action',
        description: 'Choisissez une action à effectuer',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: Object.keys(actions).map((action) => ({
          name: action,
          value: actions[action as ActionType], // Explicitly typing the action
        })),
      },
      {
        name: 'utilisateur',
        description: 'Utilisateur cible pour l\'action (sauf pour sleep)',
        type: ApplicationCommandOptionType.User,
        required: false, // L'utilisateur n'est pas requis pour 'sleep'
      },
    ],
    dmPermission: false,
  },
  { coolTime: 5000 },
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    const action = interaction.options.getString('action') as ActionType;
    const user = interaction.options.getMember('utilisateur');

    // Si l'action est autre que 'sleep', vérifier si un utilisateur est mentionné
    if (action !== 'sleep' && !user) {
      return interaction.reply({ content: '`❌` Vous devez mentionner un utilisateur pour cette action.', ephemeral: true });
    }

    try {
      const response = await fetch(`https://nekos.best/api/v2/${action}`);
      const responseData = await response.json();

      const data: ApiResponse = responseData;

      let contentMessage = '';
      if (action === 'sleep') {
        contentMessage = `*${interaction.user.toString()} est en train de dormir.*`;
      } else {
        // Check if user is not null before using toString
        contentMessage = `*${interaction.user.toString()} ${action} ${user!.toString()}*`;
      }

      interaction.reply({
        content: contentMessage,
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
      console.error(`Erreur lors de la récupération de l'image pour ${action} :`, error);
      interaction.reply({ content: '`❌` Une erreur est survenue lors de l\'exécution de l\'action.', ephemeral: true });
    }
  },
);

export default animeCommand;