import { ApplicationCommandOptionType, bold, Colors, EmbedBuilder, formatEmoji, GuildFeature, GuildMember, inlineCode, Interaction, PermissionFlagsBits, time, User, Collection } from 'discord.js';
import { ChatInput, UserContext } from '@akki256/discord-interaction';
import { Emojis } from '../module/constant';

const flagEmojis = new Map([
  ['Staff', { emoji: '1251322333856010260', name: 'Staff' }],
  ['Partner', { emoji: '1251322713205772299', name: 'Partner' }],
  ['CertifiedModerator', { emoji: '1251322251702304808', name: 'Certified Moderator' }],
  ['Hypesquad', { emoji: '1251322395596292137', name: 'Hypesquad' }],
  ['HypeSquadOnlineHouse1', { emoji: '1251322481390653541', name: 'House Bravery' }],
  ['HypeSquadOnlineHouse2', { emoji: '1251322506938290207', name: 'House Brilliance' }],
  ['HypeSquadOnlineHouse3', { emoji: '1251322492228862085', name: 'House Balance' }],
  ['BugHunterLevel1', { emoji: '1251321662872485929', name: 'Bug Hunter Level 1' }],
  ['BugHunterLevel2', { emoji: '1251321756350943385', name: 'Bug Hunter Level 2' }],
  ['ActiveDeveloper', { emoji: '1251321904657207338', name: 'Active Developer' }],
  ['VerifiedDeveloper', { emoji: '1251322246257971301', name: 'Verified Developer' }],
  ['PremiumEarlySupporter', { emoji: '1251323760636854323', name: 'Early Supporter' }],
]);

const featureTexts = new Map<string, string>([
  [GuildFeature.Partnered, `${formatEmoji('1251322713205772299')} Discord Partner`],
  [GuildFeature.Verified, `${formatEmoji('1251322254256771156')} Vérifié`],
  [GuildFeature.Discoverable, `${formatEmoji('1251324088983490591')} Serveur public`],
]);

const Command = new ChatInput(
  {
    name: 'info',
    description: 'Afficher les informations d\'un utilisateur/serveur',
    options: [
      {
        name: 'utilisateur',
        description: 'Afficher les informations d\'un utilisateur',
        type: ApplicationCommandOptionType.User,
        required: false, // Changer en false pour rendre optionnel
      },
      {
        name: 'serveur',
        description: 'Afficher les informations du serveur',
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
    dmPermission: false,
  },
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;
    const subCommand = interaction.options.getSubcommand();

    if (subCommand === 'utilisateur') {
      const user = interaction.options.getUser('utilisateur') || interaction.user; // Utilise l'utilisateur qui exécute la commande si aucun n'est spécifié
      return interaction.reply({ embeds: [await createUserInfoEmbed(interaction, user)], ephemeral: false });
    }

    if (subCommand === 'serveur') {
      const guild = interaction.guild;
      const bans = await guild.bans.fetch().catch(() => []);
      const banCount = bans instanceof Collection ? bans.size : 0;
      const onlineMembers = guild.members.cache.filter(member => member.presence?.status === 'online').size;
      const offlineMembers = guild.members.cache.filter(member => !member.presence || member.presence.status === 'offline').size;
      const voiceMembers = guild.channels.cache.filter(channel => channel.isVoiceBased()).reduce((acc, channel) => acc + (channel.members.size || 0), 0);
      const botCount = guild.members.cache.filter(member => member.user.bot).size;
      const boosterList = guild.members.cache.filter(member => member.premiumSince).map(member => member.user.tag).join(', ') || 'Aucun booster';
      const securityLevel = guild.verificationLevel;

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(guild.name)
            .setDescription([
              `${formatEmoji(Emojis.White.id)} ID du serveur: \`${guild.id}\``,
              `${formatEmoji(Emojis.White.nickName)} Propriétaire: ${await guild.fetchOwner()}`,
              `${formatEmoji(Emojis.White.nickName)} Nombre de membres: \`${guild.memberCount}\` personnes`,
              `${formatEmoji(Emojis.White.channel)} Nombre de canaux: \`${guild.channels.channelCountWithoutThreads}\``,
              `${formatEmoji(Emojis.White.schedule)} Date de création: ${time(guild.createdAt, 'D')}`,
              `${formatEmoji(Emojis.White.boost)} Nombre de boosts: \`${guild.premiumSubscriptionCount}\``,
              `${formatEmoji(Emojis.White.boost)} Boosters: ${boosterList}`,
              `${formatEmoji(Emojis.White.nickName)} Membres maximum : ${guild.maximumMembers ?? 'Inconnu'}`,
              `${formatEmoji(Emojis.White.nickName)} Membres en ligne : ${onlineMembers}`,
              `${formatEmoji(Emojis.White.nickName)} Membres hors ligne : ${offlineMembers}`,
              `${formatEmoji(Emojis.White.nickName)} Membres en vocal : ${voiceMembers}`,
              `${formatEmoji(Emojis.White.nickName)} Nombre de bots : ${botCount}`,
              `${formatEmoji(Emojis.White.nickName)} Membres bannis : ${banCount}`,
              `🛑 Niveau de sécurité : ${securityLevel}`
            ].join('\n'))
            .setColor('#2b2d31')
            .setImage('https://i.imgur.com/UwgK8CP.png')
            .setFields(
              { name: 'Statut', value: guild.features.map(v => featureTexts.get(v)).filter(Boolean).join('\n') || 'Aucun' }
            ),
        ],
        ephemeral: false,
      });
    }
  },
);

