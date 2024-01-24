import { ActionRowBuilder, ButtonBuilder, ButtonStyle, channelMention, ChannelSelectMenuBuilder, ChannelType, Colors, EmbedBuilder, formatEmoji, inlineCode, roleMention, RoleSelectMenuBuilder, StringSelectMenuBuilder } from 'discord.js';
import { Emojis } from '../../module/constant';
import { ControlPanelComponentPagination } from './_pagination';
import { booleanStatus, buttonLabelStatus, buttonStyleStatus, channelStatus, roleStatus } from '../../module/settingStatus';

export const ControlPanelMessages = new Map<FeatureType, ControlPanelComponentPagination>();

export enum FeatureType {
  JoinAndLeaveMessage = 'joinAndLeaveMessage',
  ReportToAdmin = 'reportToAdmin',
  MessageExpansion = 'messageExpansion',
  EventLog = 'eventLog',
  ChangeVerificationLevel = 'changeVerificationLevel',
  AutoPublic = 'autoPublic',
  AutoModPlus = 'autoModPlus',
}

const ChannelTypeMap = new Map([
  [ChannelType.GuildAnnouncement, 'Annonce'],
  [ChannelType.PublicThread, 'Thread (Public)'],
  [ChannelType.PrivateThread, 'Thread (Privé)'],
  [ChannelType.GuildVoice, 'Vocal'],
  [ChannelType.GuildStageVoice, 'Scène'],
]);

const verificationLevel = [
  '`❌` Cela ne devrait pas être visible',
  '`🟢` **Bas:** Comptes avec vérification par e-mail seulement',
  '`🟡` **Moyen:** Comptes enregistrés sur Discord depuis plus de 5 minutes',
  '`🟠` **Élevé:** Membres du serveur depuis plus de 10 minutes',
  '`🔴` **Maximum:** Comptes avec vérification téléphonique seulement',
];

const autoModFilter = new Map([
  ['inviteUrl', 'URL d\'invitation'],
  ['token', 'Token Discord'],
  ['shortUrl', 'URL raccourcie'],
]);

// Messages d'entrée et de sortie
ControlPanelMessages.set(FeatureType.JoinAndLeaveMessage, new ControlPanelComponentPagination()
  .setMessageOptions((setting) => ({
    embeds: [
      new EmbedBuilder()
        .setTitle('`🔧` Paramètres : Messages d\'entrée et de sortie')
        .setDescription('```Envoie des messages lorsque des membres rejoignent ou quittent le serveur. (Les messages peuvent être prévisualisés avec le bouton "Aperçu" de chaque paramètre.)```')
        .setColor(Colors.Blurple)
        .setFields(
          {
            name: 'À l\'entrée',
            value: `${booleanStatus(setting?.message.join.enable)}\n${channelStatus(setting?.message.join.channel)}`,
            inline: true,
          },
          {
            name: 'À la sortie',
            value: `${booleanStatus(setting?.message.leave.enable)}\n${channelStatus(setting?.message.leave.channel)}`,
            inline: true,
          },
        ),
    ],
  }))
  .addActionRows((setting) => [
    new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-message-join-enable')
        .setLabel(buttonLabelStatus(setting?.message.join.enable))
        .setStyle(buttonStyleStatus(setting?.message.join.enable))
        .setDisabled(!setting?.message.join.channel),
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-message-join-channel')
        .setLabel('Destinataire')
        .setEmoji(Emojis.White.channel)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-message-join-message')
        .setLabel('Message')
        .setEmoji(Emojis.White.message)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-message-join-preview')
        .setLabel('Aperçu')
        .setStyle(ButtonStyle.Primary),
    ),
  ], { name: 'Message d\'entrée', description: 'Envoie un message lorsque qu\'un membre rejoint', emoji: Emojis.White.setting })
  .addActionRows((setting) => [
    new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-message-leave-enable')
        .setLabel(buttonLabelStatus(setting?.message.leave.enable))
        .setStyle(buttonStyleStatus(setting?.message.leave.enable))
        .setDisabled(!setting?.message.leave.channel),
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-message-leave-channel')
        .setLabel('Destinataire')
        .setEmoji(Emojis.White.channel)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-message-leave-message')
        .setLabel('Message')
        .setEmoji(Emojis.White.message)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-message-leave-preview')
        .setLabel('Aperçu')
        .setStyle(ButtonStyle.Primary),
    ),
  ], { name: 'Message de sortie', description: 'Envoie un message lorsque qu\'un membre quitte', emoji: Emojis.White.setting }),
);

