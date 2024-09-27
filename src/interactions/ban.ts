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
    const reason = interaction.options.getString('raison') ?? 'Aucune raison fournie';

    if (!(member instanceof GuildMember))
      return interaction.reply({ content: '`❌` Cet utilisateur n\'est pas présent sur le serveur.', ephemeral: true });
    if (member.id === interaction.user.id)
      return interaction.reply({ content: '`❌` Vous ne pouvez pas vous bannir vous-même.', ephemeral: true });
    if (!member.bannable)
      return interaction.reply({ content: '`❌` Échec du ban en raison de permissions insuffisantes.', ephemeral: true });
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers) && interaction.member.roles.highest.position <= member.roles.highest.position)
      return interaction.reply({ content: '`❌` Vous n\'avez pas les permissions nécessaires pour bannir cet utilisateur.', ephemeral: true });

    try {
      // Envoi d'un message privé à l'utilisateur avec la raison avant de le bannir
      await member.send({
        embeds: [
          new EmbedBuilder()
            .setTitle('Avertissement de bannissement')
            .setDescription(`Vous avez été banni du serveur **${interaction.guild.name}**.\nRaison : ${reason}`)
            .setColor(Colors.Red),
        ],
      }).catch(err => console.log("Impossible d'envoyer un MP : ", err));

      // Bannir l'utilisateur avec la raison
      await member.ban({ reason });

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`✅\` ${member} a été banni du serveur pour la raison suivante : ${reason}`)
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

module.exports = [banCommand];