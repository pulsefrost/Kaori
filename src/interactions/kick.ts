import { ApplicationCommandOptionType, codeBlock, Colors, EmbedBuilder, PermissionFlagsBits, GuildMember } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction'; // Assurez-vous que le chemin d'importation est correct

const kickCommand = new ChatInput(
  {
    name: 'kick',
    description: 'Expulser un utilisateur du serveur',
    options: [
      {
        name: 'utilisateur',
        description: 'Utilisateur à expulser',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: 'raison',
        description: 'Raison de l\'expulsion',
        type: ApplicationCommandOptionType.String,
      },
    ],
    defaultMemberPermissions: PermissionFlagsBits.KickMembers,
    dmPermission: false,
  },
  { coolTime: 5000 },
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    const member = interaction.options.getMember('utilisateur');

    if (!(member instanceof GuildMember))
      return interaction.reply({ content: '`❌` Cet utilisateur n\'est pas présent sur le serveur.', ephemeral: true });

    if (member.id === interaction.user.id)
      return interaction.reply({ content: '`❌` Vous ne pouvez pas vous expulser vous-même.', ephemeral: true });

    if (!member.kickable)
      return interaction.reply({ content: '`❌` Échec de l\'expulsion en raison de permissions insuffisantes.', ephemeral: true });

    try {
      await member.kick(interaction.options.getString('raison') || 'Aucune raison fournie');

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`✅\` ${member.user.tag} a été expulsé du serveur.`)
            .setColor('#F4C1B3'),
        ],
        ephemeral: true,
      });
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`❌\` Échec de l'expulsion.\n${codeBlock(errorMessage)}`)
            .setColor(Colors.Red),
        ],
        ephemeral: true,
      });
    }
  },
);

export default kickCommand;
