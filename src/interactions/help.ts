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
          .setColor('#2b2d31')
          .addFields(
            {
              name: 'Modération',
              value: [
                '</ban:1278628276688126003> Bannir une personne',
                '</clear:1278628280836034602> Supprimer des messages',
                '</kick:1278628401837641762> Expulser une personne',
                '</unban:1278629115573829726> Débannir une personne banni',
                '</ratelimit:1278629020673511464> Limiter le débit des messages',
                '</timeout:1278629111685976175> Mute une personne',
                '</pauseinvite:1278629012889010255> Suspendre les invitations',
                '</firstmessage:1278628297244278908> Afficher le premier message',
                '</setting:1278629024091869258> Paramètres du serveur',
              ].join('\n'),
            },
            {
              name: 'Utilitaire',
              value: [
                '</info serveur:1278628397253394566> Information sur le serveur',
                '</info utilisateur:1278628397253394566> Information utilisateur',
                '</afk:1278628271940046850> Signaler que vous êtes AFK',
                '</profil:1284916095874105374> Voir la photo de profil ou la bannière',
              ].join('\n'),
            },
            {
              name: 'Anime',
              value: [
                '</interaction hug:1282751198239133807>  Faire un câlin',
                '</interaction kiss:1282751198239133807> Emebrasser une personne',
                '</interaction slap:1282751198239133807> Giflé une personne',
                '</interaction feed:1282751198239133807> Nourrir',
                '</interaction bite:1282751198239133807> Mordre',
                '</interaction handshake:1282751198239133807> Serrer la main',
                '</interaction blush:1282751198239133807> Rougir',
                '</interaction smile:1282751198239133807> Sourir',
                '</interaction wave:1282751198239133807> Saluer',
                '</interaction dance:1282751198239133807> Dancer',
                '</interaction tickle:1282751198239133807> Chatouiller',
                '</interaction punch:1282751198239133807> Poing',
                '</interaction pat:1282751198239133807> tapoter',
                '</interaction cuddle:1282751198239133807> Des petits câlins',
                '</interaction kick:1282751198239133807> Dégage',
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
            .setLabel('Communauté')
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.gg/kim'),
          new ButtonBuilder()
            .setLabel('Ajouter le bot')
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.com/oauth2/authorize?client_id=855107430693077033'),
        ),
      ],
      ephemeral: false,
    });

  },
);

module.exports = [helpCommand];