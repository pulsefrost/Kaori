import { ApplicationCommandOptionType, bold, Colors, EmbedBuilder, formatEmoji, GuildFeature, GuildMember, inlineCode, Interaction, PermissionFlagsBits, time, User } from 'discord.js';
import { ChatInput, UserContext } from '@akki256/discord-interaction';
import { Emojis } from '../module/constant';

const flagEmojis = new Map([
  ['Staff', '966753508739121222'],
  ['Partner', '966753508860768357'],
  ['CertifiedModerator', '959536411894243378'],
  ['Hypesquad', '966753508961439745'],
  ['HypeSquadOnlineHouse1', '966753508843978872'],
  ['HypeSquadOnlineHouse2', '966753508927889479'],
  ['HypeSquadOnlineHouse3', '966753508776890459'],
  ['BugHunterLevel1', '966753508848205925'],
  ['BugHunterLevel2', '966753508755898410'],
  ['ActiveDeveloper', '1040345950318768218'],
  ['VerifiedDeveloper', '966753508705583174'],
  ['PremiumEarlySupporter', '966753508751736892'],
]);

const featureTexts = new Map<string, string>([
  [GuildFeature.Partnered, `${formatEmoji('982512900432351262')} Discord Partner`],
  [GuildFeature.Verified, `${formatEmoji('982512902042955806')} Vérifié`],
  [GuildFeature.Discoverable, `${formatEmoji('1087358252691496960')} Serveur public`],
]);

const Command = new ChatInput(
  {
    name: 'info',
    description: 'Afficher les informations d\'un utilisateur/serveur',
    options: [
      {
        name: 'utilisateur',
        description: 'Afficher les informations d\'un utilisateur',
        options: [
          {
            name: 'utilisateur',
            description: 'Utilisateur',
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
        type: ApplicationCommandOptionType.Subcommand,
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

    if (subCommand === 'utilisateur')
      return interaction.reply({ embeds: [await createUserInfoEmbed(interaction, interaction.options.getUser('utilisateur', true))], ephemeral: true });

    if (subCommand === 'serveur')
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(interaction.guild.name)
            .setDescription([
              `${formatEmoji(Emojis.White.id)} ID du serveur: \`${interaction.guildId}\``,
              `${formatEmoji(Emojis.White.nickName)} Propriétaire: ${await interaction.guild.fetchOwner()}`,
              `${formatEmoji(Emojis.White.nickName)} Nombre de membres: \`${interaction.guild.memberCount}\` personnes`,
              `${formatEmoji(Emojis.White.channel)} Nombre de canaux: \`${interaction.guild.channels.channelCountWithoutThreads}\``,
              `${formatEmoji(Emojis.White.schedule)} Date de création: ${time(interaction.guild.createdAt, 'D')}`,
              `${formatEmoji(Emojis.White.boost)} Nombre de boosts: \`${interaction.guild.premiumSubscriptionCount}\``,
            ].join('\n'))
            .setColor(Colors.White)
            .setThumbnail(interaction.guild.iconURL())
            .setFields(
              { name: 'Statut', value: interaction.guild.features.map(v => featureTexts.get(v)).filter(Boolean).join('\n') || 'Aucun' },
              {
                name: `Rôles (${interaction.guild.roles.cache.size})`,
                value: interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)
                  ? interaction.guild.roles.cache
                    .filter(role => role.name !== '@everyone')
                    .sort((before, after) => before.position > after.position ? -1 : 1)
                    ?.map(role => role?.toString())?.join(' ') || 'Aucun'
                  : '🔒 Vous devez avoir la permission `Gérer les rôles`',
              },
            ),
        ],
        ephemeral: true,
      });
  },
);

const Context = new UserContext(
  {
    name: 'Informations utilisateur',
    dmPermission: false,
  },
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    return interaction.reply({ embeds: [await createUserInfoEmbed(interaction, interaction.targetUser)], ephemeral: true });
  },
);

async function createUserInfoEmbed(interaction: Interaction, user: User) {
  const member = await interaction.guild?.members.fetch(user.id).catch(() => undefined);

  const userFlags = user.flags?.toArray();
  const userFlagsEmojis = userFlags?.map(v => flagEmojis.get(v)).filter(Boolean);

  if (!(member instanceof GuildMember))
    return new EmbedBuilder()
      .setAuthor({ name: (!user.bot && user.discriminator === '0') ? `@${user.username}` : `${user.tag}` })
      .setTitle('Cet utilisateur n\'est pas sur ce serveur')
      .setDescription(`${formatEmoji(Emojis.White.id)} ID de l'utilisateur: ${inlineCode(user.id)}`)
      .setColor(Colors.DarkerGrey)
      .setThumbnail(user.displayAvatarURL())
      .setFields(
        { name: 'Date de création du compte', value: time(user.createdAt, 'D'), inline: true },
        { name: 'Badge', value: userFlagsEmojis ? userFlagsEmojis.map(v => formatEmoji(v || '0')).join('') : 'Aucun', inline: true },
      );

  const nickName = member.nickname ?? 'Aucun';
  const joinTime = member.joinedAt ? time(member.joinedAt, 'D') : 'Erreur';
  const roles = member.roles.cache
    .filter(role => role.name !== '@everyone')
    .sort((before, after) => before.position > after.position ? -1 : 1)
    ?.map(role => role?.toString())?.join(' ') || 'Aucun';

  const embed = new EmbedBuilder()
    .setAuthor({ name: (!user.bot && user.discriminator === '0') ? `@${user.username}` : `${user.tag}` })
    .setDescription([
      `${formatEmoji(Emojis.White.nickName)} Pseudo ${bold(nickName)}`,
      `${formatEmoji(Emojis.White.id)} ID de l'utilisateur ${inlineCode(user.id)}`,
    ].join('\n'))
    .setColor(member.roles.highest.color || Colors.White)
    .setThumbnail(user.displayAvatarURL())
    .setFields(
      { name: 'Date de création du compte', value: time(user.createdAt, 'D'), inline: true },
      { name: 'Date d\'arrivée sur le serveur', value: joinTime, inline: true },
      { name: 'Badge', value: userFlagsEmojis?.length ? userFlagsEmojis.map(v => formatEmoji(v || '0')).join('') : 'Aucun', inline: true },
      { name: 'Rôles', value: roles },
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

  if (user.displayAvatarURL() !== user.displayAvatarURL()) {
    embed.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() });
    embed.setThumbnail(member.displayAvatarURL());
  }

  return embed;
}

module.exports = [Command, Context];