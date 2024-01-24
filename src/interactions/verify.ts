import { ActionRowBuilder, ApplicationCommandOptionType, AttachmentBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, GuildMemberRoleManager, PermissionFlagsBits } from 'discord.js';
import { ChatInput, Button } from '@akki256/discord-interaction';
import { Captcha } from '../module/captcha';
// import Captcha from '@haileybot/captcha-generator';

const duringAuthentication = new Set();

const verifyCommand = new ChatInput(
  {
    name: 'verify',
    description: 'Crée un panneau d\'authentification utilisant des rôles',
    options: [
      {
        name: 'type',
        description: 'Type d\'authentification',
        choices: [
          { name: 'Bouton', value: 'button' },
          { name: 'Image', value: 'image' },
        ],
        type: ApplicationCommandOptionType.String,
        requis: true,
      },
      {
        name: 'role',
        description: 'Rôle à attribuer lors d\'une authentification réussie',
        type: ApplicationCommandOptionType.Role,
        requis: true,
      },
      {
        name: 'description',
        description: 'Description intégrée (saut de ligne avec deux espaces)',
        type: ApplicationCommandOptionType.String,
        maxLength: 4096,
      },
      {
        name: 'couleur',
        description: 'Couleur de l\'intégration',
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

    const typesAuthentification = new Map([['button', 'Bouton'], ['image', 'Image']]);
    const typeAuthentification = interaction.options.getString('type', true);
    const role = interaction.options.getRole('role', true);

    if (!interaction.guild.members.me?.permissions.has(PermissionFlagsBits.ManageRoles))
      return interaction.reply({ content: `\`❌\` Veuillez accorder la permission \`Gérer les rôles\` à **${interaction.user.username}** !`, ephemeral: true });
    if (role.managed || role.id === interaction.guild.roles.everyone.id)
      return interaction.reply({ content: '`❌` Ce rôle ne peut pas être utilisé pour l\'authentification.', ephemeral: true });
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && interaction.member.roles.highest.position < role.position)
      return interaction.reply({ content: '`❌` Vous ne pouvez pas utiliser un rôle supérieur au vôtre pour l\'authentification.', ephemeral: true });
    if (!role.editable)
      return interaction.reply({ content: '`❌` Ce rôle est positionné plus haut que le bot et ne peut pas être utilisé pour l\'authentification.', ephemeral: true });

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`\`✅\` Authentification : ${typesAuthentification.get(typeAuthentification)!}`)
          .setDescription(interaction.options.getString('description')?.replace('  ', '\n') || null)
          .setColor(interaction.options.getNumber('color') ?? Colors.Green)
          .setImage(interaction.options.getAttachment('image')?.url || null)
          .setFields({ name: 'Rôle à attribuer', value: role.toString() }),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().setComponents(
          new ButtonBuilder()
            .setCustomId(`nonick-js:verify-${typeAuthentification}`)
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
      return interaction.reply({ content: '`❌` Vous effectuez actuellement une autre authentification. Vous ne pouvez pas lancer une nouvelle authentification tant que la précédente n\'est pas terminée.', ephemeral: true });
    if (!roleId || !(roles instanceof GuildMemberRoleManager))
      return interaction.reply({ content: '`❌` Un problème est survenu pendant l\'authentification.', ephemeral: true });
    if (roles.cache.has(roleId))
      return interaction.reply({ content: '`✅` Déjà authentifié.', ephemeral: true });

    if (interaction.customId === 'nonick-js:verify-button')
      roles.add(roleId, 'Authentification')
        .then(() => interaction.reply({ content: '`✅` Authentification réussie !', ephemeral: true }))
        .catch(() => interaction.reply({ content: '`❌` Impossible d\'attribuer le rôle. Veuillez contacter l\'administrateur du serveur.', ephemeral: true }));

    if (interaction.customId === 'nonick-js:verify-image') {
      await interaction.deferReply({ ephemeral: true });

      const { image, text } = Captcha.create({ color: '#4b9d6e' }, {}, { amount: 5, blur: 25 }, { rotate: 15, skew: true });

      interaction.user
        .send({
          embeds: [
            new EmbedBuilder()
              .setAuthor({ name: `${interaction.guild.name}: Authentification par image`, iconURL: interaction.guild.iconURL() ?? undefined })
              .setDescription([
                'Veuillez envoyer le texte vert affiché dans l\'image ci-dessous à ce DM.',
                '> ⚠️ Si un certain temps s\'écoule ou si vous faites plusieurs erreurs, vous devrez générer une nouvelle authentification.',
              ].join('\n'))
              .setColor(Colors.Blurple)
              .setImage('attachment://nonick-js-captcha.jpeg')
              .setFooter({ text: 'NoNICK.js ne demandera jamais la saisie de mot de passe ni la numérisation de code QR.' }),
          ],
          files: [new AttachmentBuilder(image, { name: 'nonick-js-captcha.jpeg' })],
        })
        .then(() => {
          duringAuthentication.add(interaction.user.id);
          interaction.followUp({ content: '`📨` Continuez l\'authentification en DM.' });

          const collector = interaction.user.dmChannel!.createMessageCollector({ filter: v => v.author.id === interaction.user.id, time: 60_000, max: 3 });

          collector.on('collect', tryMessage => {
            if (tryMessage.content !== text) return;

            roles.add(roleId)
              .then(() => interaction.user.send('`✅` Authentification réussie !'))
              .catch(() => interaction.user.send('`❌` Authentification réussie, mais impossible d\'attribuer le rôle. Veuillez contacter l\'administrateur du serveur.'))
              .finally(() => collector.stop());
          });

          collector.on('end', (collection) => {
            if (collection.size === 3) {
              interaction.user.send({ content: '`❌` L\'authentification a échoué en dépassant la limite d\'essais. La prochaine authentification sera possible dans `5 minutes`.' });
              setTimeout(() => duringAuthentication.delete(interaction.user.id), 300_000);
            } else
              duringAuthentication.delete(interaction.user.id);

          });
        })
        .catch(() => {
          interaction.followUp({ content: '`❌` Pour effectuer cette authentification, vous devez autoriser la réception de DMs de la part du bot.', ephemeral: true });
        });
    }

  },
);

module.exports = [verifyCommand, verifyButton];
