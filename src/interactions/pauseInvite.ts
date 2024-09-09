import { ChatInput } from '@akki256/discord-interaction';
import { ApplicationCommandOptionType, EmbedBuilder, GuildFeature, PermissionFlagsBits } from 'discord.js';

export default new ChatInput({
  name: 'pauseinvite',
  description: 'Basculer l\'état de pause des invitations du serveur',
  options: [
    { name: 'pause', description: 'Activer ou désactiver l\'état de pause', type: ApplicationCommandOptionType.Boolean, required: true },
  ],
  dmPermission: false,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
}, interaction => {
  const pause = interaction.options.getBoolean('pause', true);
  if (!interaction.guild) return interaction.reply({ content: 'Utilisable uniquement à l\'intérieur du serveur', ephemeral: true });
  const guildFeatures = interaction.guild.features;
  if (guildFeatures.includes(GuildFeature.InvitesDisabled) === pause)
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription('❌ Déjà configuré dans cet état')
          .setColor('Red'),
      ], ephemeral: true,
    });

  if (pause)
    interaction.guild.edit({ features: [...guildFeatures, GuildFeature.InvitesDisabled], reason: `Invitations en pause par ${interaction.user.tag}` }).then(() => {
      const embed = new EmbedBuilder()
        .setDescription('✅ Les invitations du serveur sont maintenant en **pause**!')
        .setColor('Green');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    });

  else
    interaction.guild.edit({ features: guildFeatures.filter(v => v !== GuildFeature.InvitesDisabled), reason: `Annulation de la pause des invitations par ${interaction.user.tag}` }).then(() => {
      const embed = new EmbedBuilder()
        .setDescription('✅ La pause des invitations du serveur a été **levée**!')
        .setColor('Green');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    });

});
