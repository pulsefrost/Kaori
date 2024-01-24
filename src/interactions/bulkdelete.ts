import { ChatInput } from '@akki256/discord-interaction';
import { ApplicationCommandOptionType, codeBlock, Colors, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

const bulkDeleteMessagesCommand = new ChatInput(
  {
    name: 'bulkdelete',
    description: 'Supprime en bloc les messages envoyés dans ce canal, du plus récent au plus ancien (jusqu\'à 2 semaines)',
    options: [
      {
        name: 'messages',
        description: 'Nombre de messages à supprimer',
        maxValue: 100,
        minValue: 2,
        type: ApplicationCommandOptionType.Integer,
        required: true,
      },
    ],
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
  },
  { coolTime: 10_000 },
  async (interaction) => {

    if (!interaction.inCachedGuild() || !interaction.channel) return;

    if (!interaction.appPermissions?.has(PermissionFlagsBits.ManageMessages))
      return interaction.reply({ content: '`❌` Permissions insuffisantes pour le BOT. Impossible de supprimer les messages.', ephemeral: true });

    const bulkCount = interaction.options.getInteger('messages', true);

    interaction.channel.bulkDelete(bulkCount, true)
      .then((msgs) => interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`✅\` ${msgs.size} messages ont été supprimés.`)
            .setColor(Colors.Green),
        ],
        ephemeral: true,
      }))
      .catch((err) => interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`❌\` Échec de la suppression des messages.\n${codeBlock(err)}`)
            .setColor(Colors.Red),
        ],
        ephemeral: true,
      }));

  },
);

module.exports = [bulkDeleteMessagesCommand];
