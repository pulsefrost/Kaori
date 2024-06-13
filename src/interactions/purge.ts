import { ApplicationCommandOptionType, PermissionFlagsBits, codeBlock, Colors, EmbedBuilder, Message } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';

const purgeCommand = new ChatInput(
  {
    name: 'purge',
    description: 'Supprime les messages dans le canal actuel',
    options: [
      {
        name: 'amount',
        description: 'Nombre de messages à supprimer (entre 1 et 100)',
        type: ApplicationCommandOptionType.Integer,
        required: true,
      },
      {
        name: 'user',
        description: 'Utilisateur dont les messages seront supprimés',
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
    defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
    dmPermission: false,
  },
  { coolTime: 5000 },
  async (interaction) => {
    if (!interaction.inCachedGuild() || !interaction.channel) return;

    const amount = interaction.options.getInteger('amount');
    const user = interaction.options.getUser('user');

    if (amount === null || amount < 1 || amount > 100) {
      return interaction.reply({ content: '`❌` Veuillez spécifier un nombre entre 1 et 100.', ephemeral: true });
    }

    try {
      let fetched: Message[] | undefined;

      const messages = await interaction.channel.messages.fetch({ limit: amount });
      if (user) {
        fetched = messages.filter(m => m.author.id === user.id).array();
      } else {
        fetched = Array.from(messages.values());
      }

      if (!fetched || fetched.length === 0) {
        return interaction.reply({ content: '`❌` Aucun message trouvé à supprimer.', ephemeral: true });
      }

      await interaction.channel.bulkDelete(fetched);

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`✅\` ${fetched.length} messages ont été supprimés.`)
            .setColor(Colors.Green),
        ],
        ephemeral: true,
      });
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`❌\` Échec de la suppression des messages.\n${codeBlock(errorMessage)}`)
            .setColor(Colors.Red),
        ],
        ephemeral: true,
      });
    }
  }
);

module.exports = [purgeCommand];