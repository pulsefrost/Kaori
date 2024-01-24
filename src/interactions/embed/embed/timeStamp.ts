import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } from 'discord.js';
import { Button, Modal } from '@akki256/discord-interaction';
import { reloadEmbedMaker } from './_function';

const button = new Button(
  { customId: 'nonick-js:embedMaker-timeStamp' },
  (interaction) => {
    interaction.showModal(
      new ModalBuilder()
        .setCustomId('nonick-js:embedMaker-timeStampModal')
        .setTitle('Horodatage')
        .setComponents(
          new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
              .setCustomId('timeStamp')
              .setLabel('AAAA-MM-JJThh:mm:ss+Décalage (Remplacez par "now" pour l\'heure actuelle)')
              .setPlaceholder('Exemple : 2023-10-17T10:17:00+09:00')
              .setValue(interaction.message.embeds[0].timestamp || '')
              .setStyle(TextInputStyle.Short)
              .setRequired(false),
          ),
        ),
    );
  },
);

const modal = new Modal(
  { customId: 'nonick-js:embedMaker-timeStampModal' },
  (interaction) => {
    if (!interaction.isFromMessage()) return;

    let timeStamp = interaction.fields.getTextInputValue('timeStamp');
    if (timeStamp.toLowerCase() === 'now') timeStamp = new Date().toISOString();

    if (timeStamp !== '' && !/^\d{4}-?\d\d-?\d\d(?:T\d\d(?::?\d\d(?::?\d\d(?:\.\d+)?)?)?(?:Z|[+-]\d\d:?\d\d)?)?$/.test(timeStamp))
      return interaction.reply({ content: '`❌` Ce n\'est pas un horodatage valide ! Veuillez saisir une valeur conforme à [ISO8601](https://fr.wikipedia.org/wiki/ISO_8601).', ephemeral: true });

    const embed = EmbedBuilder
      .from(interaction.message.embeds[0])
      .setTimestamp(timeStamp ? new Date(timeStamp).getTime() : null);

    reloadEmbedMaker(interaction, embed.toJSON());
  },
);

module.exports = [button, modal];
