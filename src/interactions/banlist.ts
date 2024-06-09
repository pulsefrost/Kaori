import { ApplicationCommandOptionType, codeBlock, Colors, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';

const banlistCommand = new ChatInput(
  {
    name: 'banlist',
    description: 'Liste les utilisateurs bannis du serveur',
    defaultMemberPermissions: PermissionFlagsBits.BanMembers,
    dmPermission: false,
  },
  { coolTime: 5000 },
  async (interaction) => {

    if (!interaction.inCachedGuild()) return;

    try {
      const banList = await interaction.guild.bans.fetch();
      if (banList.size === 0) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription('`✅` Aucun utilisateur banni.')
              .setColor(Colors.Green),
          ],
          ephemeral: true,
        });
      }

      const banListDescription = banList.map(ban => `- **${ban.user.tag}** (ID: ${ban.user.id})`).join('\n');
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Liste des utilisateurs bannis')
            .setDescription(banListDescription)
            .setColor(Colors.Red),
        ],
        ephemeral: true,
      });
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`❌\` Échec de la récupération de la liste des bannis.\n${codeBlock(errorMessage)}`)
            .setColor(Colors.Red),
        ],
        ephemeral: true,
      });
    }

  },
);

module.exports = [banlistCommand];
