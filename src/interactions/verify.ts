import { ActionRowBuilder, ApplicationCommandOptionType, AttachmentBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, GuildMemberRoleManager, PermissionFlagsBits } from 'discord.js';
import { ChatInput, Button } from '@akki256/discord-interaction';
import { Captcha } from '../module/captcha';
import fs from 'fs';
import path from 'path';

const duringAuthentication = new Set();

const verifyCommand = new ChatInput(
  {
    name: 'verify',
    description: 'Créer un panneau de vérification avec un rôle',
    options: [
      {
        name: 'type',
        description: 'Type de vérification',
        choices: [
          { name: 'Bouton', value: 'button' },
          { name: 'Image', value: 'image' },
        ],
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: 'role',
        description: 'Rôle à attribuer en cas de réussite de la vérification',
        type: ApplicationCommandOptionType.Role,
        required: true,
      },
      {
        name: 'description',
        description: 'Description de l\'emballage (utiliser deux espaces pour un saut de ligne)',
        type: ApplicationCommandOptionType.String,
        maxLength: 4096,
      },
      {
        name: 'color',
        description: 'Couleur de l\'emballage',
        type: ApplicationCommandOptionType.Number,
        choices: [
          { name: '🔴Rouge', value: Colors.Red },
          { name: '🟠Orange', value: Colors.Orange },
          { name: '🟡Jaune', value: Colors.Yellow },
          { name: '🟢Vert', value: Colors.Green },
          { name: '🔵Bleu', value: Colors.Blue },
          { name: '🟣Violet', value: Colors.Purple },
          { name: '⚪Blanc', value: Colors.White },
          { name: '⚫Noir', value: Colors.DarkButNotBlack },
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
      return interaction.reply({ content: `\`❌\` Veuillez donner à **${interaction.user.username}** la permission de \`Gérer les rôles\` !`, ephemeral: true });
    if (role.managed || role.id === interaction.guild.roles.everyone.id)
      return interaction.reply({ content: '`❌` Ce rôle ne peut pas être utilisé pour la vérification', ephemeral: true });
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && interaction.member.roles.highest.position < role.position)
      return interaction.reply({ content: '`❌` Vous ne pouvez pas utiliser un rôle supérieur au vôtre pour la vérification', ephemeral: true });
    if (!role.editable)
      return interaction.reply({ content: '`❌` Ce rôle est placé plus haut que le BOT, donc il ne peut pas être utilisé pour la vérification', ephemeral: true });

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(interaction.options.getString('description')?.replace('  ', '\n') || null)
          .setColor(interaction.options.getNumber('color') ?? Colors.Green)
          .setImage(interaction.options.getAttachment('image')?.url || null)
          .setFields({ name: 'Rôle attribué', value: role.toString() }),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().setComponents(
          new ButtonBuilder()
            .setCustomId(`kaori:verify-${verifyType}`)
            .setLabel('Vérifier')
            .setStyle(ButtonStyle.Success),
        ),
      ],
    });
  },
);

const verifyButton = new Button(
  { customId: /^kaori:verify-(button|image)/ },
  async (interaction) => {

    if (!interaction.inCachedGuild()) return;

    const roleId = interaction.message.embeds[0]?.fields[0]?.value?.match(/(?<=<@&)\d+(?=>)/)?.[0];
    const roles = interaction.member.roles;

    if (duringAuthentication.has(interaction.user.id))
      return interaction.reply({ content: '`❌` Vous êtes actuellement en cours de vérification. Vous ne pouvez pas lancer une nouvelle vérification avant d\'avoir terminé.', ephemeral: true });
    if (!roleId || !(roles instanceof GuildMemberRoleManager))
      return interaction.reply({ content: '`❌` Un problème est survenu lors de la vérification.', ephemeral: true });
    if (roles.cache.has(roleId))
      return interaction.reply({ content: '`✅` Vous êtes déjà vérifié.', ephemeral: true });

    if (interaction.customId === 'kaori:verify-button')
      roles.add(roleId, 'Vérification')
        .then(() => interaction.reply({ content: '`✅` Vérification réussie !', ephemeral: true }))
        .catch(() => interaction.reply({ content: '`❌` Impossible d\'attribuer le rôle. Veuillez contacter l\'administrateur du serveur.', ephemeral: true }));

    if (interaction.customId === 'kaori:verify-image') {
      await interaction.deferReply({ ephemeral: true });

      const fontBuffer = fs.readFileSync(path.resolve(__dirname, '../fonts/OpenSans-Regular.ttf'));
      const { image, text } = Captcha.create({ color: '#4b9d6e', font: fontBuffer }, {}, { amount: 5, blur: 25 }, { rotate: 15, skew: true });

      interaction.user
        .send({
          embeds: [
            new EmbedBuilder()
              .setAuthor({ name: `${interaction.guild.name} : Vérification d'image`, iconURL: interaction.guild.iconURL() ?? undefined })
              .setDescription([
                'Envoyez dans ce DM la chaîne de caractères en vert affichée dans l\'image ci-dessous.',
                '> ⚠️Si vous prenez trop de temps ou si vous faites plusieurs erreurs, vous devrez recommencer la vérification.',
              ].join('\n'))
              .setColor(Colors.Blurple)
              .setImage('attachment://kaori-captcha.jpeg')
              .setFooter({ text: 'Kaori ne vous demandera jamais de saisir un mot de passe ou de scanner un code QR.' }),
          ],
          files: [new AttachmentBuilder(image, { name: 'kaori-captcha.jpeg' })],
        })
        .then(() => {
          duringAuthentication.add(interaction.user.id);
          interaction.followUp({ content: '`📨` Continuez la vérification dans le DM.' });

          const collector = interaction.user.dmChannel!.createMessageCollector({ filter: v => v.author.id === interaction.user.id, time: 60_000, max: 3 });

          collector.on('collect', tryMessage => {
            if (tryMessage.content !== text) return;

            roles.add(roleId)
              .then(() => interaction.user.send('`✅` Vérification réussie !'))
              .catch(() => interaction.user.send('`❌` Vérification réussie mais impossible d\'attribuer le rôle. Veuillez contacter l\'administrateur du serveur.'))
              .finally(() => collector.stop());
          });

          collector.on('end', (collection) => {
            if (collection.size === 3) {
              interaction.user.send({ content: '`❌` Vous avez dépassé le nombre d\'essais. Vous pourrez réessayer dans `5 minutes`.' });
              setTimeout(() => duringAuthentication.delete(interaction.user.id), 300_000);
            } else
              duringAuthentication.delete(interaction.user.id);

          });
        })
        .catch(() => {
          interaction.followUp({ content: '`❌` Vous devez activer la réception de DM de la part du BOT pour effectuer cette vérification.', ephemeral: true });
        });
    }

  },
);

module.exports = [verifyCommand, verifyButton];