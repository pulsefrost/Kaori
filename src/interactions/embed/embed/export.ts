import { ActionRowBuilder, AttachmentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { Button, Modal } from '@akki256/discord-interaction';

const button = new Button(
  { customId: 'nonick-js:embedMaker-export' },
  (interaction) => {
    interaction.showModal(
      new ModalBuilder()
        .setCustomId('nonick-js:embedMaker-exportModal')
        .setTitle('Exporter')
        .setComponents(
          new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
              .setCustomId('fileName')
              .setLabel('Nom du fichier (ne peut pas contenir de caractères japonais)')
              .setMaxLength(100)
              .setStyle(TextInputStyle.Short)
              .setRequired(false),
          ),
        ),
    );
  },
);

const modal = new Modal(
  { customId: 'nonick-js:embedMaker-exportModal' },
  async (interaction) => {
    if (!interaction.isFromMessage()) return;

    await interaction.deferReply({ ephemeral: true });
    const fileName = interaction.fields.getTextInputValue('fileName') || `nonick-js_embed_${interaction.message.id}`;

    interaction
      .followUp({
        content: '`✅` L\'incorporation actuelle a été exportée. Vous pouvez l'importer en utilisant `/embed import`.',
        files: [new AttachmentBuilder(Buffer.from(JSON.stringify(interaction.message.embeds, null, 2)), { name: `${fileName}.json` })],
      })
      .catch(() => {
        interaction.followUp({ content: '`❌` Un problème est survenu lors de l\'exportation.', ephemeral: true });
      });
  },
);

module.exports = [button, modal];
