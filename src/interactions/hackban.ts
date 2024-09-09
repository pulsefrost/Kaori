import { ApplicationCommandOptionType, codeBlock, Colors, EmbedBuilder, PermissionFlagsBits, GuildMember } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';

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
    defaultMemberPermissions: PermissionFlagsBits.BanMembers,  // Permission pour bannir
    dmPermission: false,  // Désactiver l'utilisation de la commande en message privé
  },
  { coolTime: 5000 },  // Temps de cooldown pour éviter le spam
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    const member = interaction.member as GuildMember;

    // Vérification si l'utilisateur a la permission de bannir
    if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({
        content: '❌ Vous n\'avez pas la permission de bannir des membres.',
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