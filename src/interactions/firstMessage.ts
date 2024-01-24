import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';

const firstMessageCommand = new ChatInput(
  {
    name: 'firstmessage',
    description: 'Envoyer un bouton avec l\'URL du premier message dans le canal',
    options: [
      {
        name: 'content',
        description: 'Message',
        maxLength: 200,
        type: ApplicationCommandOptionType.String,
      },
      {
        name: 'label',
        description: 'Texte du bouton',
        maxLength: 80,
        type: ApplicationCommandOptionType.String,
      },
    ],
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels | PermissionFlagsBits.ManageMessages,
    dmPermission: false,
  }, { coolTime: 50000 },
  async (interaction) => {
    if (!interaction.channel) return;

    interaction.channel.messages.fetch({ after: '1', limit: 1 })
      .then((messages) => {
        interaction.reply({
          content: interaction.options.getString('content') ?? undefined,
          components: [
            new ActionRowBuilder<ButtonBuilder>().setComponents(
              new ButtonBuilder()
                .setLabel(interaction.options.getString('label') ?? 'Aller en haut')
                .setURL(messages.first()?.url || `https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${messages.first()?.id}`)
                .setStyle(ButtonStyle.Link),
            ),
          ],
        });
      })
      .catch(() => {
        interaction.reply({ content: '`❌` Impossible de récupérer le message', ephemeral: true });
      });
  },
);

module.exports = [firstMessageCommand];
