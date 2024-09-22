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
          .setDescription(
            'Kaori est un bot puissant, conçu pour gérer votre serveur de manière efficace et organisée. Avec de nombreuses fonctionnalités utiles, il permet de modérer, informer et bien plus encore.'
          )
          .setColor('#2b2d31')
          .addFields(
            {
              name: '<:staff_orange:1287399940439675022> Modération',
              value: 
                '<:point:1287400149319946332> </ban:1278628276688126003> Bannir une personne\n' +
                '<:point:1287400149319946332> </clear:1278628280836034602> Supprimer des messages\n' +
                '<:point:1287400149319946332> </kick:1278628401837641762> Expulser une personne\n' +
                '<:point:1287400149319946332> </unban:1278629115573829726> Débannir une personne banni\n' +
                '<:point:1287400149319946332> </ratelimit:1278629020673511464> Limiter le débit des messages\n' +
                '<:point:1287400149319946332> </timeout:1278629111685976175> Mute une personne\n' +
                '<:point:1287400149319946332> </pauseinvite:1278629012889010255> Suspendre les invitations\n' +
                '<:point:1287400149319946332> </firstmessage:1278628297244278908> Afficher le premier message\n' +
                '<:point:1287400149319946332> </setting:1278629024091869258> Paramètres du serveur',
              inline: true,
            },
            {
              name: '<:Pin:1287401153155436564> Utilitaire',
              value: 
                '<:point:1287400149319946332> </info serveur:1278628397253394566> Information sur le serveur\n' +
                '<:point:1287400149319946332> </info utilisateur:1278628397253394566> Information utilisateur\n' +
                '<:point:1287400149319946332> </afk:1278628271940046850> Signaler que vous êtes AFK\n' +
                '<:point:1287400149319946332> </profil:1284916095874105374> Voir la photo de profil ou la bannière',
              inline: true,
            },
            {
              name: '<:orange_sit:1287399938380005406> Anime',
              value: 
                '<:point:1287400149319946332> </interaction hug:1282751198239133807> Faire un câlin\n' +
                '<:point:1287400149319946332> </interaction kiss:1282751198239133807> Embrasser une personne\n' +
                '<:point:1287400149319946332> </interaction slap:1282751198239133807> Gifler une personne\n' +
                '<:point:1287400149319946332> </interaction feed:1282751198239133807> Nourrir\n' +
                '<:point:1287400149319946332> </interaction bite:1282751198239133807> Mordre\n' +
                '<:point:1287400149319946332> </interaction handshake:1282751198239133807> Serrer la main\n' +
                '<:point:1287400149319946332> </interaction blush:1282751198239133807> Rougir\n' +
                '<:point:1287400149319946332> </interaction smile:1282751198239133807> Sourire\n' +
                '<:point:1287400149319946332> </interaction wave:1282751198239133807> Saluer\n' +
                '<:point:1287400149319946332> </interaction dance:1282751198239133807> Danser\n' +
                '<:point:1287400149319946332> </interaction tickle:1282751198239133807> Chatouiller\n' +
                '<:point:1287400149319946332> </interaction punch:1282751198239133807> Poing\n' +
                '<:point:1287400149319946332> </interaction pat:1282751198239133807> Tapoter\n' +
                '<:point:1287400149319946332> </interaction cuddle:1282751198239133807> Des petits câlins\n' +
                '<:point:1287400149319946332> </interaction kick:1282751198239133807> Dégager',
              inline: true,
            },
            {
              name: 'Quelques fonctionnalités incluses',
              value: feature.map(v => inlineCode(v)).join(' '),
              inline: true,
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