// Signalement interne dans le serveur
ControlPanelMessages.set(FeatureType.ReportToAdmin, new ControlPanelComponentPagination()
  .setMessageOptions((setting) => ({
    embeds: [
      new EmbedBuilder()
        .setTitle('`🔧` Paramètres : Signalement interne dans le serveur')
        .setDescription('```Les membres peuvent signaler des messages ou des utilisateurs en violation des règles aux modérateurs.```')
        .setColor(Colors.Blurple)
        .setFields(
          {
            name: 'Paramètres généraux',
            value: channelStatus(setting?.report.channel),
            inline: true,
          },
          {
            name: 'Paramètres de notification',
            value: `${booleanStatus(setting?.report.mention.enable)}\n${roleStatus(setting?.report.mention.role)}`,
            inline: true,
          },
        ),
    ],
  }))
  .addActionRows(() => [
    new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-report-channel')
        .setLabel('Destinataire')
        .setEmoji(Emojis.White.channel)
        .setStyle(ButtonStyle.Secondary),
    ),
  ], { name: 'Paramètres de base', emoji: Emojis.White.setting })
  .addActionRows((setting) => [
    new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-report-mention-enable')
        .setLabel(buttonLabelStatus(setting?.report.mention.enable))
        .setStyle(buttonStyleStatus(setting?.report.mention.enable))
        .setDisabled(!setting?.report.mention.role),
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-report-mention-role')
        .setLabel('Rôle')
        .setEmoji(Emojis.White.role)
        .setStyle(ButtonStyle.Secondary),
    ),
  ], { name: 'Paramètres de notification', description: 'Mentionner un rôle lors de la réception d\'un signalement', emoji: Emojis.White.role }),
);

// Expansion des URL de message
ControlPanelMessages.set(FeatureType.MessageExpansion, new ControlPanelComponentPagination()
  .setMessageOptions((setting) => ({
    embeds: [
      new EmbedBuilder()
        .setTitle('`🔧` Paramètres : Expansion des URL de message')
        .setDescription('```Lorsqu\'une URL de message Discord est envoyée, envoie le contenu du message ainsi que les informations sur l\'expéditeur.```')
        .setColor(Colors.Blurple)
        .setFields(
          {
            name: 'Paramètres de base',
            value: booleanStatus(setting?.message.expansion.enable),
          },
          {
            name: 'Exceptions (Types)',
            value: setting?.message.expansion.ignore.types?.map(v => ChannelTypeMap.get(v)).filter(Boolean).map(v => `\`${v}\``).join(' ') || 'Aucune',
            inline: true,
          },
          {
            name: 'Exceptions (Canaux)',
            value: setting?.message.expansion.ignore.channels?.map(v => channelMention(v)).join(' ') || 'Aucune',
            inline: true,
          },
        ),
    ],
  }))
  .addActionRows((setting) => [
    new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-message-expansion-enable')
        .setLabel(buttonLabelStatus(setting?.message.expansion.enable))
        .setStyle(buttonStyleStatus(setting?.message.expansion.enable)),
    ),
  ], { name: 'Paramètres de base', emoji: Emojis.White.setting })
  .addActionRows((setting) => [
    new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
      new StringSelectMenuBuilder()
        .setCustomId('nonick-js:setting-message-expansion-ignore-types')
        .setMinValues(0)
        .setMaxValues(4)
        .setPlaceholder('Exceptions (Types)')
        .setOptions(
          [
            {
              label: 'Annonce',
              value: String(ChannelType.GuildAnnouncement),
              emoji: '966773928787836958',
            },
            {
              label: 'Vocal',
              value: String(ChannelType.GuildVoice),
              emoji: '966773928733315142',
            },
            // {
            //   label: 'Scène',
            //   value: String(ChannelType.GuildStageVoice),
            //   emoji: '966773928645255178',
            // },
            {
              label: 'Thread (Public)',
              value: String(ChannelType.PublicThread),
              emoji: '966773928712359946',
            },
            {
              label: 'Thread (Privé)',
              value: String(ChannelType.PrivateThread),
              emoji: '966773928712359946',
            },
          ].map(options => ({ ...options, default: setting?.message.expansion.ignore.types.includes(Number(options.value)) })),
        ),
    ),
    new ActionRowBuilder<ChannelSelectMenuBuilder>().setComponents(
      new ChannelSelectMenuBuilder()
        .setCustomId('nonick-js:setting-message-expansion-ignore-channels')
        .setPlaceholder('Exceptions (Canaux)')
        .setChannelTypes([ChannelType.GuildText, ChannelType.GuildForum, ChannelType.GuildVoice, ChannelType.GuildStageVoice])
        .setMinValues(0)
        .setMaxValues(25),
    ),
  ], { name: 'Exceptions', description: 'Configurer les canaux où l\'expansion d\'URL ne doit pas avoir lieu', emoji: Emojis.White.setting }),
);

