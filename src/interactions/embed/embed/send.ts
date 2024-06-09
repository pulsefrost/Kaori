import { PermissionFlagsBits, User } from 'discord.js';
import { Button } from '@akki256/discord-interaction';

const sendEmbedButton = new Button(
  { customId: 'kaori:embedMaker-send' },
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;
    if (!interaction.guild.members.me?.permissions.has(PermissionFlagsBits.ManageWebhooks))
      return interaction.reply({ content: '`❌` Pour utiliser cette fonctionnalité, le BOT doit avoir la permission `Gérer les webhooks`.', ephemeral: true });

    const embeds = interaction.message.embeds;
    const components = interaction.message.components;
    await interaction.update({ content: '`⌛` Envoi de l\'incorporation en cours...', embeds: [], components: [] });

    const webhook = await (await interaction.guild.fetchWebhooks()).find(v => interaction.client.user.equals(v.owner as User))?.edit({ channel: interaction.channelId })
      || await interaction.guild.channels.createWebhook({ name: 'Kaori', avatar: interaction.client.user.displayAvatarURL(), channel: interaction.channelId });

    webhook
      .send({ embeds })
      .then(() => interaction.editReply('`✅` L\'incorporation a été envoyée !\n(Vous pouvez modifier ou exporter l\'incorporation, ainsi que créer des boutons de rôle via `Application` → `Modifier l\'incorporation`)'))
      .catch(() => {
        interaction.editReply({ content: null, embeds, components });
        interaction.followUp({ content: '`❌` Échec de l\'envoi de l\'incorporation.', ephemeral: true });
      });
  },
);

module.exports = [sendEmbedButton];
