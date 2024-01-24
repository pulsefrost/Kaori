import { ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { Button, Modal } from '@akki256/discord-interaction';
import { isURL } from '../../../module/functions';
import { reloadEmbedMaker } from './_function';

const button = new Button(
  { customId: 'nonick-js:embedMaker-image' },
  (interaction) => {
    const embed = interaction.message.embeds[0];

    interaction.showModal(
      new ModalBuilder()
        .setCustomId('nonick-js:embedMaker-imageModal')
        .setTitle('Image')
        .setComponents(
          new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
              .setCustomId('thumbnailUrl')
              .setLabel('Miniature (URL)')
              .setMaxLength(1000)
              .setPlaceholder('L\'image spécifiée sera affichée en haut à droite')
              .setValue(embed.thumbnail?.url || '')
              .setStyle(TextInputStyle.Short)
              .setRequired(false),
          ),
          new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
              .setCustomId('imageUrl')
              .setLabel('Image dans l\'intégration (URL)')
              .setMaxLength(1000)
              .setPlaceholder('L\'image spécifiée sera affichée en bas')
              .setValue(embed.image?.url || '')
              .setStyle(TextInputStyle.Short)
              .setRequired(false),
          ),
        ),
    );
  },
);

const modal = new Modal(
  { customId: 'nonick-js:embedMaker-imageModal' },
  (interaction) => {
    if (!interaction.isFromMessage()) return;

    const thumbnailUrl = interaction.fields.getTextInputValue('thumbnailUrl');
    const imageUrl = interaction.fields.getTextInputValue('imageUrl');

    if ((thumbnailUrl && !isURL(thumbnailUrl)) || (imageUrl && !isURL(imageUrl)))
      return interaction.reply({ content: '`❌` Veuillez saisir une URL commençant par `http://` ou `https://`.', ephemeral: true });

    const embed = EmbedBuilder
      .from(interaction.message.embeds[0])
      .setThumbnail(thumbnailUrl || null)
      .setImage(imageUrl || null);

    reloadEmbedMaker(interaction, embed.toJSON());
  },
);

module.exports = [button, modal];