// Journal des événements
ControlPanelMessages.set(FeatureType.EventLog, new ControlPanelComponentPagination()
  .setMessageOptions((setting) => ({
    embeds: [
      new EmbedBuilder()
        .setTitle('`🔧` Paramètres : Journal des événements')
        .setDescription('```Envoie des journaux des événements survenus dans le serveur.```')
        .setColor(Colors.Blurple)
        .setFields(
          {
            name: 'Timeout',
            value: `${booleanStatus(setting?.log.timeout.enable)}\n${channelStatus(setting?.log.timeout.channel)}`,
            inline: true,
          },
          {
            name: 'Kick',
            value: `${booleanStatus(setting?.log.kick.enable)}\n${channelStatus(setting?.log.kick.channel)}`,
            inline: true,
          },
          {
            name: 'BAN',
            value: `${booleanStatus(setting?.log.ban.enable)}\n${channelStatus(setting?.log.ban.channel)}`,
            inline: true,
          },
          {
            name: 'VC',
            value: `${booleanStatus(setting?.log.voice.enable)}\n${channelStatus(setting?.log.voice.channel)}`,
            inline: true,
          },
          {
            name: 'Suppression',
            value: `${booleanStatus(setting?.log.delete.enable)}\n${channelStatus(setting?.log.delete.channel)}`,
            inline: true,
          },
        ),
    ],
  }))
  .addActionRows((setting) => [
    new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-log-timeout-enable')
        .setLabel(buttonLabelStatus(setting?.log.timeout.enable))
        .setStyle(buttonStyleStatus(setting?.log.timeout.enable))
        .setDisabled(!setting?.log?.timeout?.channel),
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-log-timeout-channel')
        .setLabel('Destinataire')
        .setEmoji(Emojis.White.channel)
        .setStyle(ButtonStyle.Secondary),
    ),
  ], { name: 'Journal des timeouts', emoji: Emojis.White.setting })
  .addActionRows((setting) => [
    new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-log-kick-enable')
        .setLabel(buttonLabelStatus(setting?.log.kick.enable))
        .setStyle(buttonStyleStatus(setting?.log.kick.enable))
        .setDisabled(!setting?.log.kick.channel),
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-log-kick-channel')
        .setLabel('Destinataire')
        .setEmoji(Emojis.White.channel)
        .setStyle(ButtonStyle.Secondary),
    ),
  ], { name: 'Journal des kicks', emoji: Emojis.White.setting })
  .addActionRows((setting) => [
    new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-log-ban-enable')
        .setLabel(buttonLabelStatus(setting?.log.ban.enable))
        .setStyle(buttonStyleStatus(setting?.log.ban.enable))
        .setDisabled(!setting?.log.ban.channel),
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-log-ban-channel')
        .setLabel('Destinataire')
        .setEmoji(Emojis.White.channel)
        .setStyle(ButtonStyle.Secondary),
    ),
  ], { name: 'Journal des bans', emoji: Emojis.White.setting })
  .addActionRows((setting) => [
    new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-log-voice-enable')
        .setLabel(buttonLabelStatus(setting?.log.voice.enable))
        .setStyle(buttonStyleStatus(setting?.log.voice.enable))
        .setDisabled(!setting?.log.voice.channel),
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-log-voice-channel')
        .setLabel('Destinataire')
        .setEmoji(Emojis.White.channel)
        .setStyle(ButtonStyle.Secondary),
    ),
  ], { name: 'Journal des canaux vocaux', emoji: Emojis.White.setting })
  .addActionRows((setting) => [
    new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-log-delete-enable')
        .setLabel(buttonLabelStatus(setting?.log.delete.enable))
        .setStyle(buttonStyleStatus(setting?.log.delete.enable))
        .setDisabled(!setting?.log.delete.channel),
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-log-delete-channel')
        .setLabel('Destinataire')
        .setEmoji(Emojis.White.channel)
        .setStyle(ButtonStyle.Secondary),
    ),
  ], { name: 'Journal des suppressions', emoji: Emojis.White.setting }),
);

