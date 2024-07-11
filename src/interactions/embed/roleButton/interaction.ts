import { Button } from '@akki256/discord-interaction';
import { codeBlock, Colors, EmbedBuilder, roleMention } from 'discord.js';

const button = new Button(
  { customId: /^kaori:roleButton-[0-9]{18,19}/ },
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    const roleId = interaction.customId.replace('kaori:roleButton-', '');
    const roles = interaction.member.roles;

    try {
      if (roles.cache.has(roleId)) {
        await roles.remove(roleId);
        await interaction.reply({
          embeds: [new EmbedBuilder().setDescription(`\`✅\` Suppression du rôle réussie : ${roleMention(roleId)}.`).setColor(Colors.Green)],
          ephemeral: true,
        });
        console.log(`Rôle retiré : ${roleMention(roleId)}`);
      } else {
        await roles.add(roleId);
        await interaction.reply({
          embeds: [new EmbedBuilder().setDescription(`\`✅\` Ajout du rôle réussi : ${roleMention(roleId)}.`).setColor(Colors.Green)],
          ephemeral: true,
        });
        console.log(`Rôle ajouté : ${roleMention(roleId)}`);
      }
      setTimeout(() => interaction.deleteReply(), 3000);
    } catch (error) {
      interaction.reply({
        embeds: [new EmbedBuilder().setDescription(`\`❌\` Échec de l'opération.\n${codeBlock(error)}`).setColor(Colors.Red)],
        ephemeral: true,
      });
    }
  },
);

module.exports = [button];
