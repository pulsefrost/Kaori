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
          .setColor('#F4C1B3')
          .setImage('https://i.imgur.com/MsdEvPA.png')
          .addFields(
            {
              name: 'Modération',
              value: [
                'Bannir une personne',
                'Supprimer des messages',
                'Expulser une personne',
                'Panneau de vérification',
                'Limiter le débit des messages',
                'Débannir une personne',
                'Mute une personne',
                'Suspendre les invitations',
                'Afficher le premier message',
                'Paramètres du serveur',
              ].join('\n'),
            },
            {
              name: 'Utilitaire',
              value: [
                'Information sur le serveur',
                'Information utilisateur',
                '</afk:1266326308388864161> Signaler que vous êtes AFK',
              ].join('\n'),
            },
            {
              name: 'Anime',
              value: [
                '</hug:1266326429251932191> Câliner une personne',
                '</kiss:1266326439817646091> Embrasser une personne',
                '</dance:1266326331214528555> Danser',
                '</pout:1266326515671498897> Bouder',
              ].join('\n'),
            },
            {
              name: 'Quelques fonctionnalités incluses',
              value: feature.map(v => inlineCode(v)).join(' '),
            },
          ),
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
      ephemeral: false,
    });

  },
);

module.exports = [helpCommand];