import { ChatInput } from '@akki256/discord-interaction';
import { ApplicationCommandOptionType, codeBlock, Colors, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

const setRateLimitCommand = new ChatInput(
  {
    name: 'ratelimit',
    description: 'Définit le mode lent de ce canal',
    options: [
      {
        name: 'duration',
        description: 'Durée en secondes',
        minValue: 0,
        maxValue: 21600,
        type: ApplicationCommandOptionType.Integer,
        required: true,
      },
    ],
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
  },
  { coolTime: 5_000 },
  async (interaction) => {

    if (!interaction.inCachedGuild() || !interaction.channel) return;
    const duration = interaction.options.getInteger('duration', true);

    if (!interaction.appPermissions?.has(PermissionFlagsBits.ManageChannels))
      return interaction.reply({ content: '`❌` Insuffisance de permissions du bot, impossible de modifier le mode lent.', ephemeral: true });

    interaction.channel.setRateLimitPerUser(duration, `/ratelimit par ${interaction.user.tag}`)
      .then(() => interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`✅\` Mode lent du canal défini à \`${duration} secondes\`.`)
            .setColor(Colors.Green),
        ],
        ephemeral: true,
      }))
      .catch((err) => interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`❌\` Échec de la configuration du mode lent.\n${codeBlock(err)}`)
            .setColor(Colors.Red),
        ],
        ephemeral: true,
      }));

  },
);

module.exports = [setRateLimitCommand];