// Changement automatique du niveau de vérification
ControlPanelMessages.set(FeatureType.ChangeVerificationLevel, new ControlPanelComponentPagination()
  .setMessageOptions((setting) => ({
    embeds: [
      new EmbedBuilder()
        .setTitle('`🔧` Paramètres : Changement automatique du niveau de vérification')
        .setDescription('```Change automatiquement le niveau de vérification du serveur pendant une certaine période.```')
        .setColor(Colors.Blurple)
        .setFields(
          {
            name: 'Paramètres généraux',
            value: [
              booleanStatus(setting?.changeVerificationLevel.enable),
              `${formatEmoji(Emojis.Gray.schedule)} **Heure de début : **${setting?.changeVerificationLevel.time.start == null ? 'Non défini' : `${setting?.changeVerificationLevel.time.start}:00`}`,
              `${formatEmoji(Emojis.Gray.schedule)} **Heure de fin : **${setting?.changeVerificationLevel.time.end == null ? 'Non défini' : `${setting?.changeVerificationLevel.time.end}:00`}`,
            ].join('\n'),
            inline: true,
          },
          {
            name: 'Paramètres de journal',
            value: `${booleanStatus(setting?.changeVerificationLevel.log.enable)}\n${channelStatus(setting?.changeVerificationLevel.log.channel)}`,
            inline: true,
          },
          {
            name: 'Niveau à changer pendant la période',
            value: `${setting?.changeVerificationLevel.level.new == null ? 'Non défini' : verificationLevel[setting?.changeVerificationLevel.level.new]}`,
          },
        ),
    ],
  }))
  .addActionRows((setting) => [
    new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
      new StringSelectMenuBuilder()
        .setCustomId('nonick-js:setting-changeVerificationLevel-level')
        .setPlaceholder('Configurer le niveau de vérification à changer pendant la période')
        .setOptions([
          { label: 'Bas', value: '1', description: 'Seuls les comptes avec une vérification par e-mail', emoji: '🟢' },
          { label: 'Moyen', value: '2', description: 'Comptes inscrits sur Discord depuis plus de 5 minutes', emoji: '🟡' },
          { label: 'Élevé', value: '3', description: 'Membres du serveur depuis plus de 10 minutes', emoji: '🟠' },
          { label: 'Très élevé', value: '4', description: 'Comptes avec vérification par téléphone uniquement', emoji: '🔴' },
        ].map(option => ({ ...option, default: setting?.changeVerificationLevel.level.new === Number(option.value) }))),
    ),
    new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-changeVerificationLevel-enable')
        .setLabel(buttonLabelStatus(setting?.changeVerificationLevel.enable))
        .setStyle(buttonStyleStatus(setting?.changeVerificationLevel.enable))
        .setDisabled(!(setting?.changeVerificationLevel.level.new && setting?.changeVerificationLevel.time.start !== null && setting?.changeVerificationLevel.time.end !== null)),
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-changeVerificationLevel-time')
        .setLabel('Heure de début et de fin')
        .setEmoji(Emojis.White.schedule)
        .setStyle(ButtonStyle.Secondary),
    ),
  ], { name: 'Paramètres généraux', emoji: Emojis.White.setting })
  .addActionRows((setting) => [
    new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-changeVerificationLevel-log-enable')
        .setLabel(buttonLabelStatus(setting?.changeVerificationLevel.log.enable))
        .setStyle(buttonStyleStatus(setting?.changeVerificationLevel.log.enable))
        .setDisabled(!setting?.changeVerificationLevel.log.channel),
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-changeVerificationLevel-log-channel')
        .setLabel('Destinataire')
        .setStyle(ButtonStyle.Secondary),
    ),
  ], { name: 'Paramètres de journal', description: 'Envoyer un journal lors du changement de niveau de vérification', emoji: Emojis.White.setting }),
);

