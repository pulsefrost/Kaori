import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export const channelModal = new ModalBuilder()
  .setTitle('Salon')
  .setComponents(
    new ActionRowBuilder<TextInputBuilder>().setComponents(
      new TextInputBuilder()
        .setCustomId('nameOrId')
        .setLabel('Nom du salon ou ID')
        .setMaxLength(100)
        .setStyle(TextInputStyle.Short),
    ),
  );

export const roleModal = new ModalBuilder()
  .setTitle('Rôle')
  .setComponents(
    new ActionRowBuilder<TextInputBuilder>().setComponents(
      new TextInputBuilder()
        .setCustomId('nameOrId')
        .setLabel('Nom du rôle ou ID')
        .setMaxLength(100)
        .setStyle(TextInputStyle.Short),
    ),
  );
