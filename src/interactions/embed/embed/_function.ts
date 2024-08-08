import { APIButtonComponent, APIEmbed, ActionRowBuilder, ButtonBuilder, ButtonStyle, Embed, MessageComponentInteraction, ModalSubmitInteraction } from 'discord.js';
import { Emojis } from '../../../module/constant';

export enum embedMakerType {
  send = 'send',
  edit = 'edit',
}

export function getBaseEmbedMakerButtons(embed: APIEmbed | Embed) {
  return [
    new ActionRowBuilder<ButtonBuilder>()
      .setComponents(
        new ButtonBuilder()
          .setCustomId('kaori:embedMaker-base')
          .setLabel('Base')
          .setEmoji(Emojis.White.message)
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('kaori:embedMaker-image')
          .setLabel('Image')
          .setEmoji(Emojis.White.image)
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('kaori:embedMaker-author')
          .setLabel('Auteur')
          .setEmoji(Emojis.White.nickName)
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('kaori:embedMaker-footer')
          .setLabel('Pied de page')
          .setEmoji(Emojis.White.nickName)
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('kaori:embedMaker-timeStamp')
          .setEmoji(Emojis.White.schedule)
          .setStyle(ButtonStyle.Secondary),
      ),

    new ActionRowBuilder<ButtonBuilder>()
      .setComponents(
        new ButtonBuilder()
          .setCustomId('kaori:embedMaker-addField')
          .setLabel('Champ')
          .setEmoji(Emojis.White.addMark)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(embed.fields?.length === 25),
        new ButtonBuilder()
          .setCustomId('kaori:embedMaker-removeField')
          .setLabel('Champ')
          .setEmoji(Emojis.White.removeMark)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(!embed.fields?.length),
        new ButtonBuilder()
          .setCustomId('kaori:embedMaker-export')
          .setEmoji(Emojis.White.download)
          .setStyle(ButtonStyle.Danger),
      ),
  ];
}

export function getEmbedMakerButtons(embed: APIEmbed | Embed, type: embedMakerType) {
  const actionRows = getBaseEmbedMakerButtons(embed);

  switch (type) {
    case 'send':
      actionRows[1].addComponents(
        new ButtonBuilder()
          .setCustomId('kaori:embedMaker-send')
          .setLabel('Envoyer')
          .setStyle(ButtonStyle.Primary),
      );
      break;

    case 'edit':
      actionRows[1].addComponents(
        new ButtonBuilder()
          .setCustomId('kaori:embedMaker-edit')
          .setLabel('Modifier')
          .setStyle(ButtonStyle.Primary),
      );
      break;

    default:
      break;
  }

  return actionRows;
}

export function reloadEmbedMaker(interaction: MessageComponentInteraction | ModalSubmitInteraction, embed: APIEmbed | Embed) {
  if (interaction instanceof ModalSubmitInteraction && !interaction.isFromMessage()) return;

  const components = getBaseEmbedMakerButtons(embed);
  components[1].addComponents(ButtonBuilder.from(interaction.message.components[1].components[3] as APIButtonComponent));

  interaction
    .update({ embeds: [embed], components })
    .catch((e) => interaction.reply({ content: `\`❌\` Échec de la mise à jour de l'incrustation.\n\`${e}\`` }));
}
