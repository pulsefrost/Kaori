import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, ComponentType, EmbedBuilder, escapeSpoiler, formatEmoji, Message, ModalBuilder, PermissionFlagsBits, roleMention, TextInputBuilder, TextInputStyle, time } from 'discord.js';
import { MessageContext, Modal } from '@akki256/discord-interaction';
import { Emojis } from '../../module/constant';
import { getServerSetting } from '../../module/mongo/middleware';

const reportContext = new MessageContext(
  {
    name: 'Signaler le message',
    dmPermission: false,
  },
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    const setting = await getServerSetting(interaction.guildId, 'report');

    if (!setting?.channel)
      if (interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
        return interaction.reply({ content: '`❌` Cette fonctionnalité nécessite une configuration supplémentaire. Veuillez définir le canal pour recevoir les rapports avec `/setting`. ', ephemeral: true });
      else
        return interaction.reply({ content: '`❌` Cette fonctionnalité n\'est pas actuellement disponible. Veuillez contacter l\'administrateur du serveur. ', ephemeral: true });

    const message = interaction.targetMessage;
    const user = message.author;

    if (user.system || message.webhookId)
      return interaction.reply({ content: '`❌` Vous ne pouvez pas signaler des messages système ou des messages provenant de webhooks. ', ephemeral: true });
    if (user.id === interaction.user.id)
      return interaction.reply({ content: '`❌` Vous essayez de vous signaler vous-même. ', ephemeral: true });
    if (user.id === interaction.client.user.id)
      return interaction.reply({ content: `\`❌\` Vous ne pouvez pas signaler ${interaction.client.user.username}. `, ephemeral: true });

    interaction.showModal(
      new ModalBuilder()
        .setCustomId('kaori:messageReportModal')
        .setTitle('Signaler le message')
        .setComponents(
          new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
              .setCustomId(interaction.targetId)
              .setLabel('Détails')
              .setPlaceholder('Les rapports soumis seront envoyer administrateurs du serveur.')
              .setMaxLength(1500)
              .setStyle(TextInputStyle.Paragraph),
          ),
        ),
    );
  },
);

const reportContextModal = new Modal(
  { customId: 'kaori:messageReportModal' },
  async (interaction) => {
    if (!interaction.inCachedGuild() || !interaction.channel || interaction.components[0].components[0].type !== ComponentType.TextInput) return;
    const setting = await getServerSetting(interaction.guildId, 'report');
    if (!setting?.channel) return interaction.reply({ content: '`❌` Une erreur s\'est produite lors de l\'envoi du rapport. ', ephemeral: true });

    const message = await interaction.channel.messages.fetch(interaction.components[0].components[0].customId).catch(() => undefined);
    const channel = await interaction.guild.channels.fetch(setting.channel).catch(() => undefined);

    if (!(message instanceof Message))
      return interaction.reply({ content: '`❌` Le message que vous essayez de signaler a été supprimé ou le bot n\'a pas pu y accéder. ', ephemeral: true });
    if (!channel?.isTextBased())
      return interaction.reply({ content: '`❌` Une erreur s\'est produite lors de l\'envoi du rapport. ', ephemeral: true });

    channel
      .send({
        content: setting.mention.enable ? roleMention(setting.mention.role || '0') : undefined,
        embeds: [
          new EmbedBuilder()
            .setTitle('`📢` Signalement de message')
            .setDescription([
              `${formatEmoji(Emojis.Gray.edit)} **Auteur :** ${message.author} [${message.author.tag}]`,
              `${formatEmoji(Emojis.Gray.channel)} **Message :** ${message.url}`,
              `${formatEmoji(Emojis.Gray.link)} **Pièces jointes :** ${message.attachments.size} pièces`,
              `${formatEmoji(Emojis.Gray.schedule)} **Heure d'envoi :** ${time(Math.floor(message.createdTimestamp / 1000), 'f')}`,
              '',
              `${formatEmoji(Emojis.Blurple.member)} **Rapporteur :** ${interaction.user} [${interaction.user.tag}]`,
            ].join('\n'))
            .setColor(Colors.DarkButNotBlack)
            .setThumbnail(message.author.displayAvatarURL())
            .setFields(
              { name: 'Message', value: escapeSpoiler(message.content || 'Aucun') },
              { name: 'Raison', value: interaction.components[0].components[0].value },
            ),
        ],
        components: [
          new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
              .setCustomId('kaori:report-consider')
              .setLabel('Traiter')
              .setStyle(ButtonStyle.Primary),
          ),
        ],
      })
      .then(msg => {
        interaction.reply({ content: '`✅` **Merci pour le signalement !** Votre rapport a été envoyé aux administrateurs du serveur. ', ephemeral: true });
        msg.startThread({ name: `Signalement pour ${message.author.username}` }).catch(() => { });
      })
      .catch(() => interaction.reply({ content: '`❌` Une erreur s\'est produite lors de l\'envoi du rapport. ', ephemeral: true }));
  },
);

module.exports = [reportContext, reportContextModal];
