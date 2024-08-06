import { SelectMenu, SelectMenuType } from '@akki256/discord-interaction';
import { Colors, EmbedBuilder, MessageFlags, roleMention } from 'discord.js';

const roleSelect = new SelectMenu(
  { customId: /^kaori:roleSelectMenu(-[1-5])?$|^reactionRole$/, type: SelectMenuType.String },
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;
    if (interaction.message.flags.has(MessageFlags.Ephemeral)) return interaction.update({});

    await interaction.deferReply({ ephemeral: true });

    const roles = interaction.member.roles;
    const allOptions = interaction.component.options.map(opt => opt.value);
    const newRoles = interaction.values;

    // Rôles avant la mise à jour
    const oldRoles = allOptions.filter(opt => roles.cache.has(opt));

    let error = false;

    // Supprimer les rôles non sélectionnés
    const removedRoles = allOptions.filter(opt => !newRoles.includes(opt));
    await roles.remove(removedRoles).catch(() => error = true);

    // Ajouter les nouveaux rôles
    const addedRoles = newRoles.filter(role => !oldRoles.includes(role));
    await roles.add(addedRoles).catch(() => error = true);

    if (error) {
      return interaction.followUp({
        embeds: [new EmbedBuilder().setDescription('`❌` Certains rôles n\'ont pas pu être ajoutés ou supprimés.').setColor(Colors.Red)],
        ephemeral: true,
      });
    }

    let description = '`✅` Les rôles ont été mis à jour !\n\n';

    if (addedRoles.length) {
      description += '**Rôles ajoutés :**\n';
      addedRoles.forEach(roleId => {
        description += `• ${roleMention(roleId)}\n`;
      });
    }

    if (removedRoles.length) {
      description += '**Rôles supprimés :**\n';
      removedRoles.forEach(roleId => {
        description += `• ${roleMention(roleId)}\n`;
      });
    }

    await interaction.followUp({
      embeds: [new EmbedBuilder().setDescription(description).setColor(Colors.Green)],
      ephemeral: true,
    });

    setTimeout(() => interaction.deleteReply(), 3000);
  },
);

module.exports = [roleSelect];