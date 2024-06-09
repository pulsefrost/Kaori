import { MessageContext, SelectMenu, SelectMenuType } from '@akki256/discord-interaction';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, PermissionFlagsBits, StringSelectMenuBuilder, User } from 'discord.js';
import { Emojis } from '../../module/constant';
import { embedMakerType, getEmbedMakerButtons } from './embed/_function';
import { getRoleSelectMakerButtons } from './roleSelect/_function';

const context = new MessageContext(
  {
    name: 'Éditer l\'intégration.',
    defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
    dmPermission: false,
  },
  async (interaction) => {
    if (!interaction.appPermissions?.has(PermissionFlagsBits.ManageWebhooks))
      return interaction.reply({ content: '`❌` Pour utiliser cette fonctionnalité, vous devez accorder au BOT la permission de `Gérer les webhooks`.', ephemeral: true });

    const webhook = await interaction.targetMessage.fetchWebhook().catch(() => null);
    if (!webhook || !interaction.client.user.equals(webhook.owner as User))
      return interaction.reply({ content: '`❌` Vous pouvez uniquement éditer les incorporations postées avec Kaori et actuellement actives en tant que Webhook.', ephemeral: true });

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('`🧰` Édition et Extension de l\'incorporation')
          .setDescription('Vous pouvez éditer l\'incorporation, ajouter des boutons URL, des boutons d\'attribution de rôle et des menus de sélection.')
          .setColor(Colors.Blurple)
          .setFooter({ text: `ID du message : ${interaction.targetId}` }),
      ],
      components: [
        new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
          new StringSelectMenuBuilder()
            .setCustomId('kaori:embedMaker-editEmbedPanel')
            .setOptions(
              { label: 'Éditer l\'incorporation', value: 'editEmbed', emoji: Emojis.White.pencil },
              { label: 'Ajouter un rôle (menu de sélection)', value: 'addRoleSelect', emoji: Emojis.White.role2 },
              { label: 'Ajouter un rôle (bouton)', value: 'addRoleButton', emoji: Emojis.White.role2 },
              { label: 'Ajouter un bouton URL', value: 'addUrlButton', emoji: Emojis.White.link },
              { label: 'Supprimer le composant', value: 'delete', emoji: '🗑' },
            ),
        ),
      ],
      ephemeral: true,
    });
  },
);

const select = new SelectMenu(
  { customId: 'kaori:embedMaker-editEmbedPanel', type: SelectMenuType.String },
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;
    const targetId = interaction.message.embeds[0].footer?.text.match(/[0-9]{18,19}/)?.[0];
    const targetMessage = await interaction.channel?.messages.fetch(targetId || '')?.catch(() => undefined);

    if (!targetMessage)
      return interaction.update({ content: '`❌` Un problème est survenu lors de la récupération du message.', embeds: [], components: [] });

    if (interaction.values[0] === 'editEmbed')
      interaction.update({
        content: `ID du message : ${targetId}`,
        embeds: targetMessage.embeds,
        components: getEmbedMakerButtons(targetMessage.embeds[0], embedMakerType.edit),
      });

    else if (interaction.values[0] === 'addRoleSelect') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles))
        return interaction.reply({ content: '`❌` Vous n\'avez pas les autorisations nécessaires pour utiliser cette fonctionnalité.', ephemeral: true });

      interaction.update({
        embeds: [
          EmbedBuilder
            .from(interaction.message.embeds[0])
            .setTitle('`🧰` Ajout d\'un rôle (menu de sélection)')
            .setDescription('Utilisez les boutons ci-dessous pour créer un menu de sélection et ajoutez des composants au message avec le bouton "Ajouter". (Jusqu\'à 5)'),
        ],
        components: [getRoleSelectMakerButtons()],
      });
    }

    else if (interaction.values[0] === 'addRoleButton') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles))
        return interaction.reply({ content: '`❌` Vous n\'avez pas les autorisations nécessaires pour utiliser cette fonctionnalité.', ephemeral: true });

      interaction.update({
        embeds: [
          EmbedBuilder
            .from(interaction.message.embeds[0])
            .setTitle('`🧰` Ajout d\'un rôle (bouton)')
            .setDescription('Utilisez le bouton "Créer un bouton" pour ajouter des boutons au message. (Jusqu\'à 25)'),
        ],
        components: [
          new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
              .setCustomId('kaori:embedMaker-roleButton-send')
              .setLabel('Créer un bouton')
              .setEmoji(Emojis.White.addMark)
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId('kaori:embedMaker-roleButton-changeStyle')
              .setLabel('Couleur')
              .setEmoji('🎨')
              .setStyle(ButtonStyle.Primary),
          ),
        ],
      });
    }

    else if (interaction.values[0] === 'addUrlButton')
      interaction.update({
        embeds: [
          EmbedBuilder
            .from(interaction.message.embeds[0])
            .setTitle('Ajout d\'un bouton URL')
            .setDescription('Utilisez le bouton "Créer un bouton" pour ajouter des boutons au message. (Jusqu\'à 25)'),
        ],
        components: [
          new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
              .setCustomId('kaori:embedMaker-linkButton-send')
              .setLabel('Créer un bouton')
              .setEmoji(Emojis.White.addMark)
              .setStyle(ButtonStyle.Secondary),
          ),
        ],
      });

    else if (interaction.values[0] === 'delete') {
      if (targetMessage.components.length === 0)
        return interaction.reply({ content: '`❌` Aucun composant à supprimer.', ephemeral: true });

      interaction.update({
        embeds: [
          EmbedBuilder
            .from(interaction.message.embeds[0])
            .setTitle('`🧰` Suppression de composants')
            .setDescription('Sélectionnez la ligne du composant à supprimer dans le menu de sélection ci-dessous'),
        ],
        components: [
          new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
            new StringSelectMenuBuilder()
              .setCustomId('kaori:manageComponents-delete')
              .setOptions(targetMessage.components.map((v, index) => ({ label: `${index + 1}ère ligne`, value: String(index) })))
              .setMaxValues(targetMessage.components.length),
          ),
          new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
              .setCustomId('kaori:manageComponents-deleteAll')
              .setLabel('Supprimer tous les composants')
              .setEmoji('🗑')
              .setStyle(ButtonStyle.Danger),
          ),
        ],
      });
    }
  },
);

module.exports = [context, select];
