import { ApplicationCommandOptionType, codeBlock, Colors, EmbedBuilder, GuildMember, PermissionFlagsBits } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';
import { Duration } from '../module/format';

const timeoutCommand = new ChatInput(
  {
    name: 'timeout',
    description: 'Met un utilisateur en mode hors ligne',
    options: [
      {
        name: 'utilisateur',
        description: 'Utilisateur',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: 'jour',
        description: 'Jours',
        type: ApplicationCommandOptionType.Number,
      },
      {
        name: 'heure',
        description: 'Heures',
        type: ApplicationCommandOptionType.Number,
      },
      {
        name: 'minute',
        description: 'Minutes',
        type: ApplicationCommandOptionType.Number,
      },
      {
        name: 'raison',
        description: 'Raison',
        type: ApplicationCommandOptionType.String,
      },
    ],
    defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
    dmPermission: false,
  },
  { coolTime: 5000 },
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    const member = interaction.options.getMember('utilisateur');
    const duration = Duration.toMS([
      `${interaction.options.getNumber('jour') ?? 0}d`,
      `${interaction.options.getNumber('heure') ?? 0}h`,
      `${interaction.options.getNumber('minute') ?? 0}m`,
    ].join(''));

    if (duration === 0)
      return interaction.reply({ content: '`❌` La durée totale doit être d\'au moins 1 minute.', ephemeral: true });
    if (Duration.toMS('28d') < duration)
      return interaction.reply({ content: '`❌` La durée maximale pour un timeout est de 28 jours.', ephemeral: true });
    if (!(member instanceof GuildMember))
      return interaction.reply({ content: '`❌` Cet utilisateur n\'est pas présent sur le serveur.', ephemeral: true });
    if (member.id === interaction.user.id)
      return interaction.reply({ content: '`❌` Vous ne pouvez pas utiliser cette commande sur vous-même.', ephemeral: true });
    if (!member.moderatable)
      return interaction.reply({ content: '`❌` Échec du timeout en raison de permissions insuffisantes.', ephemeral: true });
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && interaction.member.roles.highest.position < member.roles.highest.position)
      return interaction.reply({ content: '`❌` Vous n\'avez pas les permissions nécessaires pour mettre cet utilisateur en timeout.', ephemeral: true });

    const reason = interaction.options.getString('raison') ?? 'Aucune raison fournie';

    try {
      // Envoi d'un message privé à l'utilisateur avec la raison avant de le mettre en timeout
      await member.send({
        embeds: [
          new EmbedBuilder()
            .setTitle('Avertissement de timeout')
            .setDescription(`Vous avez été mis en timeout sur le serveur **${interaction.guild.name}**.\nRaison : ${reason}\nDurée : ${Duration.format(duration, `**%{d}** jours, **%{h}** heures, **%{m}** minutes`)}`)
            .setColor(Colors.Orange),
        ],
      }).catch(err => console.log("Impossible d'envoyer un MP : ", err));

      // Mettre l'utilisateur en timeout
      await member.timeout(duration, `${reason} - ${interaction.user.tag}`);

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(Duration.format(duration, `\`✅\` ${member} a été mis en timeout pendant **%{d}** jours, **%{h}** heures et **%{m}** minutes`))
            .setColor(Colors.Green),
        ],
        ephemeral: true,
      });
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`❌\` Échec du timeout.\n${codeBlock(errorMessage)}`)
            .setColor(Colors.Red),
        ],
        ephemeral: true,
      });
    }
  },
);

module.exports = [timeoutCommand];