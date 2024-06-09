import { Colors, EmbedBuilder, inlineCode, PermissionFlagsBits, version } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';
import { checkPermission } from '../../module/functions';
import Config from '../../../config.json';

const statusCommand = new ChatInput(
  {
    name: 'status',
    description: '👷 Afficher le statut du bot',
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    dmPermission: false,
  },
  { guildId: Config.admin.guild },
  async (interaction) => {

    await checkPermission(interaction);
    if (interaction.replied) return;

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`Statut ${interaction.client.user.username}`)
          .setDescription([
            `\`🌐\` **Ping**: ${inlineCode(`${interaction.client.ws.ping}`)}`,
            `\`💾\` **Utilisation de la mémoire**: ${inlineCode((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2))}MB`,
            `\`💽\` **Discord.js**: ${inlineCode(version)}`,
            `\`💻\` **Plateforme**: ${inlineCode(process.platform)}`,
            `\`📡\` **Nombre d'installations**: ${inlineCode(`${interaction.client.guilds.cache.size}`)} Serveurs`,
            `\`👥\` **Nombre total de membres**: ${inlineCode(`${interaction.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}`)} Membres`,
          ].join('\n'))
          .setThumbnail(interaction.client.user.displayAvatarURL())
          .setColor(Colors.Blurple),
      ],
      ephemeral: true,
    });

  },
);

module.exports = [statusCommand];