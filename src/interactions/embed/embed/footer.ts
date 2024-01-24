import { ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { Button, Modal } from '@akki256/discord-interaction';
import { isURL } from '../../../module/functions';
import { reloadEmbedMaker } from './_function';

const button = new Button(
  { customId: 'nonick-js:embedMaker-footer' },
  (interaction): void => {
    const embed = interaction.message.embeds[0];

    interaction.showModal(
      new ModalBuilder()
        .setCustomId('nonick-js:embedMaker-footerModal')
        .setTitle('Pied de page')
        .setComponents(
          new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
              .setCustomId('text')
              .setLabel('Texte')
              .setMaxLength(2048)
              .setValue(embed.footer?.text || '')
              .setStyle(TextInputStyle.Short)
              .setRequired(false),
          ),
          new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
              .setCustomId('iconURL')
              .setLabel('URL de l\'icône')
              .setMaxLength(1000)
              .setValue(embed.footer?.iconURL || '')
              .setStyle(TextInputStyle.Short)
              .setRequired(false),
          ),
        ),
    );
  },
);

const modal = new Modal(
  { customId: 'nonick-js:embedMaker-footerModal' },
  (interaction) => {
    if (!interaction.isFromMessage()) return;

    const text = interaction.fields.getTextInputValue('text');
    const iconURL = interaction.fields.getTextInputValue('iconURL') || undefined;
    const option = text ? { text, iconURL } : null;

    if (!text && iconURL)
      return interaction.reply({ content: '`❌` Si vous configurez l\'URL de l\'icône, vous devez également saisir le texte.', ephemeral: true });
    if (iconURL && !isURL(iconURL))
      return interaction.reply({ content: '`❌` Veuillez saisir une URL commençant par `http://` ou `https://`.', ephemeral: true });

    const embed = EmbedBuilder.from(interaction.message.embeds[0]).setFooter(option);

    reloadEmbedMaker(interaction, embed.toJSON());
  },
);

module.exports = [button, modal];
