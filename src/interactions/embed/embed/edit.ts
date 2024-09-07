import { Button } from '@akki256/discord-interaction';
import { PermissionFlagsBits } from 'discord.js';

const editEmbedButton = new Button(
  { customId: 'kaori:embedMaker-edit' },
  async (interaction) => {
    if (!interaction.inCachedGuild() || !interaction.channel) return;

    if (!interaction.guild.members.me?.permissions.has(PermissionFlagsBits.ManageWebhooks))
      return interaction.reply({ content: '`❌` Vous devez accorder à votre BOT l\'autorisation `Gérer les webhooks` pour utiliser cette fonctionnalité.', ephemeral: true });

    const targetId = interaction.message.content.match(/[0-9]{18,19}/)?.[0];
    const targetMessage = await (await interaction.channel.fetch()).messages.fetch(targetId || '').catch(() => undefined);
    if (!targetMessage)
      return interaction.reply({ content: '`❌` Un problème est survenu lors de la récupération du message.', ephemeral: true });

    const webhook = await targetMessage.fetchWebhook().catch(() => null);
    if (!webhook || interaction.client.user.id !== webhook.owner?.id)
      return interaction.reply({ content: '`❌` Vous ne pouvez pas modifier ce message.', ephemeral: true });

    const embeds = interaction.message.embeds;
    const components = interaction.message.components;
    await interaction.update({ content: '`⌛` Édition de l\'intégration en cours...', embeds: [], components: [] });
    await webhook.edit({ channel: interaction.channelId });

    webhook
      .editMessage(targetMessage, { embeds })
      .then(() => interaction.editReply('`✅` Intégration éditée avec succès !'))
      .catch(() => {
        interaction.editReply({ content: null, embeds, components });
        interaction.followUp({ content: '`❌` Échec de l\'édition de l\'intégration.', ephemeral: true });
      });
  },
);

module.exports = [editEmbedButton];
