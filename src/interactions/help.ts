import { ChatInput } from '@akki256/discord-interaction';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, inlineCode } from 'discord.js';
import { EmbedPagination } from '../module/pagination'; // Assurez-vous que le chemin du fichier est correct

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

    // Création des différents embeds pour chaque catégorie
    const moderationEmbed = new EmbedBuilder()
      .setTitle('Modération')
      .setDescription(
        '<:point:1287400149319946332> </ban:1278628276688126003> Bannir une personne\n' +
        '<:point:1287400149319946332> </clear:1278628280836034602> Supprimer des messages\n' +
        '<:point:1287400149319946332> </kick:1278628401837641762> Expulser une personne\n' +
        '<:point:1287400149319946332> </unban:1278629115573829726> Débannir une personne banni\n' +
        '<:point:1287400149319946332> </ratelimit:1278629020673511464> Limiter le débit des messages\n' +
        '<:point:1287400149319946332> </timeout:1278629111685976175> Mute une personne\n' +
        '<:point:1287400149319946332> </pauseinvite:1278629012889010255> Suspendre les invitations\n' +
        '<:point:1287400149319946332> </firstmessage:1278628297244278908> Afficher le premier message\n' +
        '<:point:1287400149319946332> </setting:1278629024091869258> Paramètres du serveur'
      )
      .setColor('#2b2d31');

    const utilityEmbed = new EmbedBuilder()
      .setTitle('Utilitaire')
      .setDescription(
        '<:point:1287400149319946332> </info serveur:1278628397253394566> Information sur le serveur\n' +
        '<:point:1287400149319946332> </info utilisateur:1278628397253394566> Information utilisateur\n' +
        '<:point:1287400149319946332> </afk:1278628271940046850> Signaler que vous êtes AFK\n' +
        '<:point:1287400149319946332> </profil:1284916095874105374> Voir la photo de profil ou la bannière'
      )
      .setColor('#2b2d31');

    const animeEmbed = new EmbedBuilder()
      .setTitle('Anime (Partie 1)')
      .setDescription(
        '<:point:1287400149319946332> </interaction hug:1282751198239133807> Faire un câlin\n' +
        '<:point:1287400149319946332> </interaction kiss:1282751198239133807> Embrasser une personne\n' +
        '<:point:1287400149319946332> </interaction slap:1282751198239133807> Gifler une personne\n' +
        '<:point:1287400149319946332> </interaction feed:1282751198239133807> Nourrir\n' +
        '<:point:1287400149319946332> </interaction bite:1282751198239133807> Mordre\n' +
        '<:point:1287400149319946332> </interaction handshake:1282751198239133807> Serrer la main\n' +
        '<:point:1287400149319946332> </interaction blush:1282751198239133807> Rougir'
      )
      .setColor('#2b2d31');

    const animeEmbed2 = new EmbedBuilder()
      .setTitle('Anime (Partie 2)')
      .setDescription(
        '<:point:1287400149319946332> </interaction smile:1282751198239133807> Sourire\n' +
        '<:point:1287400149319946332> </interaction wave:1282751198239133807> Saluer\n' +
        '<:point:1287400149319946332> </interaction dance:1282751198239133807> Danser\n' +
        '<:point:1287400149319946332> </interaction tickle:1282751198239133807> Chatouiller\n' +
        '<:point:1287400149319946332> </interaction punch:1282751198239133807> Poing\n' +
        '<:point:1287400149319946332> </interaction pat:1282751198239133807> Tapoter\n' +
        '<:point:1287400149319946332> </interaction cuddle:1282751198239133807> Des petits câlins\n' +
        '<:point:1287400149319946332> </interaction kick:1282751198239133807> Dégager'
      )
      .setColor('#2b2d31');

    const featureEmbed = new EmbedBuilder()
      .setTitle('Quelques fonctionnalités incluses')
      .setDescription(feature.map(v => inlineCode(v)).join(' '))
      .setColor('#2b2d31');

    // Utilisation de la pagination
    const pagination = new EmbedPagination(moderationEmbed, utilityEmbed, animeEmbed, animeEmbed2, featureEmbed);

    // Envoie la pagination avec les boutons
    pagination.replyInteraction(interaction);
  },
);

module.exports = [helpCommand];