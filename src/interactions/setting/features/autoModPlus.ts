import { Button, Modal, SelectMenu, SelectMenuType } from '@akki256/discord-interaction';
import ServerSettings from '../../../schemas/ServerSettings';
import { changeChannelSetting, changeToggleSetting, reloadMessage } from '../_functions';
import { FeatureType } from '../_messages';
import { channelModal } from '../_modals';

const generalSetting = [
  // Activation/Désactivation
  new Button(
    { customId: 'kaori:setting-automod-enable' },
    async (interaction) => {
      const Setting = await ServerSettings.findOne({ serverId: interaction.guildId });
      changeToggleSetting(interaction, { $set: { 'autoMod.enable': !Setting?.autoMod.enable } }, FeatureType.AutoModPlus);
    },
  ),

  // Filtre
  new SelectMenu(
    { customId: 'kaori:setting-automod-filter', type: SelectMenuType.String },
    async (interaction) => {
      const values = interaction.values;
      const res = await ServerSettings.findOneAndUpdate(
        { serverId: interaction.guildId },
        {
          $set: {
            'autoMod.filter.inviteUrl': values.includes('inviteUrl'),
            'autoMod.filter.token': values.includes('token'),
            'autoMod.filter.shortUrl': values.includes('shortUrl'),
          },
        },
        { upsert: true, new: true },
      );

      reloadMessage(interaction, res, FeatureType.AutoModPlus);
    },
  ),
];

const logSetting = [
  // Activation/Désactivation
  new Button(
    { customId: 'kaori:setting-automod-log-enable' },
    async (interaction) => {
      const Setting = await ServerSettings.findOne({ serverId: interaction.guildId });
      changeToggleSetting(interaction, { $set: { 'autoMod.log.enable': !Setting?.autoMod.log.enable } }, FeatureType.AutoModPlus);
    },
  ),

  // Destination
  new Button(
    { customId: 'kaori:setting-automod-log-channel' },
    (interaction) => interaction.showModal(channelModal.setCustomId('kaori:setting-automod-log-channel-modal')),
  ),
  new Modal(
    { customId: 'kaori:setting-automod-log-channel-modal' },
    (interaction) => changeChannelSetting(interaction, 'autoMod.log.channel', FeatureType.AutoModPlus),
  ),
];

const ignoreSetting = [
  // Canal
  new SelectMenu(
    { customId: 'kaori:setting-automod-ignore-channels', type: SelectMenuType.Channel },
    async (interaction) => {
      const res = await ServerSettings.findOneAndUpdate(
        { serverId: interaction.guildId },
        { $set: { 'autoMod.ignore.channels': interaction.values } },
        { upsert: true, new: true },
      );

      reloadMessage(interaction, res, FeatureType.AutoModPlus);
    },
  ),

  // Rôle
  new SelectMenu(
    { customId: 'kaori:setting-automod-ignore-roles', type: SelectMenuType.Role },
    async (interaction) => {
      const res = await ServerSettings.findOneAndUpdate(
        { serverId: interaction.guildId },
        { $set: { 'autoMod.ignore.roles': interaction.values } },
        { upsert: true, new: true },
      );

      reloadMessage(interaction, res, FeatureType.AutoModPlus);
    },
  ),

  // Rôle
  new SelectMenu(
    { customId: 'kaori:setting-automod-ignore-categories', type: SelectMenuType.Role },
    async (interaction) => {
      const res = await ServerSettings.findOneAndUpdate(
        { serverId: interaction.guildId },
        { $set: { 'autoMod.ignore.categories': interaction.values } },
        { upsert: true, new: true },
      );

      reloadMessage(interaction, res, FeatureType.AutoModPlus);
    },
  ),

  // Supprimer tout
  new Button(
    { customId: 'kaori:setting-automod-ignore-deleteAll' },
    async (interaction) => {
      const res = await ServerSettings.findOneAndUpdate(
        { serverId: interaction.guildId },
        {
          $set: {
            'autoMod.ignore.channels': [],
            'autoMod.ignore.roles': [],
            'autoMod.ignore.categories': [],
          },
        },
        { upsert: true, new: true },
      );

      reloadMessage(interaction, res, FeatureType.AutoModPlus);
    },
  ),
];

module.exports = [...generalSetting, ...logSetting, ...ignoreSetting];
