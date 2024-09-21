import { ApplicationCommandOptionType, Colors, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';
import BumpReminder from '../schemas/BumpReminder'; // Mise à jour du schéma importé
import { setTimeout } from 'timers/promises';

const bumpCommand = new ChatInput(
  {
    name: 'bump',
    description: 'Configure le rappel pour bump le bot Disboard toutes les deux heures',
    options: [
      {
        name: 'channel',
        description: 'Le salon dans lequel envoyer les rappels',
        type: ApplicationCommandOptionType.Channel,
        required: true,
      },
      {
        name: 'role',
        description: 'Le rôle à mentionner lors du rappel',
        type: ApplicationCommandOptionType.Role,
        required: true,
      },
    ],
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    dmPermission: false,
  },
  { coolTime: 5000 },
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    const channel = interaction.options.getChannel('channel');
    const role = interaction.options.getRole('role');

    if (!channel || !role) {
      return interaction.reply({
        content: 'Salon ou rôle non valide.',
        ephemeral: true,
      });
    }

    try {
      // Mettre à jour la base de données pour enregistrer le salon et le rôle
      await BumpReminder.updateOne(
        { serverId: interaction.guildId },
        { $set: { bumpChannel: channel.id, bumpRole: role.id } },
        { upsert: true }
      );

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`✅\` Rappels de bump configurés dans ${channel} pour le rôle ${role}.`)
            .setColor(Colors.Green),
        ],
        ephemeral: true,
      });
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`\`❌\` Échec de la configuration du rappel.\n${errorMessage}`)
            .setColor(Colors.Red),
        ],
        ephemeral: true,
      });
    }
  },
);

module.exports = [bumpCommand];