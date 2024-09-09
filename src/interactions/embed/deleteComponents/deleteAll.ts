import { Button } from '@akki256/discord-interaction';
import { PermissionFlagsBits } from 'discord.js';

const button = new Button(
  { customId: 'kaori:manageComponents-deleteAll' },
  async (interaction) => {
    if (!interaction.inCachedGuild() || !interaction.channel) return;

    if (!interaction.guild.members.me?.permissions.has(PermissionFlagsBits.ManageWebhooks))
      return interaction.reply({ content: '`❌` Pour utiliser cette fonctionnalité, le BOT doit avoir la permission `Gérer les webhooks`.', ephemeral: true });

    const targetId = interaction.message.embeds[0].footer?.text.match(/[0-9]{18,19}/)?.[0];
    const targetMessage = await (await interaction.channel.fetch()).messages.fetch(targetId!).catch(() => undefined);

    if (!targetMessage)
      return interaction.reply({ content: '`❌` Un problème est survenu lors de la récupération du message.', ephemeral: true });

    const webhook = await targetMessage.fetchWebhook().catch(() => null);
    if (!webhook || interaction.client.user.id !== webhook.owner?.id)
      return interaction.reply({ content: '`❌` Ce message ne peut pas être mis à jour.', ephemeral: true });

    await interaction.update({ content: '`⌛` Suppression des composants en cours...', embeds: [], components: [] });

    webhook
      .editMessage(targetMessage, { components: [] })
      .then(() => interaction.editReply('`✅` Composants supprimés avec succès.'))
      .catch(() => interaction.editReply('`❌` Échec de la suppression des composants.'));
  },
);

module.exports = [button];
