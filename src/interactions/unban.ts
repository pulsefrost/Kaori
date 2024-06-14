import { ApplicationCommandOptionType, codeBlock, Colors, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';

const unbanCommand = new ChatInput(
  {
    name: 'unban',
    description: 'Débannir un utilisateur du serveur',
    options: [
      {
        name: 'utilisateur',
        description: 'ID de l\'utilisateur à débannir',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
    defaultMemberPermissions: PermissionFlagsBits.BanMembers,
    dmPermission: false,
  },
  { coolTime: 5000 },
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    const userId = interaction.options.getString('utilisateur');
    if (!userId) return; // Si userId est null, ne rien faire

    try {
      await interaction.guild.members.unban(userId);

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`✅\` L'utilisateur avec l'ID ${userId} a été débanni du serveur.`)
            .setColor(Colors.Green),
        ],
        ephemeral: true,
      });
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`❌\` Échec du débannissement de l'utilisateur avec l'ID ${userId}.\n${codeBlock(errorMessage)}`)
            .setColor(Colors.Red),
        ],
        ephemeral: true,
      });
    }
  },
);

export default unbanCommand;
