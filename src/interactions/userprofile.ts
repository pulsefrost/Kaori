import { ApplicationCommandOptionType, Colors, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ApplicationCommandType, ButtonInteraction, ModalSubmitInteraction } from 'discord.js';
import { ChatInput } from '@akki256/discord-interaction';
import Profile from '../schemas/Profile'; // Schéma correct pour le profil

// Commande principale /profil avec sous-commandes "configurer" et "voir"
const profileCommand = new ChatInput(
  {
    name: 'profil',
    description: 'Gérer votre profil',
    options: [
      {
        name: 'configurer',
        description: 'Configurer ou mettre à jour votre profil',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'voir',
        description: 'Voir votre profil ou celui d\'un autre utilisateur',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'utilisateur',
            description: 'Utilisateur dont vous voulez voir le profil',
            type: ApplicationCommandOptionType.User,
            required: false,
          },
        ],
      },
    ],
  },
  { coolTime: 5000 },
  async (interaction) => {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'configurer') {
      const embed = new EmbedBuilder()
        .setTitle('Configurer votre profil')
        .setDescription('Choisissez une section à configurer :')
        .setColor(Colors.Blue);

      // Création des boutons pour chaque section
      const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('personalInfo')
          .setLabel('Informations personnelles')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('hobbies')
          .setLabel('Loisirs/Passions')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('job')
          .setLabel('Profession/Occupation')
          .setStyle(ButtonStyle.Primary),
      );

      await interaction.reply({
        embeds: [embed],
        components: [buttons],
        ephemeral: true,
      });
    }

    if (subcommand === 'voir') {
      const targetUser = interaction.options.getUser('utilisateur') || interaction.user;
      const profile = await Profile.findOne({ userId: targetUser.id });

      if (!profile) {
        return interaction.reply({
          content: "Ce membre n'a pas encore configuré son profil.",
          ephemeral: true,
        });
      }

      // Fonction pour tronquer les champs trop longs
      const truncateField = (field: string | undefined, maxLength = 1024) => {
        if (!field) return 'Non renseigné';
        return field.length > maxLength ? `${field.substring(0, maxLength - 3)}...` : field;
      };

      // Création d'un seul embed pour toutes les informations modifiables
      const profileEmbed = new EmbedBuilder()
        .setTitle(`Profil de ${targetUser.username}`)
        .setColor(Colors.Blue)
        .addFields(
          { name: 'Prénom', value: truncateField(profile.firstName), inline: true },
          { name: 'Âge', value: truncateField(profile.age ? `${profile.age} ans` : 'Non renseigné'), inline: true },
          { name: 'Pays', value: truncateField(profile.country), inline: true },
          { name: 'Loisirs/Passions', value: truncateField(profile.hobbies), inline: false },
          { name: 'Profession/Occupation', value: truncateField(profile.job), inline: false },
        )
        .setFooter({ text: `Profil de ${targetUser.tag}` })
        .setTimestamp();

      await interaction.reply({ embeds: [profileEmbed], ephemeral: true });
    }
  }
);

// Gérer les interactions de boutons
const handleButtonInteraction = async (interaction: ButtonInteraction) => {
  if (!interaction.isButton()) return;

  const customId = interaction.customId;

  if (customId === 'personalInfo') {
    const modal = {
      custom_id: 'personalInfoModal',
      title: 'Informations personnelles',
      components: [
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: 'firstName',
              label: 'Prénom',
              style: 1, // Short
              required: true,
            },
            {
              type: 4,
              custom_id: 'age',
              label: 'Âge',
              style: 1, // Short
              required: true,
            },
            {
              type: 4,
              custom_id: 'country',
              label: 'Pays',
              style: 1, // Short
            },
          ],
        },
      ],
    };
    await interaction.showModal(modal);
  }

  if (customId === 'hobbies') {
    const modal = {
      custom_id: 'hobbiesModal',
      title: 'Loisirs/Passions',
      components: [
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: 'hobbies',
              label: 'Loisirs/Passions',
              style: 2, // Paragraph
              required: false,
            },
          ],
        },
      ],
    };
    await interaction.showModal(modal);
  }

  if (customId === 'job') {
    const modal = {
      custom_id: 'jobModal',
      title: 'Profession/Occupation',
      components: [
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: 'job',
              label: 'Profession/Occupation',
              style: 1, // Short
              required: false,
            },
          ],
        },
      ],
    };
    await interaction.showModal(modal);
  }
};

// Gérer la soumission des modals
const handleModalSubmit = async (interaction: ModalSubmitInteraction) => {
  if (!interaction.isModalSubmit()) return;

  const customId = interaction.customId;

  if (customId === 'personalInfoModal') {
    const firstName = interaction.fields.getTextInputValue('firstName');
    const age = interaction.fields.getTextInputValue('age');
    const country = interaction.fields.getTextInputValue('country');

    await Profile.updateOne(
      { userId: interaction.user.id },
      { $set: { firstName, age, country } },
      { upsert: true }
    );

    await interaction.reply({
      content: 'Vos informations personnelles ont été mises à jour avec succès.',
      ephemeral: true,
    });
  }

  if (customId === 'hobbiesModal') {
    const hobbies = interaction.fields.getTextInputValue('hobbies');

    await Profile.updateOne(
      { userId: interaction.user.id },
      { $set: { hobbies } },
      { upsert: true }
    );

    await interaction.reply({
      content: 'Vos loisirs/passions ont été mis à jour avec succès.',
      ephemeral: true,
    });
  }

  if (customId === 'jobModal') {
    const job = interaction.fields.getTextInputValue('job');

    await Profile.updateOne(
      { userId: interaction.user.id },
      { $set: { job } },
      { upsert: true }
    );

    await interaction.reply({
      content: 'Votre profession/occupation a été mise à jour avec succès.',
      ephemeral: true,
    });
  }
};

// Exportation directe des commandes et événements dans un tableau, comme tu le fais
module.exports = [
  profileCommand,
  { name: 'interactionCreate', execute: handleButtonInteraction },
  { name: 'interactionCreate', execute: handleModalSubmit }
];