import { ChatInput } from '@akki256/discord-interaction';
import { ApplicationCommandOptionType, Attachment, Colors, Embed, EmbedBuilder, PermissionFlagsBits, Webhook, resolveColor } from 'discord.js';
import axios from 'axios';
import { embedMakerType, getEmbedMakerButtons } from './embed/_function';

const command = new ChatInput(
  {
    name: 'embed',
    description: 'Crée un embed',
    options: [
      {
        name: 'create',
        description: 'Crée un nouvel embed',
        options: [
          {
            name: 'title',
            description: 'Titre de l\'embed',
            maxLength: 256,
            type: ApplicationCommandOptionType.String,
          },
          {
            name: 'description',
            description: 'Texte à afficher dans l\'embed (saut de ligne avec deux espaces)',
            maxLength: 4096,
            type: ApplicationCommandOptionType.String,
          },
          {
            name: 'color',
            description: 'Couleur de l\'embed',
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
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'import',
        description: 'Crée un embed à partir d\'un fichier JSON',
        options: [
          {
            name: 'json',
            description: 'Fichier JSON',
            type: ApplicationCommandOptionType.Attachment,
            required: true,
          },
        ],
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'profile',
        description: 'Modifie le profil lors de l\'envoi de l\'embed',
        options: [
          {
            name: 'name',
            description: 'Nom',
            maxLength: 100,
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: 'avatar',
            description: 'Icône',
            type: ApplicationCommandOptionType.Attachment,
          },
        ],
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
    defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
    dmPermission: false,
  },
  async (interaction) => {
    const subCommand = interaction.options.getSubcommand(true);

    if (!interaction.channel?.isTextBased())
      return interaction.reply({ content: '`❌` Impossible d\'utiliser cette commande dans ce canal.', ephemeral: true });

    if (subCommand === 'create') {
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      const color = interaction.options.getNumber('color');
      const attachment = interaction.options.getAttachment('image');

      if (!title && !description)
        return interaction.reply({ content: '`❌` Vous devez spécifier soit le `title` soit la `description`.', ephemeral: true });

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description?.replace('  ', '\n') || null)
        .setImage(attachment?.url || null)
        .setColor(color ?? Colors.White);

      interaction.reply({
        content: 'Utilisez `/embed profile` pour changer le profil de l\'expéditeur.',
        embeds: [embed],
        components: getEmbedMakerButtons(embed.data, embedMakerType.send),
        ephemeral: true,
      });
    }

    else if (subCommand === 'import') {
      const attachment = interaction.options.getAttachment('json', true);

      console.log(attachment.contentType);

      if (!attachment.contentType?.startsWith('application/json'))
        return interaction.reply({ content: '`❌` Le fichier attaché n\'est pas au format JSON.', ephemeral: true });
      if (attachment.size > 3000000)
        return interaction.reply({ content: '`❌` Impossible d\'importer un fichier JSON de plus de 3 Mo.', ephemeral: true });

      await interaction.deferReply({ ephemeral: true });
      let embeds = (await axios.get<Embed[] | Embed>(attachment.url)).data;
      if (!Array.isArray(embeds)) embeds = [embeds];

      interaction
        .followUp({
          content: 'Utilisez `/embed profile` pour changer le profil de l\'expéditeur.',
          embeds: embeds,
          components: getEmbedMakerButtons(embeds[0], embedMakerType.send),
        })
        .catch(() => interaction.followUp({ content: '`❌` L\'importation a échoué. Vérifiez que le fichier est valide.', ephemeral: true }));
    }

    else if (subCommand === 'profile') {
      const name = interaction.options.getString('name', true);
      const avatar = interaction.options.getAttachment('avatar');

      if (!interaction.appPermissions?.has(PermissionFlagsBits.ManageWebhooks))
        return interaction.reply({ content: '`❌` Vous devez avoir la permission `Gérer les webhooks` pour utiliser cette fonctionnalité.', ephemeral: true });
      if (avatar instanceof Attachment && (!avatar.contentType || !['image/png', 'image/jpeg'].includes(avatar.contentType)))
        return interaction.reply({ content: '`❌` L\'avatar doit être une image au format `jpeg` ou `png`.', ephemeral: true });

      await interaction.deferReply({ ephemeral: true });

      const webhook = await interaction.guild?.fetchWebhooks().then(wh => wh.find(v => v.owner?.id === interaction.client.user.id)).catch(() => null);
      const res = webhook instanceof Webhook
        ? await webhook.edit({ name, avatar: avatar?.url || null }).catch(() => null)
        : await interaction.guild?.channels.createWebhook({ name, avatar: avatar?.url || null, channel: interaction.channelId }).catch(() => null);

      if (res instanceof Webhook)
        interaction.followUp({
          content: '`✅` Profil modifié !',
          embeds: [
            new EmbedBuilder()
              .setAuthor({ name: res.name, iconURL: res.avatarURL() ?? interaction.client.rest.cdn.defaultAvatar(0) })
              .setColor(resolveColor('#2b2d31')),
          ],
          ephemeral: true,
        });

      else
        interaction.followUp({ content: '`❌` La modification du profil a échoué.', ephemeral: true });
    }
  },
);

module.exports = [command];
