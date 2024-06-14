import { ChatInput } from '@akki256/discord-interaction';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, inlineCode } from 'discord.js';

const feature = [
  'Messages d\'entrée/sortie', 'Signalements internes du serveur',
  'Journal de modération', 'Changement automatique du niveau de vérification',
  'Commande de création de panneau de rôles', 'Commande de création d\'incorporation',
];

const helpCommand = new ChatInput(
  {
    name: 'help',
    description: 'À propos de Kaori',
    dmPermission: true,
  },
  (interaction) => {

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(interaction.client.user.username)
          .setDescription([
            'Équipé de fonctionnalités utiles pour la gestion et la croissance des serveurs !',
            'Nous travaillons chaque jour pour développer un "BOT multifonction facile à utiliser et complètement gratuit".',
          ].join('\n'))
          .setColor(Colors.Blurple)
          .setFields({ name: 'Quelques fonctionnalités incluses', value: feature.map(v => inlineCode(v)).join(' ') }),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().setComponents(
          new ButtonBuilder()
            .setLabel('Serveur de support')
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.gg/amies'),
          new ButtonBuilder()
            .setLabel('Guide d\'utilisation')
            .setStyle(ButtonStyle.Link)
            .setURL('https://kaoricafe.fr'),
        ),
      ],
      ephemeral: true,
    });

  },
);

module.exports = [helpCommand];
