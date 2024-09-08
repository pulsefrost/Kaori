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
            '## Modération\n</ban:1266326311396315157> Bannir une personne.\n</clear:1266326320489693215> Supprimer des messages.\n</kick:1266326436529176576> Expulser une personne.\n</verify:1266326626636005396> Panneau de verification.\n</ratelimit:1266326518599254094> Mettre un temps d\'attante d\'envoi de messages.\n</unban:1266326618268373118> Débannir une personne.\n</timeout:1266326614262808648> Mute une personne.\n</pauseinvite:1266326443764351071> Mettre les invitations en pause.\n</firstmessage:1266326342543347797> Premier message du salon.\n</setting:1266326521396592703> Paramètre du serveur',
            '## Utilitaire\n</info serveur:1266326433186447411> Information sur le serveur.\n</info utilisateur:1266326433186447411> Information Utilisateur.\n</afk:1266326308388864161> Signaler que vous êtes AFK.',
            '## Anime\n</hug:1266326429251932191> Câliner une personnne.\n</kiss:1266326439817646091> Embrasser une personne.\n</dance:1266326331214528555> Dancer.\n</pout:1266326515671498897> Bouder.'
          ].join('\n'))
          .setColor('#F4C1B3')
          .setImage('https://i.imgur.com/MsdEvPA.png')
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
      ephemeral: false,
    });

  },
);

module.exports = [helpCommand];
