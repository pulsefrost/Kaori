import { ApplicationCommandOptionType, codeBlock, Colors, EmbedBuilder, PermissionFlagsBits, GuildMember } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';

const banCommand = new ChatInput(
  {
    name: 'ban',
    description: 'Bannir un utilisateur du serveur',
    options: [
      {
        name: 'utilisateur',
        description: 'Utilisateur',
        type: ApplicationCommandOptionType.User,
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

    const member = interaction.options.getMember('utilisateur');

    if (!(member instanceof GuildMember))
      return interaction.reply({ content: '`❌` Cet utilisateur n\'est pas présent sur le serveur.', ephemeral: true });
    if (member.id === interaction.user.id)
      return interaction.reply({ content: '`❌` Vous ne pouvez pas vous bannir vous-même.', ephemeral: true });
    if (!member.bannable)
      return interaction.reply({ content: '`❌` Échec du ban en raison de permissions insuffisantes.', ephemeral: true });
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers) && interaction.member.roles.highest.position <= member.roles.highest.position)
      return interaction.reply({ content: '`❌` Vous n\'avez pas les permissions nécessaires pour bannir cet utilisateur.', ephemeral: true });

    try {
      await member.ban({ reason: interaction.options.getString('raison') ?? 'Aucune raison fournie' });
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`✅\` ${member} a été banni du serveur.`)
            .setColor(Colors.Green),
        ],
        ephemeral: true,
      });
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`❌\` Échec du ban.\n${codeBlock(errorMessage)}`)
            .setColor(Colors.Red),
        ],
        ephemeral: true,
      });
    }

  },
);

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

module.exports = [banCommand, hackbanCommand];