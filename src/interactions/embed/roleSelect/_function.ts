import { APIStringSelectComponent, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Emojis } from '../../../module/constant';

export function getRoleSelectMakerButtons(selectMenu?: Partial<APIStringSelectComponent>) {
  return new ActionRowBuilder<ButtonBuilder>().setComponents(
    new ButtonBuilder()
      .setCustomId('kaori:embedMaker-selectRole-addRole')
      .setEmoji(Emojis.White.addMark)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(selectMenu?.options?.length === 25),
    new ButtonBuilder()
      .setCustomId('kaori:embedMaker-selectRole-removeRole')
      .setEmoji(Emojis.White.removeMark)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(!selectMenu?.options?.length),
    new ButtonBuilder()
      .setCustomId('kaori:emberMaker-selectRole-placeholder')
      .setEmoji(Emojis.White.message)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(!selectMenu),
    new ButtonBuilder()
      .setCustomId((selectMenu?.max_values || 0) <= 1 ? 'kaori:embedMaker-selectRole-selectMode-single' : 'kaori:embedMaker-selectRole-selectMode-multi')
      .setLabel((selectMenu?.max_values || 0) <= 1 ? 'Mode de sélection : Unique' : 'Mode de sélection : Multiple')
      .setStyle(ButtonStyle.Success)
      .setDisabled(!selectMenu),
    new ButtonBuilder()
      .setCustomId('kaori:embedMaker-selectRole-sendComponent')
      .setLabel('Ajouter')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(!selectMenu),
  );
}
