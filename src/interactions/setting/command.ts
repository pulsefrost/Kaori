import { ChatInput, SelectMenu, SelectMenuType } from '@akki256/discord-interaction';
import { ActionRowBuilder, ApplicationCommandOptionType, Colors, EmbedBuilder, PermissionFlagsBits, StringSelectMenuBuilder } from 'discord.js';
import { ControlPanelMessages, FeatureType } from './_messages';
import { ControlPanelComponentPagination } from './_pagination';

const command = new ChatInput(
  {
    name: 'setting',
    description: 'Paramètres du BOT',
    options: [
      {
        name: 'fonctions',
        description: 'Fonctionnalité à configurer',
        choices: [
          { name: 'Messages d\'arrivée et de départ', value: FeatureType.JoinAndLeaveMessage },
          { name: 'Signalement interne au serveur', value: FeatureType.ReportToAdmin },
          { name: 'Expansion d\'URL de message', value: FeatureType.MessageExpansion },
          { name: 'Journal des événements', value: FeatureType.EventLog },
          { name: 'Changement automatique du niveau de vérification', value: FeatureType.ChangeVerificationLevel },
          { name: 'Annonce automatique', value: FeatureType.AutoPublic },
          { name: 'AutoMod Plus', value: FeatureType.AutoModPlus },
        ],
        type: ApplicationCommandOptionType.String,
      },
    ],
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
  },
  { coolTime: 10_000 },
  async (interaction) => {
    if (interaction.options.getString('fonctions')) {
      const pagination = ControlPanelMessages.get(interaction.options.getString('fonctions') as FeatureType);
      if (!(pagination instanceof ControlPanelComponentPagination)) return;
      return pagination.replyMessage(interaction, true);
    }

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('`🔧` Paramètres')
          .setDescription([
            'Veuillez choisir la fonctionnalité que vous souhaitez configurer.',
            'Pour obtenir des instructions détaillées sur la procédure et les paramètres de chaque fonctionnalité, veuillez consulter [ici](https://discord.gg/amies).',
          ].join('\n'))
          .setColor(Colors.Blurple),
      ],
      components: [
        new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
          new StringSelectMenuBuilder()
            .setCustomId('kaori:setting-features')
            .setMinValues(0)
            .setOptions(
              { label: 'Messages d\'arrivée et de départ', value: FeatureType.JoinAndLeaveMessage, description: 'Envoyer un message lorsque des membres rejoignent ou quittent le serveur', emoji: '🚪' },
              { label: 'Signalement interne au serveur', value: FeatureType.ReportToAdmin, description: 'Permettre aux membres de signaler des messages ou des utilisateurs', emoji: '💬' },
              { label: 'Expansion d\'URL de message', value: FeatureType.MessageExpansion, description: 'Afficher le contenu des URL de messages Discord envoyées', emoji: '🔗' },
              { label: 'Journal des événements', value: FeatureType.EventLog, description: 'Envoyer des journaux d\'événements survenus dans le serveur', emoji: '📃' },
              { label: 'Changement automatique du niveau de vérification', value: FeatureType.ChangeVerificationLevel, description: 'Modifier automatiquement le niveau de vérification du serveur', emoji: '✅' },
              { label: 'Annonce automatique', value: FeatureType.AutoPublic, description: 'Publier automatiquement les messages envoyés dans un salon d\'annonces', emoji: '📢' },
              { label: 'AutoMod Plus', value: FeatureType.AutoModPlus, description: 'Bloquer l\'envoi de messages détectés par certains filtres', emoji: '🛡' },
            ),
        ),
      ],
      ephemeral: true,
    });
  },
);

const featuresSelect = new SelectMenu(
  { customId: 'kaori:setting-features', type: SelectMenuType.String },
  (interaction) => {
    if (!interaction.values.length) return interaction.update({});

    const pagination = ControlPanelMessages.get(interaction.values[0] as FeatureType);
    if (!(pagination instanceof ControlPanelComponentPagination)) return;
    pagination.replyMessage(interaction, true);
  },
);

module.exports = [command, featuresSelect];
