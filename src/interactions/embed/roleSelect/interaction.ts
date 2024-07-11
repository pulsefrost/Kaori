import { SelectMenu, SelectMenuType } from '@akki256/discord-interaction';
import { Colors, EmbedBuilder, MessageFlags, roleMention, codeBlock } from 'discord.js';

const roleSelect = new SelectMenu(
  { customId: /^kaori:roleSelectMenu(-[1-5])?$|^reactionRole$/, type: SelectMenuType.String },
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;
    if (interaction.message.flags.has(MessageFlags.Ephemeral)) return interaction.update({});

    await interaction.deferReply({ ephemeral: true });

    const roles = interaction.member.roles;
    const allOptions = interaction.component.options.map(opt => opt.value);
    const newRoles = interaction.values;

    let error = false;

    // Rôles supprimés et ajoutés
    const removedRoles = allOptions.filter(opt => !newRoles.includes(opt));
    const addedRoles = newRoles.filter(role => !roles.cache.has(role));

    try {
      await roles.remove(removedRoles);
      removedRoles.forEach(roleId => {
        interaction.followUp({
          embeds: [new EmbedBuilder().setDescription(`\`✅\` Suppression du rôle réussie : ${roleMention(roleId)}.`).setColor(Colors.Green)],
          ephemeral: true,
        });
        console.log(`Rôle retiré : ${roleMention(roleId)}`);
      });

      await roles.add(addedRoles);
      addedRoles.forEach(roleId => {
        interaction.followUp({
          embeds: [new EmbedBuilder().setDescription(`\`✅\` Ajout du rôle réussi : ${roleMention(roleId)}.`).setColor(Colors.Green)],
          ephemeral: true,
        });
        console.log(`Rôle ajouté : ${roleMention(roleId)}`);
      });

      setTimeout(() => interaction.deleteReply(), 3000);
    } catch (error) {
      interaction.followUp({
        embeds: [new EmbedBuilder().setDescription(`\`❌\` Échec de l'opération.\n${codeBlock(error)}`).setColor(Colors.Red)],
        ephemeral: true,
      });
    }
  },
);

module.exports = [roleSelect];
