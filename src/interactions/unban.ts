import { ApplicationCommandOptionType, codeBlock, Colors, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';

const unbanCommand = new ChatInput(
  {
    name: 'unban',
    description: 'Débannir un utilisateur du serveur',
    options: [
      {
        name: 'user_id',
        description: 'ID de l\'utilisateur',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: 'reason',
        description: 'Raison',
        type: ApplicationCommandOptionType.String,
      },
    ],
    defaultMemberPermissions: PermissionFlagsBits.BanMembers,
    dmPermission: false,
  },
  { coolTime: 5000 },
  async (interaction) => {

    if (!interaction.inCachedGuild()) return;

    const userId = interaction.options.getString('user_id');

    try {
      await interaction.guild.members.unban(userId, interaction.options.getString('reason') ?? 'Aucune raison fournie');
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`✅\` L'utilisateur avec l'ID \`${userId}\` a été débanni du serveur.`)
            .setColor(Colors.Green),
        ],
        ephemeral: true,
      });
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`❌\` Échec du déban.\n${codeBlock(errorMessage)}`)
            .setColor(Colors.Red),
        ],
        ephemeral: true,
      });
    }

  },
);

module.exports = [unbanCommand];
