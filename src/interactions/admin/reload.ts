import { Colors, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';
import { checkPermission } from '../../module/functions';
import Config from '../../../config.json';

const reloadCommand = new ChatInput(
  {
    name: 'reload',
    description: '👷 Redémarrer le bot',
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    dmPermission: false,
  },
  { guildId: Config.admin.guild },
  async (interaction) => {

    await checkPermission(interaction);
    if (interaction.replied) return;

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription('`🔌` Redémarrage en cours...')
          .setColor(Colors.Green),
      ],
      ephemeral: true,
    });

    process.exit();

  },
);

module.exports = [reloadCommand];