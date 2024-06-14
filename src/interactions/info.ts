import { ApplicationCommandOptionType, bold, Colors, EmbedBuilder, formatEmoji, GuildFeature, GuildMember, inlineCode, Interaction, PermissionFlagsBits, time, User } from 'discord.js';
import { ChatInput, UserContext } from '@akki256/discord-interaction';
import { Emojis } from '../module/constant';

const flagEmojis = new Map([
  ['Staff', '1251322333856010260'],
  ['Partner', '1251322713205772299'],
  ['CertifiedModerator', '1251322251702304808'],
  ['Hypesquad', '1251322395596292137'],
  ['HypeSquadOnlineHouse1', '1251322481390653541'],
  ['HypeSquadOnlineHouse2', '1251322506938290207'],
  ['HypeSquadOnlineHouse3', '1251322492228862085'],
  ['BugHunterLevel1', '1251321662872485929'],
  ['BugHunterLevel2', '1251321756350943385'],
  ['ActiveDeveloper', '1251321904657207338'],
  ['VerifiedDeveloper', '1251322246257971301'],
  ['PremiumEarlySupporter', '1251323760636854323'],
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