import { ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { Button, Modal } from '@akki256/discord-interaction';
import { isURL } from '../../../module/functions';
import { reloadEmbedMaker } from './_function';

const button = new Button(
  { customId: 'kaori:embedMaker-author' },
  (interaction) => {
    const embed = interaction.message.embeds[0];

    interaction.showModal(
      new ModalBuilder()
        .setCustomId('kaori:embedMaker-authorModal')
        .setTitle('En-tête')
        .setComponents(
          new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
              .setCustomId('name')
              .setLabel('Nom')
              .setMaxLength(256)
              .setValue(embed.author?.name || '')
              .setStyle(TextInputStyle.Short)
              .setRequired(false),
          ),
          new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
              .setCustomId('url')
              .setLabel('URL à ajouter au nom')
              .setMaxLength(1000)
              .setValue(embed.author?.url || '')
              .setStyle(TextInputStyle.Short)
              .setRequired(false),
          ),
          new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
              .setCustomId('iconURL')
              .setLabel('URL de l\'icône')
              .setMaxLength(1000)
              .setValue(embed.author?.iconURL || '')
              .setStyle(TextInputStyle.Short)
              .setRequired(false),
          ),
        ),
    );
  },
);

const modal = new Modal(
  { customId: 'kaori:embedMaker-authorModal' },
  (interaction) => {
    if (!interaction.isFromMessage()) return;

    const name = interaction.fields.getTextInputValue('name');
    const url = interaction.fields.getTextInputValue('url') || undefined;
    const iconURL = interaction.fields.getTextInputValue('iconURL') || undefined;
    const option = name ? { name, url, iconURL } : null;

    if (!name && (url || iconURL))
      return interaction.reply({ content: '`❌` Si vous ajoutez une URL d\'icône ou une URL à ajouter au nom, vous devez également saisir l\'option "Nom"', ephemeral: true });
    if ((url && !isURL(url)) || (iconURL && !isURL(iconURL)))
      return interaction.reply({ content: '`❌` Veuillez saisir une URL commençant par `http://` ou `https://`.', ephemeral: true });

    const embed = EmbedBuilder.from(interaction.message.embeds[0]).setAuthor(option);

    reloadEmbedMaker(interaction, embed.toJSON());
  },
);

module.exports = [button, modal];
