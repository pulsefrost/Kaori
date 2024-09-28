import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, formatEmoji, ModalBuilder, PermissionFlagsBits, roleMention, TextInputBuilder, TextInputStyle, time, User, ComponentType } from 'discord.js';
import { Modal, UserContext } from '@akki256/discord-interaction';
import { Emojis } from '../../module/constant';
import { getServerSetting } from '../../module/mongo/middleware';

const reportContext = new UserContext(
  {
    name: 'Signaler l\'utilisateur',
    dmPermission: false,
  },
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    const setting = await getServerSetting(interaction.guildId, 'report');
    const user = interaction.targetUser;

    if (!setting?.channel) {
      return interaction.reply({ 
        content: interaction.member.permissions.has(PermissionFlagsBits.ManageGuild) 
          ? '`❌` Cette fonctionnalité nécessite une configuration supplémentaire. Veuillez définir le canal pour recevoir les rapports avec `/setting`.'
          : '`❌` Cette fonctionnalité n\'est pas actuellement disponible. Veuillez contacter l\'administrateur du serveur.', 
        ephemeral: true 
      });
    }

    if (user.system || user.id === interaction.client.user.id) {
      return interaction.reply({ content: '`❌` Vous ne pouvez pas signaler cet utilisateur. ', ephemeral: true });
    }
    if (user.id === interaction.user.id) {
      return interaction.reply({ content: '`❌` Vous essayez de vous signaler vous-même. ', ephemeral: true });
    }

    // Affichage du modal
    const modal = new ModalBuilder()
      .setCustomId(`kaori:userReportModal:${user.id}`) // Ajoutez l'ID de l'utilisateur ici
      .setTitle('Signaler l\'utilisateur')
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId('reportDetails') // ID personnalisé pour le TextInput
            .setLabel('Détails')
            .setPlaceholder('Les rapports soumis seront visibles uniquement par les administrateurs.')
            .setMaxLength(1500)
            .setStyle(TextInputStyle.Paragraph),
        ),
      );

    await interaction.showModal(modal); // Ouvrir le modal
  },
);

const reportContextModal = new Modal(
  { customId: /kaori:userReportModal:(\d+)/ }, // Utilisez une regex pour capturer l'ID de l'utilisateur
  async (interaction) => {
    if (!interaction.inCachedGuild() || !interaction.channel) return;

    // Vérifiez si le modal a les composants attendus
    const textInputComponent = interaction.components[0]?.components[0];
    if (!textInputComponent || textInputComponent.type !== ComponentType.TextInput) return;

    const setting = await getServerSetting(interaction.guildId, 'report');
    if (!setting?.channel) {
      return interaction.reply({ content: '`❌` Une erreur s\'est produite lors de l\'envoi du rapport. ', ephemeral: true });
    }

    // Récupérez l'ID de l'utilisateur à partir de l'ID du modal
    const userId = interaction.customId.split(':')[2]; // Récupère l'ID de l'utilisateur
    const user = await interaction.client.users.fetch(userId).catch(() => undefined);
    const channel = await interaction.guild.channels.fetch(setting.channel).catch(() => undefined);

    if (!user || !channel?.isTextBased()) {
      return interaction.reply({ content: '`❌` Une erreur s\'est produite lors de l\'envoi du rapport. ', ephemeral: true });
    }

    channel.send({
      content: setting.mention?.enable ? roleMention(setting.mention.role || '0') : undefined,
      embeds: [
        new EmbedBuilder()
          .setTitle('`📢` Signalement de l\'utilisateur')
          .setDescription([
            `${formatEmoji(Emojis.Gray.edit)} **Auteur :** ${user} [${user.tag}]`,
            `${formatEmoji(Emojis.Gray.schedule)} **Date de création du compte :** ${time(Math.floor(user.createdTimestamp / 1000), 'D')}`,
            '',
            `${formatEmoji(Emojis.Blurple.member)} **Rapporteur :** ${interaction.user} [${interaction.user.tag}]`,
          ].join('\n'))
          .setColor(Colors.DarkButNotBlack)
          .setThumbnail(user.displayAvatarURL())
          .setFields(
            { name: 'Raison', value: textInputComponent.value }, // Utilisation de la valeur du TextInput
          ),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('kaori:report-consider')
            .setLabel('Traiter')
            .setStyle(ButtonStyle.Primary),
        ),
      ],
    })
    .then(message => {
      interaction.reply({ content: '`✅` **Merci pour le signalement !** Votre rapport a été envoyé aux administrateurs du serveur. ', ephemeral: true });
      message.startThread({ name: `Signalement pour ${user.username}` }).catch(() => { });
    })
    .catch(() => interaction.reply({ content: '`❌` Une erreur s\'est produite lors de l\'envoi du rapport. ', ephemeral: true }));
  },
);

module.exports = [reportContext, reportContextModal];