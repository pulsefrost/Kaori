import { ActionRowBuilder, ApplicationCommandOptionType, AttachmentBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, GuildMemberRoleManager, PermissionFlagsBits } from 'discord.js';
import { ChatInput, Button } from '@akki256/discord-interaction';
import { Captcha } from '../module/captcha';
// import Captcha from '@haileybot/captcha-generator';

const duringAuthentication = new Set();

const verifyCommand = new ChatInput(
  {
    name: 'verify',
    description: 'Créer un panneau d\'authentification utilisant des rôles',
    options: [
      {
        name: 'type',
        description: 'Type d\'authentification',
        choices: [
          { name: 'Bouton', value: 'button' },
          { name: 'Image', value: 'image' },
        ],
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: 'role',
        description: 'Rôle à attribuer en cas de succès de l\'authentification',
        type: ApplicationCommandOptionType.Role,
        required: true,
      },
      {
        name: 'description',
        description: 'Description de l\'incorporation (saut de ligne avec deux espaces)',
        type: ApplicationCommandOptionType.String,
        maxLength: 4096,
      },
      {
        name: 'color',
        description: 'Couleur de l\'incorporation',
        type: ApplicationCommandOptionType.Number,
        choices: [
          { name: '🔴 Rouge', value: Colors.Red },
          { name: '🟠 Orange', value: Colors.Orange },
          { name: '🟡 Jaune', value: Colors.Yellow },
          { name: '🟢 Vert', value: Colors.Green },
          { name: '🔵 Bleu', value: Colors.Blue },
          { name: '🟣 Violet', value: Colors.Purple },
          { name: '⚪ Blanc', value: Colors.White },
          { name: '⚫ Noir', value: Colors.DarkButNotBlack },
        ],
      },
      {
        name: 'image',
        description: 'Image',
        type: ApplicationCommandOptionType.Attachment,
      },
    ],
    defaultMemberPermissions: PermissionFlagsBits.ManageRoles | PermissionFlagsBits.ManageChannels,
    dmPermission: false,
  },
  { coolTime: 600_000 },
  async (interaction) => {

    if (!interaction.inCachedGuild()) return;

    const verifyTypeName = new Map([['button', 'Bouton'], ['image', 'Image']]);
    const verifyType = interaction.options.getString('type', true);
    const role = interaction.options.getRole('role', true);

    if (!interaction.guild.members.me?.permissions.has(PermissionFlagsBits.ManageRoles))
      return interaction.reply({ content: `\`❌\` Veuillez accorder à **${interaction.user.username}** la permission de gérer les rôles !`, ephemeral: true });
    if (role.managed || role.id === interaction.guild.roles.everyone.id)
      return interaction.reply({ content: '`❌` Ce rôle ne peut pas être utilisé pour l\'authentification.', ephemeral: true });
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && interaction.member.roles.highest.position < role.position)
      return interaction.reply({ content: '`❌` Vous ne pouvez pas utiliser un rôle qui est au-dessus de votre plus haut rôle pour l\'authentification.', ephemeral: true });
    if (!role.editable)
      return interaction.reply({ content: '`❌` Ce rôle est positionné plus haut que le BOT, il ne peut pas être utilisé pour l\'authentification.', ephemeral: true });

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`\`✅\` Authentification : ${verifyTypeName.get(verifyType)!}`)
          .setDescription(interaction.options.getString('description')?.replace('  ', '\n') || null)
          .setColor(interaction.options.getNumber('color') ?? Colors.Green)
          .setImage(interaction.options.getAttachment('image')?.url || null)
          .setFields({ name: 'Rôle attribué', value: role.toString() }),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().setComponents(
          new ButtonBuilder()
            .setCustomId(`nonick-js:verify-${verifyType}`)
            .setLabel('Authentifier')
            .setStyle(ButtonStyle.Success),
        ),
      ],
    });
  },
);

const verifyButton = new Button(
  { customId: /^nonick-js:verify-(button|image)/ },
  async (interaction) => {

    if (!interaction.inCachedGuild()) return;

    const roleId = interaction.message.embeds[0]?.fields[0]?.value?.match(/(?<=<@&)\d+(?=>)/)?.[0];
    const roles = interaction.member.roles;

    if (duringAuthentication.has(interaction.user.id))
      return interaction.reply({ content: '`❌` Vous êtes actuellement en train de vous authentifier. Veuillez attendre la fin de l\'authentification en cours avant de commencer une nouvelle tentative.', ephemeral: true });
    if (!roleId || !(roles instanceof GuildMemberRoleManager))
      return interaction.reply({ content: '`❌` Un problème est survenu pendant l\'authentification.', ephemeral: true });
    if (roles.cache.has(roleId))
      return interaction.reply({ content: '`✅` Vous êtes déjà authentifié.', ephemeral: true });

    if (interaction.customId === 'nonick-js:verify-button')
      roles.add(roleId, 'Authentification')
        .then(() => interaction.reply({ content: '`✅` Authentification réussie !', ephemeral: true }))
        .catch(() => interaction.reply({ content: '`❌` Impossible d\'ajouter le rôle. Veuillez contacter l\'administrateur du serveur.', ephemeral: true }));

    if (interaction.customId === 'nonick-js:verify-image') {
      await interaction.deferReply({ ephemeral: true });

      const { image, text } = Captcha.create({ color: '#4b9d6e' }, {}, { amount: 5, blur: 25 }, { rotate: 15, skew: true });

      interaction.user
        .send({
          embeds: [
            new EmbedBuilder()
              .setAuthor({ name: `${interaction.guild.name}: Authentification par image`, iconURL: interaction.guild.iconURL() ?? undefined })
              .setDescription([
                'Veuillez envoyer dans ce DM la chaîne de caractères verte affichée dans l\'image ci-dessous.',
                '> ⚠️Si le temps imparti est dépassé ou si vous échouez plusieurs fois, vous devrez recommencer une nouvelle authentification.',
              ].join('\n'))
              .setColor(Colors.Blurple)
              .setImage('attachment://nonick-js-captcha.jpeg')
              .setFooter({ text: 'NoNICK.js ne demandera jamais de saisir un mot de passe ni de lire un code QR.' }),
          ],
          files: [new AttachmentBuilder(image, { name: 'nonick-js-captcha.jpeg' })],
        })
        .then(() => {
          duringAuthentication.add(interaction.user.id);
          interaction.followUp({ content: '`📨` Veuillez poursuivre l\'authentification dans vos messages privés.' });

          const collector = interaction.user.dmChannel!.createMessageCollector({ filter: v => v.author.id === interaction.user.id, time: 60_000, max: 3 });

          collector.on('collect', tryMessage => {
            if (tryMessage.content !== text) return;

            roles.add(roleId)
              .then(() => interaction.user.send('`✅` Authentification réussie !'))
              .catch(() => interaction.user.send('`❌` Authentification réussie, mais impossible d\'ajouter le rôle. Veuillez contacter l\'administrateur du serveur.'))
              .finally(() => collector.stop());
          });

          collector.on('end', (collection) => {
            if (collection.size === 3) {
              interaction.user.send({ content: '`❌` Échec de l\'authentification après plusieurs tentatives. La prochaine authentification sera possible dans `5 minutes`.' });
              setTimeout(() => duringAuthentication.delete(interaction.user.id), 300_000);
            } else
              duringAuthentication.delete(interaction.user.id);

          });
        })
        .catch(() => {
          interaction.followUp({ content: '`❌` Pour effectuer cette authentification, vous devez autoriser la réception de messages privés de la part du BOT.', ephemeral: true });
        });
    }
  },
);

module.exports = [verifyCommand, verifyButton];
