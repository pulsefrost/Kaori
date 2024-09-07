import { Button, Modal } from '@akki256/discord-interaction';
import { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonComponent, ButtonStyle, ComponentType, ModalBuilder, PermissionFlagsBits, TextInputBuilder, TextInputStyle } from 'discord.js';
import { isURL } from '../../../module/functions';

const sendLinkButton = new Button(
  { customId: 'kaori:embedMaker-linkButton-send' },
  (interaction) => {
    interaction.showModal(
      new ModalBuilder()
        .setCustomId('kaori:embedMaker-linkButton-sendModal')
        .setTitle('Créer un bouton')
        .setComponents(
          new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
              .setCustomId('url')
              .setLabel('URL')
              .setStyle(TextInputStyle.Short),
          ),
          new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
              .setCustomId('label')
              .setLabel('Texte du bouton')
              .setMaxLength(80)
              .setStyle(TextInputStyle.Short)
              .setRequired(false),
          ),
          new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
              .setCustomId('emojiNameOrId')
              .setLabel('Emoji Unicode ou Emoji personnalisé')
              .setPlaceholder('Un seul caractère ou Nom/ID de l\'emoji personnalisé')
              .setMaxLength(32)
              .setStyle(TextInputStyle.Short)
              .setRequired(false),
          ),
        ),
    );
  },
);

const sendLinkButtonModal = new Modal(
  { customId: 'kaori:embedMaker-linkButton-sendModal' },
  async (interaction) => {
    // Création du bouton
    if (!interaction.isFromMessage() || !interaction.inCachedGuild() || interaction.message.components[0].components[0].type !== ComponentType.Button || !interaction.channel) return;

    const emojiRegex = new RegExp(/\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu);
    const label = interaction.fields.getTextInputValue('label');
    const url = interaction.fields.getTextInputValue('url');
    const emojiNameOrId = interaction.fields.getTextInputValue('emojiNameOrId');
    const emoji = interaction.guild.emojis.cache.find(v => v.name === emojiNameOrId)?.id || emojiNameOrId.match(emojiRegex)?.[0];

    if (!label && !emoji)
      return interaction.reply({ content: '`❌` Vous devez spécifier le texte du bouton ou l\'emoji.', ephemeral: true });
    if (!isURL(url))
      return interaction.reply({ content: '`❌` Veuillez saisir une URL commençant par `http://` ou `https://`.', ephemeral: true });

    const button = new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setURL(url);

    if (emoji) button.setEmoji(emoji);
    if (label) button.setLabel(label);

    // Modification du message
    if (!interaction.guild.members.me?.permissions.has(PermissionFlagsBits.ManageWebhooks))
      return interaction.reply({ content: '`❌` Pour utiliser cette fonctionnalité, vous devez accorder au BOT la permission de `Gérer les webhooks`.', ephemeral: true });

    const targetId = interaction.message.embeds[0].footer?.text.match(/[0-9]{18,19}/)?.[0];
    const targetMessage = await (await interaction.channel.fetch()).messages.fetch(targetId!).catch(() => undefined);

    if (!targetMessage)
      return interaction.reply({ content: '`❌` Un problème est survenu lors de la récupération du message.', ephemeral: true });

    const webhook = await targetMessage.fetchWebhook().catch(() => null);
    if (!webhook || interaction.client.user.id !== webhook.owner?.id)
      return interaction.reply({ content: '`❌` Vous ne pouvez pas mettre à jour ce message.', ephemeral: true });
    if (targetMessage.components[4]?.components?.length === 5)
      return interaction.reply({ content: '`❌` Vous ne pouvez pas ajouter plus de composants!', ephemeral: true });
    if (targetMessage.components[0]?.components[0]?.type === ComponentType.StringSelect)
      return interaction.reply({ content: '`❌` Vous ne pouvez pas ajouter à la fois un menu de sélection et des boutons dans le même message.', ephemeral: true });

    const updatedComponents = targetMessage.components.map(v => ActionRowBuilder.from<ButtonBuilder>(v as ActionRow<ButtonComponent>));
    const lastActionRow = updatedComponents.slice(-1)[0];

    if (!lastActionRow || lastActionRow.components.length === 5)
      updatedComponents.push(new ActionRowBuilder<ButtonBuilder>().setComponents(button));
    else
      updatedComponents.splice(updatedComponents.length - 1, 1, ActionRowBuilder.from<ButtonBuilder>(lastActionRow).addComponents(button));

    const embeds = interaction.message.embeds;
    const components = interaction.message.components;
    await interaction.update({ content: '`⌛` Ajout de composants en cours...', embeds: [], components: [] });

    await webhook.edit({ channel: interaction.channelId });
    webhook.editMessage(targetMessage, { components: updatedComponents })
      .then(() => interaction.editReply({ content: '`✅` Composant ajouté avec succès!', embeds, components }))
      .catch(() => interaction.editReply({ content: '`❌` Un problème est survenu lors de la mise à jour des composants.', embeds, components }));
  },
);

module.exports = [sendLinkButton, sendLinkButtonModal];
