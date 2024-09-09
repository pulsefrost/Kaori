import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';
import fetch from 'cross-fetch'; // Utilisation de cross-fetch

interface ApiResponse {
  results: {
    url: string;
    anime_name: string;
  }[];
}

// Fonction pour récupérer l'URL et le nom de l'anime depuis l'API
async function fetchInteractionGif(endpoint: string): Promise<ApiResponse> {
  const response = await fetch(`https://nekos.best/api/v2/${endpoint}`);
  return await response.json();
}

const interactionCommand = new ChatInput(
  {
    name: 'interaction',
    description: 'Effectuer différentes interactions amusantes ou affectueuses',
    options: [
      {
        name: 'husbando',
        description: 'Complimente quelqu\'un en le qualifiant de husbando idéal',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'kitsune',
        description: 'Transforme-toi en un adorable kitsune',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'neko',
        description: 'Deviens un adorable neko',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'waifu',
        description: 'Complimente quelqu\'un en le qualifiant de waifu',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'bite',
        description: 'Mord un utilisateur',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'user',
            description: 'Choisissez un utilisateur à mordre',
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
      {
        name: 'cuddle',
        description: 'Câline un utilisateur',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'user',
            description: 'Choisissez un utilisateur à câliner',
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
      {
        name: 'feed',
        description: 'Donne à manger à un utilisateur',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'user',
            description: 'Choisissez un utilisateur à nourrir',
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
      {
        name: 'handshake',
        description: 'Serrez la main à quelqu\'un',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'user',
            description: 'Choisissez un utilisateur avec qui serrer la main',
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
      {
        name: 'hug',
        description: 'Câline quelqu\'un affectueusement',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'user',
            description: 'Choisissez un utilisateur à câliner',
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
      {
        name: 'kick',
        description: 'Donnez un coup de pied à un utilisateur',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'user',
            description: 'Choisissez un utilisateur à frapper avec un coup de pied',
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
      {
        name: 'pat',
        description: 'Tapote affectueusement un utilisateur sur la tête',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'user',
            description: 'Choisissez un utilisateur à tapoter',
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
      {
        name: 'punch',
        description: 'Donnez un coup de poing à un utilisateur',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'user',
            description: 'Choisissez un utilisateur à frapper avec un coup de poing',
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
      {
        name: 'slap',
        description: 'Giflez un utilisateur',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'user',
            description: 'Choisissez un utilisateur à gifler',
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
      {
        name: 'tickle',
        description: 'Chatouillez un utilisateur',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'user',
            description: 'Choisissez un utilisateur à chatouiller',
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
      {
        name: 'blush',
        description: 'Rougis d\'embarras ou de timidité',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'dance',
        description: 'Fais une petite danse',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'smile',
        description: 'Souris de manière radieuse',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'wave',
        description: 'Fais un signe de la main',
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
    dmPermission: false,
  },
  { coolTime: 5000 },
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    const subCommand = interaction.options.getSubcommand();
    let targetUser = interaction.options.getUser('user'); // Pour certaines sous-commandes
    let responseMessage = '';
    let gifData: ApiResponse | undefined = undefined;  // Initialisation de gifData

    try {
      // Sous-commandes nécessitant un autre utilisateur (ex: hug, slap, kiss, etc.)
      if (targetUser) {
        if (['hug', 'slap', 'kiss', 'bite', 'cuddle', 'feed', 'handshake', 'kick', 'pat', 'punch', 'tickle'].includes(subCommand)) {
          responseMessage = `${interaction.user.toString()} a ${subCommand} ${targetUser.toString()} !`;
          gifData = await fetchInteractionGif(subCommand);
        }
      } else {
        // Interactions solitaires ou aléatoires
        responseMessage = `${interaction.user.toString()} a effectué l'action : ${subCommand}.`;
        gifData = await fetchInteractionGif(subCommand);
      }

      // Envoyer un message de confirmation éphémère pour l'utilisateur qui a utilisé la commande
      await interaction.reply({
        content: `Interaction ${subCommand} effectuée avec succès !`,
        ephemeral: true, // Seulement visible par l'utilisateur qui a déclenché l'action
      });

      // Vérification que gifData a bien été assigné avant de l'utiliser
      if (gifData) {
        // Envoyer la réponse avec un embed contenant l'image, visible à tous
        await interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setTitle('Titre de l\'anime :')
              .setDescription(`${interaction.user.toString()} a ${subCommand} ${targetUser?.toString() || ''}`)
              .setImage(gifData.results[0].url)
              .setColor('#F4C1B3'),
          ],
          ephemeral: false, // L'embed sera visible par tous
        });
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération du gif pour ${subCommand} :`, error);
      interaction.reply({ content: '`❌` Une erreur est survenue lors de l\'interaction.', ephemeral: true });
    }
  },
);

export default interactionCommand;