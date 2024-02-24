import { Button } from '@akki256/discord-interaction';
import { codeBlock, Colors, EmbedBuilder, roleMention } from 'discord.js';

const button = new Button(
  { customId: /^kaori:roleButton-[0-9]{18,19}/ },
  (interaction) => {
    if (!interaction.inCachedGuild()) return;

    const roleId = interaction.customId.replace('kaori:roleButton-', '');
    const roles = interaction.member.roles;

    if (roles.cache.has(roleId))
      roles.remove(roleId)
        .then(async () => {
          await interaction.reply({
            embeds: [new EmbedBuilder().setDescription(`\`✅\` Suppression du rôle réussie : ${roleMention(roleId)}.`).setColor(Colors.Green)],
            ephemeral: true,
          });
          setTimeout(() => interaction.deleteReply(), 3_000);
        })
        .catch((e) => {
          interaction.reply({
            embeds: [new EmbedBuilder().setDescription(`\`❌\` Échec de la suppression du rôle.\n${codeBlock(e)}`).setColor(Colors.Red)],
            ephemeral: true,
          });
        });

    else
      roles.add(roleId)
        .then(async () => {
          await interaction.reply({
            embeds: [new EmbedBuilder().setDescription(`\`✅\` Ajout du rôle réussi : ${roleMention(roleId)}.`).setColor(Colors.Green)],
            ephemeral: true,
          });
          setTimeout(() => interaction.deleteReply(), 3_000);
        })
        .catch((e) => {
          interaction.reply({
            embeds: [new EmbedBuilder().setDescription(`\`❌\` Échec de l'ajout du rôle.\n${codeBlock(e)}`).setColor(Colors.Red)],
            ephemeral: true,
          });
        });
  },
);

module.exports = [button];
