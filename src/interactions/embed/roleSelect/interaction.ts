import { SelectMenu, SelectMenuType } from '@akki256/discord-interaction';
import { Colors, EmbedBuilder, MessageFlags, roleMention } from 'discord.js';

const roleSelect = new SelectMenu(
  { customId: /^kaori:roleSelectMenu(-[1-5])?$|^reactionRole$/, type: SelectMenuType.String },
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;
    if (interaction.message.flags.has(MessageFlags.Ephemeral)) return interaction.update({});

    await interaction.deferReply({ ephemeral: true });

    const roles = interaction.member.roles;
    let error = false;

    try {
      await roles.remove(interaction.component.options.map(opt => opt.value).filter(opt => !interaction.values.includes(opt)));
      await roles.add(interaction.values);
    } catch (e) {
      error = true;
    }

    if (error) {
      await interaction.followUp({
        embeds: [new EmbedBuilder().setDescription('`❌` Certains rôles n\'ont pas pu être ajoutés ou supprimés.').setColor(Colors.Red)],
        ephemeral: true,
      });
    } else {
      await interaction.followUp({
        embeds: [new EmbedBuilder().setDescription('`✅` Les rôles ont été mis à jour !').setColor(Colors.Green)],
        ephemeral: true,
      });

      // Log des rôles ajoutés
      interaction.values.forEach(roleId => {
        console.log(`Rôle ajouté : ${roleMention(roleId)}`);
      });

      // Log des rôles retirés
      interaction.component.options.forEach(option => {
        if (!interaction.values.includes(option.value)) {
          console.log(`Rôle retiré : ${roleMention(option.value)}`);
        }
      });
    }

    setTimeout(() => interaction.deleteReply(), 3000);
  },
);

module.exports = [roleSelect];
