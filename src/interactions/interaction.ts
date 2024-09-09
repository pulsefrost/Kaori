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

// Dictionnaire pour traduire les actions en français
const actionTranslations: { [key: string]: string } = {
  hug: "câline",
  slap: "gifle",
  kiss: "embrasse",
  bite: "mord",
  cuddle: "câline",
  feed: "nourrit",
  handshake: "serre la main de",
  kick: "donne un coup de pied à",
  pat: "tapote",
  punch: "donne un coup de poing à",
  tickle: "chatouille",
  blush: "rougit",
  dance: "danse",
  smile: "sourit",
  wave: "fait un signe de la main",
};

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
    const targetUser = interaction.options.getUser('user'); // Pour certaines sous-commandes
    let responseMessage = '';
    let gifData: ApiResponse | undefined = undefined;  // Initialisation de gifData

    try {
      // Sous-commandes nécessitant un autre utilisateur (ex: hug, slap, kiss, etc.)
      if (targetUser) {
        const translatedAction = actionTranslations[subCommand] || subCommand;
        responseMessage = `${interaction.user.toString()} ${translatedAction} ${targetUser.toString()} !`;
        gifData = await fetchInteractionGif(subCommand);
      } else {
        // Interactions solitaires ou aléatoires
        responseMessage = `${interaction.user.toString()} a effectué l'action : ${subCommand}.`;
        gifData = await fetchInteractionGif(subCommand);
      }

      // Envoyer un message éphémère de confirmation (qui ne sera pas visible par les autres)
      await interaction.reply({
        content: 'Interaction effectuée avec succès !',
        ephemeral: true,
      });

      // Vérification que gifData a bien été assigné avant de l'utiliser
      if (gifData) {
        // Envoyer l'embed et le contenu dans un message visible à tous
        await interaction.channel?.send({
          content: responseMessage,
          embeds: [
            new EmbedBuilder()
              .setTitle('Titre de l\'anime :')
              .setDescription(gifData.results[0].anime_name)
              .setImage(gifData.results[0].url)
              .setColor('#F4C1B3'),
          ],
        });
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération du gif pour ${subCommand} :`, error);
      interaction.reply({ content: '`❌` Une erreur est survenue lors de l\'interaction.', ephemeral: true });
    }
  },
);

export default interactionCommand;
