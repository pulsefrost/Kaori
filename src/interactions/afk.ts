import { ApplicationCommandOptionType, codeBlock, Colors, EmbedBuilder, PermissionFlagsBits, GuildMember } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';
import ServerSettings from '../schemas/ServerSettings'; // assurez-vous de bien importer votre modèle

const afkCommand = new ChatInput(
  {
    name: 'afk',
    description: 'Signale que vous êtes AFK',
    options: [
      {
        name: 'message',
        description: 'Message AFK personnalisé',
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
    defaultMemberPermissions: PermissionFlagsBits.SendMessages,
    dmPermission: false,
  },
  { coolTime: 5000 },
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    const userId = interaction.user.id;
    const afkMessage = interaction.options.getString('message') || 'Je suis actuellement AFK. Je répondrai dès que possible.';

    try {
      // Mettre à jour la base de données pour signaler l'AFK
      await ServerSettings.updateOne(
        { serverId: interaction.guildId },
        { $set: { [`afk.${userId}`]: afkMessage } },
        { upsert: true }
      );

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`✅\` Vous êtes maintenant AFK: ${afkMessage}`)
            .setColor(Colors.Green),
        ],
        ephemeral: true,
      });
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`❌\` Échec de la mise à jour du statut AFK.\n${codeBlock(errorMessage)}`)
            .setColor(Colors.Red),
        ],
        ephemeral: true,
      });
    }
  },
);

module.exports = [afkCommand];
