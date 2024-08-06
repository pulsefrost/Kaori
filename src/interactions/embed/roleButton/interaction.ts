import { SelectMenu, SelectMenuType } from '@akki256/discord-interaction';
import { Colors, EmbedBuilder, MessageFlags } from 'discord.js';

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

    // Supprimer les rôles non sélectionnés
    let error = false;
    await roles.remove(allOptions.filter(opt => !newRoles.includes(opt))).catch(() => error = true);
    // Ajouter les nouveaux rôles
    await roles.add(newRoles).catch(() => error = true);

    if (error)
      return interaction.followUp({
        embeds: [new EmbedBuilder().setDescription('`❌` Certains rôles n\'ont pas pu être ajoutés ou supprimés.').setColor(Colors.Red)],
        ephemeral: true,
      });

    // Rôles après la mise à jour
    const updatedRoles = interaction.member.roles.cache;

    // Rôles ajoutés et supprimés
    const addedRoles = newRoles.filter(role => !oldRoles.includes(role));
    const removedRoles = oldRoles.filter(role => !newRoles.includes(role));

    let description = '`✅` Les rôles ont été mis à jour !\n\n';

    if (addedRoles.length) {
      description += '**Rôles ajoutés:**\n';
      addedRoles.forEach(roleId => {
        const role = updatedRoles.get(roleId);
        if (role) description += `• <@&${role.id}>\n`;
      });
    }

    if (removedRoles.length) {
      description += '**Rôles supprimés:**\n';
      removedRoles.forEach(roleId => {
        const role = updatedRoles.get(roleId);
        if (role) description += `• <@&${role.id}>\n`;
      });
    }

    await interaction.followUp({
      embeds: [new EmbedBuilder().setDescription(description).setColor(Colors.Green)],
      ephemeral: true,
    });

    setTimeout(() => interaction.deleteReply(), 3_000);
  },
);

module.exports = [roleSelect];