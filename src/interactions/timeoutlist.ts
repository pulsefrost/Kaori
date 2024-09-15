import { ApplicationCommandOptionType, EmbedBuilder, Colors, PermissionFlagsBits } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';
import ms from 'ms'; // Utilitaire pour formater la durée en millisecondes

const timeoutListCommand = new ChatInput(
  {
    name: 'timeoutlist',
    description: 'Affiche la liste des membres actuellement en timeout et la durée restante.',
    defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
    dmPermission: false,
  },
  { coolTime: 5000 },
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    const guild = interaction.guild;
    const members = await guild.members.fetch(); // Récupérer tous les membres du serveur
    const timeoutMembers = members.filter(member => member.communicationDisabledUntilTimestamp);

    if (timeoutMembers.size === 0) {
      return interaction.reply({
        content: 'Aucun membre n\'est actuellement en timeout.',
        ephemeral: true,
      });
    }

    const timeoutInfo = timeoutMembers.map(member => {
      const timeoutEnd = member.communicationDisabledUntilTimestamp!;
      const timeRemaining = timeoutEnd - Date.now();

      return `${member.user.tag} - Timeout restant : ${ms(timeRemaining)}`; // Suppression de l'option { long: true }
    }).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('Liste des membres en timeout')
      .setDescription(timeoutInfo)
      .setColor(Colors.Orange);

    interaction.reply({ embeds: [embed], ephemeral: false });
  },
);

module.exports = [timeoutListCommand];
