import { ApplicationCommandOptionType, EmbedBuilder, Colors, PermissionFlagsBits } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';

const profileCommand = new ChatInput(
  {
    name: 'profil',
    description: 'Affiche la photo de profil ou la bannière d\'un membre ou du serveur',
    options: [
      {
        name: 'type',
        description: 'Choisissez ce que vous voulez afficher (avatar ou bannière)',
        type: ApplicationCommandOptionType.String,
        choices: [
          { name: 'Avatar', value: 'avatar' },
          { name: 'Bannière', value: 'banniere' },
        ],
        required: true,
      },
      {
        name: 'membre',
        description: 'Le membre dont vous voulez voir l\'avatar ou la bannière',
        type: ApplicationCommandOptionType.User,
        required: false,
      },
      {
        name: 'serveur',
        description: 'Voir la bannière du serveur (uniquement si vous avez choisi bannière)',
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
    ],
    defaultMemberPermissions: PermissionFlagsBits.SendMessages,
    dmPermission: false,
  },
  { coolTime: 5000 },
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    const displayType = interaction.options.getString('type'); // avatar ou bannière
    const member = interaction.options.getUser('membre') || interaction.user;
    const showServerBanner = interaction.options.getBoolean('serveur') || false;

    let embed;

    if (displayType === 'avatar') {
      // Afficher l'avatar du membre
      const avatarUrl = member.displayAvatarURL({ size: 512 });
      embed = new EmbedBuilder()
        .setTitle(`Avatar de ${member.username}`)
        .setImage(avatarUrl)
        .setColor(Colors.Blue);

    } else if (displayType === 'banniere') {
      // Afficher la bannière du serveur si demandé
      if (showServerBanner) {
        if (interaction.guild.banner) {
          const serverBannerUrl = interaction.guild.bannerURL({ size: 512 });
          embed = new EmbedBuilder()
            .setTitle(`Bannière du serveur ${interaction.guild.name}`)
            .setImage(serverBannerUrl)
            .setColor(Colors.Purple);
        } else {
          embed = new EmbedBuilder()
            .setDescription('Le serveur n\'a pas de bannière.')
            .setColor(Colors.Red);
        }
      } else {
        // Sinon, afficher la bannière du membre
        const userBannerUrl = await member.fetch().then(user => user.bannerURL({ size: 512 }));

        if (userBannerUrl) {
          embed = new EmbedBuilder()
            .setTitle(`Bannière de ${member.username}`)
            .setImage(userBannerUrl)
            .setColor(Colors.Blue);
        } else {
          embed = new EmbedBuilder()
            .setDescription(`${member.username} n'a pas de bannière.`)
            .setColor(Colors.Red);
        }
      }
    }

    if (embed) {
      interaction.reply({ embeds: [embed], ephemeral: false });
    } else {
      interaction.reply({ content: 'Impossible d\'afficher les informations demandées.', ephemeral: true });
    }
  },
);

module.exports = [profileCommand];
