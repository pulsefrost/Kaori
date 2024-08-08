import { ApplicationCommandOptionType, Colors, EmbedBuilder, PermissionFlagsBits, codeBlock } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';
import ServerSettings from '../schemas/ServerSettings';

const configCommand = new ChatInput(
  {
    name: 'config',
    description: 'Configure le salon et le contenu de l\'embed pour les statistiques du serveur',
    options: [
      {
        name: 'channel',
        description: 'Salon où les statistiques seront envoyées',
        type: ApplicationCommandOptionType.Channel,
        required: true,
      },
      {
        name: 'message',
        description: 'Message personnalisé à inclure dans l\'embed',
        type: ApplicationCommandOptionType.String,
        required: false,
      },
      {
        name: 'include_members',
        description: 'Inclure le nombre total de membres',
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
      {
        name: 'include_online',
        description: 'Inclure le nombre de membres en ligne',
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
      {
        name: 'include_offline',
        description: 'Inclure le nombre de membres hors ligne',
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
      {
        name: 'include_invitations',
        description: 'Inclure le nombre d\'invitations envoyées par le créateur du lien',
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
      {
        name: 'include_invites_weekly',
        description: 'Inclure le nombre d\'invitations envoyées cette semaine',
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
      {
        name: 'include_invites_monthly',
        description: 'Inclure le nombre d\'invitations envoyées ce mois-ci',
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
    ],
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    dmPermission: false,
  },
  { coolTime: 5000 },
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    const channel = interaction.options.getChannel('channel');
    const customMessage = interaction.options.getString('message') || 'Voici les statistiques du serveur :';

    if (!channel || channel.type !== 'GUILD_TEXT') {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('`❌` Le salon spécifié est invalide ou non-texte.')
            .setColor(Colors.Red),
        ],
        ephemeral: true,
      });
    }

    const includeMembers = interaction.options.getBoolean('include_members') ?? true;
    const includeOnline = interaction.options.getBoolean('include_online');
    const includeOffline = interaction.options.getBoolean('include_offline');
    const includeInvitations = interaction.options.getBoolean('include_invitations');
    const includeInvitesWeekly = interaction.options.getBoolean('include_invites_weekly');
    const includeInvitesMonthly = interaction.options.getBoolean('include_invites_monthly');

    try {
      await ServerSettings.updateOne(
        { serverId: interaction.guildId },
        { $set: { 
            statsChannelId: channel.id,
            statsMessage: customMessage,
            includeMembers,
            includeOnline,
            includeOffline,
            includeInvitations,
            includeInvitesWeekly,
            includeInvitesMonthly
          } },
        { upsert: true }
      );

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`✅\` Le salon pour les statistiques a été configuré avec succès. Les statistiques seront envoyées dans ${channel}.`)
            .setColor(Colors.Green),
        ],
        ephemeral: true,
      });

    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`❌\` Échec de la configuration du salon.\n${codeBlock(errorMessage)}`)
            .setColor(Colors.Red),
        ],
        ephemeral: true,
      });
    }
  },
);

module.exports = [configCommand];