const Context = new UserContext(
  {
    name: 'Informations utilisateur',
    dmPermission: false,
  },
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    return interaction.reply({ embeds: [await createUserInfoEmbed(interaction, interaction.targetUser)], ephemeral: false });
  },
);

async function createUserInfoEmbed(interaction: Interaction, user: User) {
  const member = await interaction.guild?.members.fetch(user.id).catch(() => undefined);
  const userFlags = user.flags?.toArray();
  const userFlagsEmojis = userFlags?.map(v => flagEmojis.get(v)).filter(Boolean);

  const badgeText = userFlagsEmojis ? userFlagsEmojis.map(v => v?.emoji ? `${formatEmoji(v.emoji)} ${v.name}` : '').join(', ') : 'Aucun';

  const nitroSince = member?.premiumSince ? `Depuis ${time(member.premiumSince, 'D')} (${time(member.premiumSince, 'R')})` : 'Aucun';
  const permissions = member?.permissions?.toArray().join(', ') || 'Aucune permission';
  const oldTag = user.discriminator !== '0' ? `Ancien tag: ${user.username}#${user.discriminator}` : 'Pas d’ancien tag';
  
  const messageCount = 'Inconnu'; // Placeholder, needs custom message tracking implementation

  if (!(member instanceof GuildMember))
    return new EmbedBuilder()
      .setAuthor({ name: (!user.bot && user.discriminator === '0') ? `@${user.username}` : `${user.tag}` })
      .setTitle('Cet utilisateur n\'est pas sur ce serveur')
      .setDescription(`${formatEmoji(Emojis.White.id)} ID de l'utilisateur: ${inlineCode(user.id)}`)
      .setColor('#2b2d31')
      .setImage('https://i.imgur.com/cLTmNpo.png')
      .setFields(
        { name: 'Date de création du compte', value: time(user.createdAt, 'D') },
        { name: 'Badge', value: badgeText },
        { name: 'Abonnement Nitro', value: nitroSince },
        { name: 'Ancien Tag', value: oldTag },
        { name: 'Nombre de messages', value: messageCount }
      );

  const nickName = member.nickname ?? 'Aucun';
  const joinTime = member.joinedAt ? time(member.joinedAt, 'D') : 'Erreur';

  const embed = new EmbedBuilder()
    .setAuthor({ name: (!user.bot && user.discriminator === '0') ? `@${user.username}` : `${user.tag}` })
    .setDescription([
      `${formatEmoji(Emojis.White.nickName)} Pseudo ${bold(nickName)}`,
      `${formatEmoji(Emojis.White.id)} ID de l'utilisateur ${inlineCode(user.id)}`,
    ].join('\n'))
    .setColor('#2b2d31')
    .setImage('https://i.imgur.com/cLTmNpo.png')
    .setFields(
      { name: 'Date de création du compte', value: time(user.createdAt, 'D') },
      { name: 'Date d\'arrivée sur le serveur', value: joinTime },
      { name: 'Badge', value: badgeText },
      { name: 'Abonnement Nitro', value: nitroSince },
      { name: 'Permissions', value: permissions },
      { name: 'Ancien Tag', value: oldTag },
      { name: 'Nombre de messages', value: messageCount }
    );

  if (member.premiumSince)
    embed.addFields({
      name: `${formatEmoji(Emojis.White.boost)} BOOST SERVEUR`,
      value: `Date de début du boost: ${time(member.premiumSince, 'D')} (${time(member.premiumSince, 'R')})`,
    });

  if (member.isCommunicationDisabled() && interaction.inCachedGuild() && interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers))
    embed.addFields({
      name: `${formatEmoji(Emojis.White.timeOut)} Heure de levée du timeout`,
      value: `${time(member.communicationDisabledUntil, 'D')} (${time(member.communicationDisabledUntil, 'R')})`,
    });

  return embed;
}

module.exports = [Command, Context];