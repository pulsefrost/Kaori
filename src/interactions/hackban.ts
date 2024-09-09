import { ApplicationCommandOptionType, codeBlock, Colors, EmbedBuilder, PermissionFlagsBits, GuildMember } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';

// Identifiant SKU requis pour utiliser la commande hackban
const REQUIRED_SKU_ID = '1167500444092866570';  // Remplace par l'ID SKU réel

// Fonction pour vérifier si un utilisateur possède un abonnement lié au SKU
async function hasValidSubscription(member: GuildMember, skuId: string): Promise<boolean> {
  // Ici, vous ajouteriez la logique réelle pour vérifier l'abonnement de l'utilisateur via le SKU.
  // Par exemple, cela peut être une requête à une base de données ou une API externe.
  // Exemple : récupérer les abonnements de l'utilisateur et vérifier s'il possède ce SKU.

  // Simulation de récupération des abonnements de l'utilisateur
  const userSubscriptions = await getUserSubscriptions(member.id);

  // Vérifie si l'utilisateur possède l'abonnement avec le SKU requis
  return userSubscriptions.includes(skuId);
}

// Fonction simulée pour obtenir les abonnements de l'utilisateur (à remplacer par la vraie logique)
async function getUserSubscriptions(userId: string): Promise<string[]> {
  // Simuler une liste d'abonnements de l'utilisateur
  // Remplace cette partie par la vraie logique pour récupérer les abonnements de l'utilisateur via API ou base de données
  return ['1167500444092866570']; // Simuler que l'utilisateur possède cet abonnement
}

const hackbanCommand = new ChatInput(
  {
    name: 'hackban',
    description: 'Bannir plusieurs utilisateurs du serveur via leurs ID, même s\'ils ne sont pas sur le serveur',
    options: [
      {
        name: 'ids',
        description: 'Liste des IDs des utilisateurs à bannir (séparés par des espaces)',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: 'raison',
        description: 'Raison',
        type: ApplicationCommandOptionType.String,
      },
    ],
    defaultMemberPermissions: PermissionFlagsBits.BanMembers,
    dmPermission: false,
  },
  { coolTime: 5000 },
  async (interaction) => {
  
    if (!interaction.inCachedGuild()) return;

    const member = interaction.member as GuildMember;

    // Vérification d'abonnement via SKU
    const isSubscribed = await hasValidSubscription(member, REQUIRED_SKU_ID);

    if (!isSubscribed) {
      return interaction.reply({
        content: '❌ Vous devez être abonné au service premium pour utiliser cette commande.',
        ephemeral: true,
      });
    }
  
    const ids = interaction.options.getString('ids')?.split(' ') || [];
    const reason = interaction.options.getString('raison') ?? 'Aucune raison fournie';
    const results = [];
  
    for (const id of ids) {
      try {
        await interaction.guild.members.ban(id, { reason });
        results.push(`\`✅\` Utilisateur avec l'ID \`${id}\` a été banni.`);
      } catch (err) {
        const errorMessage = (err instanceof Error) ? err.message : String(err);
        results.push(`\`❌\` Échec du ban de l'utilisateur avec l'ID \`${id}\`.\n${codeBlock(errorMessage)}`);
      }
    }
  
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(results.join('\n'))
          .setColor(Colors.Green),
      ],
      ephemeral: true,
    });
  
  },
);

module.exports = [hackbanCommand];