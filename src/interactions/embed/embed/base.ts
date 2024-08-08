import { ActionRowBuilder, ColorResolvable, EmbedBuilder, ModalBuilder, resolveColor, TextInputBuilder, TextInputStyle } from 'discord.js';
import { Button, Modal } from '@akki256/discord-interaction';
import { isURL } from '../../../module/functions';
import { reloadEmbedMaker } from './_function';

const button = new Button(
  { customId: 'kaori:embedMaker-base' },
  (interaction) => {
    const embed = interaction.message.embeds[0];

    interaction.showModal(
      new ModalBuilder()
        .setCustomId('kaori:embedMaker-baseModal')
        .setTitle('Titre, Description, Couleur')
        .setComponents(
          new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
              .setCustomId('title')
              .setLabel('Titre')
              .setValue(embed.title || '')
              .setMaxLength(256)
              .setStyle(TextInputStyle.Short)
              .setRequired(false),
          ),
          new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
              .setCustomId('url')
              .setLabel('URL du Titre')
              .setValue(embed.url || '')
              .setPlaceholder('Exemple : https://kaoricafe.fr')
              .setStyle(TextInputStyle.Short)
              .setRequired(false),
          ),
          new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
              .setCustomId('description')
              .setLabel('Description')
              .setValue(embed.description || '')
              .setMaxLength(3999)
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(false),
          ),
          new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
              .setCustomId('color')
              .setLabel('Code Couleur (ou nom de couleur)')
              .setValue(embed.hexColor || '')
              .setPlaceholder('Exemple : #ffffff, Rouge')
              .setStyle(TextInputStyle.Short),
          ),
        ),
    );
  },
);

const modal = new Modal(
  { customId: 'kaori:embedMaker-baseModal' },
  (interaction) => {
    if (!interaction.isFromMessage()) return;

    const title = interaction.fields.getTextInputValue('title') || null;
    const url = interaction.fields.getTextInputValue('url') || null;
    const description = interaction.fields.getTextInputValue('description') || null;
    let color: (string | number) = interaction.fields.getTextInputValue('color');

    if (url && !isURL(url))
      return interaction.reply({ content: '`❌` Veuillez saisir une URL commençant par `http://` ou `https://`.', ephemeral: true });

    try {
      color = resolveColor(color as ColorResolvable);
    } catch {
      return interaction.reply({ content: '`❌` Code couleur invalide ou nom de couleur saisi. Veuillez consulter [cette page](https://htmlcolorcodes.com) pour saisir une valeur correcte.', ephemeral: true });
    }

    const embed = EmbedBuilder
      .from(interaction.message.embeds[0])
      .setTitle(title)
      .setURL(url)
      .setDescription(description)
      .setColor(color);

    reloadEmbedMaker(interaction, embed.toJSON());
  },
);

module.exports = [button, modal];
