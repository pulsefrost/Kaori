import { ApplicationCommandOptionType, Permissions, codeBlock, Colors, EmbedBuilder } from 'discord.js';
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
    defaultMemberPermissions: Permissions.FLAGS.MANAGE_MESSAGES,
    dmPermission: false,
  },
  { coolTime: 5000 },
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    const amount = interaction.options.getInteger('amount');
    const user = interaction.options.getUser('user');

    if (amount < 1 || amount > 100) {
      return interaction.reply({ content: '`❌` Veuillez spécifier un nombre entre 1 et 100.', ephemeral: true });
    }

    try {
      let fetched;
      if (user) {
        // Suppression des messages d'un utilisateur spécifique
        fetched = await interaction.channel.messages.fetch({ limit: amount })
          .then(messages => messages.filter(m => m.author.id === user.id));
      } else {
        // Suppression de tous les messages dans le canal
        fetched = await interaction.channel.messages.fetch({ limit: amount });
      }

      await interaction.channel.bulkDelete(fetched);

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`✅\` ${fetched.size} messages ont été supprimés.`)
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
