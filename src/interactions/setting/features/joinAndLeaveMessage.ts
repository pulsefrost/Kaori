import { ActionRowBuilder, Colors, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { changeToggleSetting, changeChannelSetting } from '../_functions';
import { Button, Modal } from '@akki256/discord-interaction';
import { isURL } from '../../../module/functions';
import { joinAndLeaveMessagePlaceHolder } from '../../../module/placeholders';
import { FeatureType } from '../_messages';
import { channelModal } from '../_modals';
import ServerSettings from '../../../schemas/ServerSettings';

const joinMessageSetting = [
  // Activation/Désactivation
  new Button(
    { customId: 'kaori:setting-message-join-enable' },
    async (interaction) => {
      const Setting = await ServerSettings.findOne({ serverId: interaction.guildId });
      changeToggleSetting(interaction, { $set: { 'message.join.enable': !Setting?.message.join.enable } }, FeatureType.JoinAndLeaveMessage);
    },
  ),

  // Destination
  new Button(
    { customId: 'kaori:setting-message-join-channel' },
    (interaction) => interaction.showModal(channelModal.setCustomId('kaori:setting-message-join-channel-modal')),
  ),
  new Modal(
    { customId: 'kaori:setting-message-join-channel-modal' },
    async (interaction) => changeChannelSetting(interaction, 'message.join.channel', FeatureType.JoinAndLeaveMessage),
  ),

  // Message
  new Button(
    { customId: 'kaori:setting-message-join-message' },
    async (interaction) => {
      const Setting = await ServerSettings.findOne({ serverId: interaction.guildId });
      const embed = EmbedBuilder.from(Setting?.message.join.messageOptions.embeds?.[0] || {});

      interaction.showModal(
        new ModalBuilder()
          .setCustomId('kaori:setting-message-join-message-modal')
          .setTitle('Message')
          .setComponents(
            new ActionRowBuilder<TextInputBuilder>().setComponents(
              new TextInputBuilder()
                .setCustomId('title')
                .setLabel('Titre')
                .setValue(embed.data.title || '')
                .setMaxLength(256)
                .setStyle(TextInputStyle.Short)
                .setRequired(false),
            ),
            new ActionRowBuilder<TextInputBuilder>().setComponents(
              new TextInputBuilder()
                .setCustomId('url')
                .setLabel('URL du Titre')
                .setValue(embed.data.url || '')
                .setPlaceholder('Exemple : https://kaoricafe.fr/')
                .setStyle(TextInputStyle.Short)
                .setRequired(false),
            ),
            new ActionRowBuilder<TextInputBuilder>().setComponents(
              new TextInputBuilder()
                .setCustomId('description')
                .setLabel('Description')
                .setValue(embed.data.description || '')
                .setMaxLength(3999)
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Conseil : La documentation officielle explique l\'utilisation de syntaxes spéciales.')
                .setRequired(false),
            ),
            new ActionRowBuilder<TextInputBuilder>().setComponents(
              new TextInputBuilder()
                .setCustomId('image')
                .setLabel('URL de l\'image')
                .setValue(embed.data.image?.url || '')
                .setPlaceholder('Exemple : https://example.com/image.png')
                .setStyle(TextInputStyle.Short)
                .setRequired(false),
            ),
            new ActionRowBuilder<TextInputBuilder>().setComponents(
              new TextInputBuilder()
                .setCustomId('color')
                .setLabel('Couleur')
                .setValue(embed.data.color ? `#${embed.data.color.toString(16)}` : '')
                .setPlaceholder('Exemple : #FF5733')
                .setStyle(TextInputStyle.Short)
                .setRequired(false),
            ),
          ),
      );
    },
  ),
  new Modal(
    { customId: 'kaori:setting-message-join-message-modal' },
    async (interaction) => {
      if (!interaction.isFromMessage()) return;

      const title = interaction.fields.getTextInputValue('title');
      const url = interaction.fields.getTextInputValue('url');
      const description = interaction.fields.getTextInputValue('description');
      const imageUrl = interaction.fields.getTextInputValue('image');
      const color = interaction.fields.getTextInputValue('color');

      if (!title && !description)
        return interaction.reply({ content: '`❌` Le titre et la description doivent être saisis.', ephemeral: true });
      if (url && !isURL(url))
        return interaction.reply({ content: '`❌` Veuillez saisir une URL commençant par `http://` ou `https://`.', ephemeral: true });
      if (imageUrl && !isURL(imageUrl))
        return interaction.reply({ content: '`❌` Veuillez saisir une URL d\'image valide commençant par `http://` ou `https://`.', ephemeral: true });
      if (color && !/^#[0-9A-F]{6}$/i.test(color))
        return interaction.reply({ content: '`❌` Veuillez saisir une couleur valide au format hexadécimal.', ephemeral: true });

      const embed = new EmbedBuilder()
        .setTitle(title || null)
        .setURL(url || null)
        .setColor(color ? parseInt(color.slice(1), 16) : Colors.Green)
        .setDescription(description || null)
        .setImage(imageUrl || null);

      const res = await ServerSettings.findOneAndUpdate(
        { serverId: interaction.guildId },
        { $set: { 'message.join.messageOptions.embeds': [embed.toJSON()] } },
        { upsert: true, new: true },
      );

      interaction.update({});
      res.save({ wtimeout: 1_500 });
    },
  ),

  // Aperçu
  new Button(
    { customId: 'kaori:setting-message-join-preview' },
    async (interaction) => {
      if (!interaction.inCachedGuild()) return;
      const Setting = await ServerSettings.findOne({ serverId: interaction.guildId });

      const option = Setting?.message.join.messageOptions;
      if (!option) return interaction.reply({ content: '`❌` Aucun message configuré.', ephemeral: true });

      const guild = interaction.guild;
      const user = interaction.user;

      interaction.reply({
        content: joinAndLeaveMessagePlaceHolder.parse(option.content || '', ({ guild, user })) || undefined,
        embeds: option.embeds?.map(v => EmbedBuilder.from(v)).map(v => EmbedBuilder.from(v)
          .setTitle(joinAndLeaveMessagePlaceHolder.parse(v.data.title || '', ({ guild, user })) || null)
          .setDescription(joinAndLeaveMessagePlaceHolder.parse(v.data.description || '', ({ guild, user })) || null)
          .setURL(v.data.url || null)
          .setColor(v.data.color || Colors.Green)
          .setImage(v.data.image?.url || null)),
        ephemeral: true,
      });
    },
  ),
];

const leaveMessageSetting = [
  // Activation/Désactivation
  new Button(
    { customId: 'kaori:setting-message-leave-enable' },
    async (interaction) => {
      const Setting = await ServerSettings.findOne({ serverId: interaction.guildId });
      changeToggleSetting(interaction, { $set: { 'message.leave.enable': !Setting?.message.leave.enable } }, FeatureType.JoinAndLeaveMessage);
    },
  ),

  // Destination
  new Button(
    { customId: 'kaori:setting-message-leave-channel' },
    (interaction) => interaction.showModal(channelModal.setCustomId('kaori:setting-message-leave-channel-modal')),
  ),
  new Modal(
    { customId: 'kaori:setting-message-leave-channel-modal' },
    (interaction) => changeChannelSetting(interaction, 'message.leave.channel', FeatureType.JoinAndLeaveMessage),
  ),

  // Message
  new Button(
    { customId: 'kaori:setting-message-leave-message' },
    async (interaction) => {
      const Setting = await ServerSettings.findOne({ serverId: interaction.guildId });

      interaction.showModal(
        new ModalBuilder()
          .setCustomId('kaori:setting-message-leave-message-modal')
          .setTitle('Message')
          .setComponents(
            new ActionRowBuilder<TextInputBuilder>().setComponents(
              new TextInputBuilder()
                .setCustomId('content')
                .setLabel('Message')
                .setPlaceholder('Conseil : La documentation officielle explique l\'utilisation de syntaxes spéciales.')
                .setMaxLength(2000)
                .setValue(Setting?.message.leave.messageOptions.content || '')
                .setStyle(TextInputStyle.Paragraph),
            ),
          ),
      );
    },
  ),
  new Modal(
    { customId: 'kaori:setting-message-leave-message-modal' },
    async (interaction) => {
      if (!interaction.isFromMessage()) return;

      const res = await ServerSettings.findOneAndUpdate(
        { serverId: interaction.guildId },
        { $set: { 'message.leave.messageOptions.content': interaction.fields.getTextInputValue('content') } },
        { upsert: true, new: true },
      );

      interaction.update({});
      res.save({ wtimeout: 1_500 });
    },
  ),

  // Aperçu
  new Button(
    { customId: 'kaori:setting-message-leave-preview' },
    async (interaction) => {
      if (!interaction.inCachedGuild()) return;
      const Setting = await ServerSettings.findOne({ serverId: interaction.guildId });

      const option = Setting?.message.leave.messageOptions;
      if (!option) return interaction.reply({ content: '`❌` Aucun message configuré.', ephemeral: true });

      const guild = interaction.guild;
      const user = interaction.user;

      interaction.reply({
        content: joinAndLeaveMessagePlaceHolder.parse(option.content || '', ({ guild, user })) || undefined,
        embeds: option.embeds?.map(v => EmbedBuilder.from(v)).map(v => EmbedBuilder.from(v)
          .setTitle(joinAndLeaveMessagePlaceHolder.parse(v.data.title || '', ({ guild, user })) || null)
          .setDescription(joinAndLeaveMessagePlaceHolder.parse(v.data.description || '', ({ guild, user })) || null)
          .setURL(v.data.url || null)
          .setColor(v.data.color || Colors.Green)
          .setImage(v.data.image?.url || null)
          .setThumbnail(interaction.user.displayAvatarURL())),
        ephemeral: true,
      });
    },
  ),
];

module.exports = [...joinMessageSetting, ...leaveMessageSetting];
