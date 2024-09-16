import { ApplicationCommandOptionType, EmbedBuilder, Colors, PermissionFlagsBits } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';

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
    const timeoutMembers = members.filter(member => {
      const timeoutEnd = member.communicationDisabledUntilTimestamp;
      return timeoutEnd && timeoutEnd > Date.now(); // Garder uniquement ceux dont le timeout est encore actif
    });

    if (timeoutMembers.size === 0) {
      return interaction.reply({
        content: 'Aucun membre n\'est actuellement en timeout.',
        ephemeral: true,
      });
    }

    const timeoutInfo = timeoutMembers.map(member => {
      const timeoutEnd = member.communicationDisabledUntilTimestamp!;
      const unixTimestamp = Math.floor(timeoutEnd / 1000); // Convertir en timestamp Unix

      return `${member.user.tag} - Fin du timeout : <t:${unixTimestamp}:R>`; // Affiche la date relative en format Discord
    }).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('Liste des membres en timeout')
      .setDescription(timeoutInfo)
      .setColor(Colors.Orange);

    interaction.reply({ embeds: [embed], ephemeral: false });
  },
);

module.exports = [timeoutListCommand];