// Annonce automatique
ControlPanelMessages.set(FeatureType.AutoPublic, new ControlPanelComponentPagination()
  .setMessageOptions((setting) => ({
    embeds: [
      new EmbedBuilder()
        .setTitle('`🔧` Paramètres : Annonce automatique')
        .setDescription('```Publie automatiquement les messages envoyés dans le canal d\'annonce spécifié. (Les messages envoyés par le BOT ne seront pas publiés)```')
        .setColor(Colors.Blurple)
        .setFields(
          {
            name: 'Paramètres généraux',
            value: booleanStatus(setting?.autoPublic.enable),
            inline: true,
          },
          {
            name: 'Canal',
            value: setting?.autoPublic.channels.map(v => channelMention(v)).join(' ') || 'Aucun',
            inline: true,
          },
        ),
    ],
  }))
  .addActionRows((setting) => [
    new ActionRowBuilder<ChannelSelectMenuBuilder>().setComponents(
      new ChannelSelectMenuBuilder()
        .setCustomId('nonick-js:setting-autoPublic-channels')
        .setPlaceholder('Sélectionner les canaux')
        .setChannelTypes(ChannelType.GuildAnnouncement)
        .setMinValues(0)
        .setMaxValues(5),
    ),
    new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-autoPublic-enable')
        .setLabel(buttonLabelStatus(setting?.autoPublic.enable))
        .setStyle(buttonStyleStatus(setting?.autoPublic.enable)),
    ),
  ], { name: 'Paramètres généraux', emoji: Emojis.White.setting }),
);

