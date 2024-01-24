import { Button, Modal } from '@akki256/discord-interaction';
import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, APIButtonComponent } from 'discord.js';
import { getBaseEmbedMakerButtons, reloadEmbedMaker } from './_function';
import { Emojis } from '../../../module/constant';
import { omitString } from '../../../module/functions';

const addField = [
  new Button(
    { customId: 'nonick-js:embedMaker-addField' },
    async (interaction) => {
      if (interaction.message.embeds[0].fields.length === 25) return;

      interaction.showModal(
        new ModalBuilder()
          .setCustomId('nonick-js:embedMaker-addFieldModal')
          .setTitle('Ajouter un Champ')
          .setComponents(
            new ActionRowBuilder<TextInputBuilder>().setComponents(
              new TextInputBuilder()
                .setCustomId('name')
                .setLabel('Nom du Champ')
                .setMaxLength(256)
                .setStyle(TextInputStyle.Short),
            ),
            new ActionRowBuilder<TextInputBuilder>().setComponents(
              new TextInputBuilder()
                .setCustomId('value')
                .setLabel('Valeur du Champ')
                .setMaxLength(1024)
                .setStyle(TextInputStyle.Paragraph),
            ),
            new ActionRowBuilder<TextInputBuilder>().setComponents(
              new TextInputBuilder()
                .setCustomId('inline')
                .setLabel('Afficher en ligne ?')
                .setMaxLength(5)
                .setPlaceholder('true pour Oui, false pour Non')
                .setStyle(TextInputStyle.Short),
            ),
          ),
      );
    },
  ),

  new Modal(
    { customId: 'nonick-js:embedMaker-addFieldModal' },
    (interaction) => {
      if (!interaction.isFromMessage()) return;

      const name = interaction.fields.getTextInputValue('name');
      const value = interaction.fields.getTextInputValue('value');
      const inline = interaction.fields.getTextInputValue('inline');

      if (!['true', 'false'].includes(inline))
        return interaction.reply({ content: '`❌` Vous pouvez uniquement entrer `true` ou `false` pour le champ "en ligne"', ephemeral: true });

      const embed = EmbedBuilder
        .from(interaction.message.embeds[0])
        .addFields({ name, value, inline: JSON.parse(inline.toLowerCase()) });

      reloadEmbedMaker(interaction, embed.toJSON());
    },
  ),
];

const removeField = [
  new Button(
    { customId: 'nonick-js:embedMaker-removeField' },
    async (interaction) => {
      const embed = interaction.message.embeds[0];
      const components = interaction.message.components;

      if (embed.fields.length === 0) return;
      if (embed.fields.length === 1) return reloadEmbedMaker(interaction, EmbedBuilder.from(embed).setFields().data);

      const indexSelectCustomId = 'nonick-js:embedMaker-removeFieldSelect';
      const backButtonCustomId = 'nonick-js:embedMaker-selectRole-removeRoleSelect-back';

      const message = await interaction.update({
        components: [
          new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
            new StringSelectMenuBuilder()
              .setCustomId(indexSelectCustomId)
              .setPlaceholder('Sélectionnez l\'élément à supprimer')
              .setOptions(...embed.fields.map((v, index) => ({ label: omitString(v.name, 100), description: omitString(v.value, 100), value: String(index), emoji: Emojis.White.message }))),
          ),
          new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
              .setCustomId(backButtonCustomId)
              .setLabel('Revenir sans supprimer')
              .setEmoji(Emojis.White.reply)
              .setStyle(ButtonStyle.Danger),
          ),
        ],
        fetchReply: true,
      });

      message
        .awaitMessageComponent({
          filter: v => [indexSelectCustomId, backButtonCustomId].includes(v.customId),
          time: 180_000,
        })
        .then((i) => {
          if (i.customId === indexSelectCustomId && i.isStringSelectMenu()) {
            const newEmbed = EmbedBuilder
              .from(embed)
              .setFields(embed.fields.filter((v, index) => Number(i.values[0]) !== index));

            const newComponents = getBaseEmbedMakerButtons(newEmbed.toJSON());
            newComponents[1].addComponents(ButtonBuilder.from(components[1].components[3] as APIButtonComponent));

            i.update({ embeds: [newEmbed], components: newComponents });
          }

          else if (i.customId === backButtonCustomId && i.isButton()) {
            const newComponents = getBaseEmbedMakerButtons(embed);
            newComponents[1].addComponents(ButtonBuilder.from(components[1].components[3] as APIButtonComponent));

            i.update({ embeds: [embed], components: newComponents });
          }
        })
        .catch(() => {});
    },
  ),
];

module.exports = [...addField, ...removeField];
