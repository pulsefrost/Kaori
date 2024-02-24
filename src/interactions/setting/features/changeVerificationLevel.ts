import { Button, Modal, SelectMenu, SelectMenuType } from '@akki256/discord-interaction';
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import ServerSettings from '../../../schemas/ServerSettings';
import { changeChannelSetting, changeToggleSetting, reloadMessage } from '../_functions';
import { FeatureType } from '../_messages';
import { channelModal } from '../_modals';

const generalSetting = [
  // Activation/Désactivation
  new Button(
    { customId: 'kaori:setting-changeVerificationLevel-enable' },
    async (interaction) => {
      const Setting = await ServerSettings.findOne({ serverId: interaction.guildId });
      changeToggleSetting(interaction, { $set: { 'changeVerificationLevel.enable': !Setting?.changeVerificationLevel.enable } }, FeatureType.ChangeVerificationLevel);
    },
  ),

  // Heure de début/fin
  new Button(
    { customId: 'kaori:setting-changeVerificationLevel-time' },
    async (interaction) => {
      const Setting = await ServerSettings.findOne({ serverId: interaction.guildId });

      interaction.showModal(
        new ModalBuilder()
          .setCustomId('kaori:setting-changeVerificationLevel-time-modal')
          .setTitle('Heure de début/fin')
          .setComponents(
            new ActionRowBuilder<TextInputBuilder>().setComponents(
              new TextInputBuilder()
                .setCustomId('start')
                .setLabel('Heure de début (0~23)')
                .setMaxLength(2)
                .setStyle(TextInputStyle.Short)
                .setValue(Setting?.changeVerificationLevel.time.start == null ? '' : String(Setting?.changeVerificationLevel.time.start)),
            ),
            new ActionRowBuilder<TextInputBuilder>().setComponents(
              new TextInputBuilder()
                .setCustomId('end')
                .setLabel('Heure de fin (0~23)')
                .setMaxLength(2)
                .setStyle(TextInputStyle.Short)
                .setValue(Setting?.changeVerificationLevel.time.end == null ? '' : String(Setting?.changeVerificationLevel.time.end)),
            ),
          ),
      );
    },
  ),
  new Modal(
    { customId: 'kaori:setting-changeVerificationLevel-time-modal' },
    async (interaction) => {
      if (!interaction.isFromMessage() || !interaction.inCachedGuild()) return;

      const start = parseInt(interaction.fields.getTextInputValue('start'), 10);
      const end = parseInt(interaction.fields.getTextInputValue('end'), 10);

      if (isNaN(start) || start > 23 || start < 0)
        return interaction.reply({ content: '`❌` Valeur invalide pour l\'heure de début.', ephemeral: true });
      if (isNaN(end) || end > 23 || end < 0)
        return interaction.reply({ content: '`❌` Valeur invalide pour l\'heure de fin.', ephemeral: true });
      if (start === end)
        return interaction.reply({ content: '`❌` L\'heure de début et l\'heure de fin ne peuvent pas être définies à la même valeur.', ephemeral: true });

      const res = await ServerSettings.findOneAndUpdate(
        { serverId: interaction.guildId },
        {
          $set: {
            'changeVerificationLevel.time.start': start,
            'changeVerificationLevel.time.end': end,
          },
        },
        { upsert: true, new: true },
      );

      reloadMessage(interaction, res, FeatureType.ChangeVerificationLevel);
    },
  ),

  // Niveau de vérification
  new SelectMenu(
    { customId: 'kaori:setting-changeVerificationLevel-level', type: SelectMenuType.String },
    async (interaction) => {
      const res = await ServerSettings.findOneAndUpdate(
        { serverId: interaction.guildId },
        { $set: { 'changeVerificationLevel.level.new': Number(interaction.values[0]) } },
        { upsert: true, new: true },
      );
      reloadMessage(interaction, res, FeatureType.ChangeVerificationLevel);
    },
  ),
];

const logSetting = [
  // Activation/Désactivation
  new Button(
    { customId: 'kaori:setting-changeVerificationLevel-log-enable' },
    async (interaction) => {
      const Setting = await ServerSettings.findOne({ serverId: interaction.guildId });
      changeToggleSetting(interaction, { $set: { 'changeVerificationLevel.log.enable': !Setting?.changeVerificationLevel.log.enable } }, FeatureType.ChangeVerificationLevel);
    },
  ),

  // Destination
  new Button(
    { customId: 'kaori:setting-changeVerificationLevel-log-channel' },
    (interaction) => interaction.showModal(channelModal.setCustomId('kaori:setting-changeVerificationLevel-log-channel-modal')),
  ),
  new Modal(
    { customId: 'kaori:setting-changeVerificationLevel-log-channel-modal' },
    (interaction) => changeChannelSetting(interaction, 'changeVerificationLevel.log.channel', FeatureType.ChangeVerificationLevel),
  ),
];

module.exports = [...generalSetting, ...logSetting];