// AutoMod Plus
ControlPanelMessages.set(FeatureType.AutoModPlus, new ControlPanelComponentPagination()
  .setMessageOptions((setting) => ({
    embeds: [
      new EmbedBuilder()
        .setTitle('`🔧` Paramètres : AutoMod Plus')
        .setDescription('```Active des filtres de messages avancés difficiles à configurer avec AutoMod standard. Les messages détectés par les filtres seront automatiquement supprimés.```')
        .setColor(Colors.Blurple)
        .setFields(
          {
            name: 'Paramètres généraux',
            value: [
              booleanStatus(setting?.autoMod.enable),
              `${formatEmoji(Emojis.Gray.text)} **Filtre :** ${Object.entries(setting?.autoMod.filter || {}).filter(v => v[1]).map(v => inlineCode(autoModFilter.get(v[0])!)).join(' ') || 'Aucun'}`,
            ].join('\n'),
            inline: true,
          },
          {
            name: 'Paramètres de journal',
            value: `${booleanStatus(setting?.autoMod.log.enable)}\n${channelStatus(setting?.autoMod.log.channel)}`,
            inline: true,
          },
          {
            name: 'Paramètres d\'exception',
            value: [
              `${formatEmoji(Emojis.Gray.channel)} **Canaux :** ${setting?.autoMod.ignore.channels.map(v => channelMention(v)).join(' ') || 'Aucun'}`,
              `${formatEmoji(Emojis.Gray.member)} **Rôles :** ${setting?.autoMod.ignore.roles.map(v => roleMention(v)).join(' ') || 'Aucun'}`,
            ].join('\n'),
          },
        )
        .setFooter({ text: 'Astuce : Les utilisateurs ayant la permission "Gérer le serveur" ne seront pas détectés par ce filtre.' }),
    ],
  }))
  .addActionRows((setting) => [
    new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
      new StringSelectMenuBuilder()
        .setCustomId('nonick-js:setting-automod-filter')
        .setPlaceholder('Sélectionner le filtre à activer')
        .setMinValues(0)
        .setMaxValues(3)
        .setOptions(
          [
            { label: 'Liens d\'invitation en dehors de ce serveur', value: 'inviteUrl', emoji: Emojis.White.message },
            { label: 'Jetons Discord', value: 'token', emoji: Emojis.White.message },
            { label: 'URL raccourcies', value: 'shortUrl', emoji: Emojis.White.message },
          ].map(options => ({ ...options, default: Object.entries(setting?.autoMod.filter || {}).filter(v => v[1]).map(v => v[0]).includes(options.value) })),
        ),
    ),
    new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-automod-enable')
        .setLabel(buttonLabelStatus(setting?.autoMod.enable))
        .setStyle(buttonStyleStatus(setting?.autoMod.enable)),
    ),
  ], { name: 'Paramètres généraux', emoji: Emojis.White.setting })
  .addActionRows((setting) => [
    new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-automod-log-enable')
        .setLabel(buttonLabelStatus(setting?.autoMod.log.enable))
        .setStyle(buttonStyleStatus(setting?.autoMod.log.enable))
        .setDisabled(!setting?.autoMod.log.channel),
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-automod-log-channel')
        .setLabel('Destinataire')
        .setEmoji(Emojis.White.channel)
        .setStyle(ButtonStyle.Secondary),
    ),
  ], { name: 'Paramètres de journal', description: 'Envoyer un journal lorsque des messages sont bloqués', emoji: Emojis.White.setting })
  .addActionRows((setting) => [
    new ActionRowBuilder<ChannelSelectMenuBuilder>().setComponents(
      new ChannelSelectMenuBuilder()
        .setCustomId('nonick-js:setting-automod-ignore-channels')
        .setPlaceholder('Paramètres d\'exception (Canaux)')
        .setChannelTypes([ChannelType.GuildText, ChannelType.GuildForum, ChannelType.GuildVoice, ChannelType.GuildStageVoice])
        .setMinValues(0)
        .setMaxValues(25),
    ),
    new ActionRowBuilder<RoleSelectMenuBuilder>().setComponents(
      new RoleSelectMenuBuilder()
        .setCustomId('nonick-js:setting-automod-ignore-roles')
        .setPlaceholder('Paramètres d\'exception (Rôles)')
        .setMinValues(0)
        .setMaxValues(25),
    ),
    new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setCustomId('nonick-js:setting-automod-ignore-deleteAll')
        .setLabel('Supprimer toutes les exceptions')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(!(setting?.autoMod.ignore.channels.length || setting?.autoMod.ignore.roles.length)),
    ),
  ], { name: 'Paramètres d\'exception', description: 'Configurer les canaux/rôles qui ne seront pas affectés par le filtre', emoji: Emojis.White.setting }),
);
