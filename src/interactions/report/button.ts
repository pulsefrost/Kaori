import { Button, Modal } from '@akki256/discord-interaction';
import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ComponentType, EmbedBuilder, formatEmoji, Colors, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Emojis } from '../../module/constant';

const considerButton = new Button({ customId: 'kaori:report-consider' }, interaction => {
  const embed = interaction.message.embeds[0];
  interaction.update({
    embeds: [
      EmbedBuilder.from(embed)
        .setDescription([
          `${embed.description}`,
          `${formatEmoji(Emojis.Blurple.member)} **Intervenant :** ${interaction.user} [${interaction.user.tag}]`,
        ].join('\n'))
        .setColor('Yellow'),
    ],
    components: [
      new ActionRowBuilder<ButtonBuilder>().setComponents(
        new ButtonBuilder()
          .setCustomId('kaori:report-completed')
          .setLabel('Traité')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('kaori:report-ignore')
          .setLabel('Ignorer')
          .setStyle(ButtonStyle.Danger),
      ),
    ],
  });
});

const actionButton = new Button(
  { customId: /^kaori:report-(completed|ignore)$/ },
  (interaction): void => {
    const isCompleteButton = interaction.customId.replace('kaori:report-', '') === 'completed';

    interaction.showModal(
      new ModalBuilder()
        .setCustomId('kaori:report-actionModal')
        .setTitle(`${isCompleteButton ? 'Traité' : 'Non traité'}`)
        .setComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId(isCompleteButton ? 'action' : 'reason')
              .setLabel(isCompleteButton ? 'Action effectuée' : 'Raison de l\'absence d\'action')
              .setMaxLength(100)
              .setStyle(TextInputStyle.Short),
          ),
        ),
    );
  },
);

const actionModal = new Modal(
  { customId: 'kaori:report-actionModal' },
  async (interaction) => {
    if (!interaction.isFromMessage() || interaction.components[0].components[0].type !== ComponentType.TextInput) return;

    const embed = interaction.message.embeds[0];
    const isAction = interaction.components[0].components[0].customId === 'action';
    const categoryValue = interaction.components[0].components[0].value;

    await interaction.update({
      embeds: [
        EmbedBuilder
          .from(interaction.message.embeds[0])
          .setTitle(`${embed.title} ` + (isAction ? '[Traité]' : '[Non traité]'))
          .setDescription([
            `${embed.description}`,
            `${formatEmoji(Emojis.Blurple.admin)} **${isAction ? 'Action effectuée' : 'Raison de l\'absence d\'action'} :** ${categoryValue}`,
          ].join('\n'))
          .setColor(isAction ? Colors.Green : Colors.Red),
      ],
      components: [],
    });

    if (interaction.message.hasThread) await interaction.message.thread?.setLocked(true).catch(() => { });
  },
);

module.exports = [actionButton, actionModal, considerButton];
