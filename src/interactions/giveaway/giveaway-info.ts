import { ChatInput } from '@akki256/discord-interaction';
import Giveaway from '../../schemas/giveaway.schema'; // Modèle de la base de données
import { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, StringSelectMenuInteraction, CacheType, Interaction } from 'discord.js';

const giveawayInfoCommand = new ChatInput(
  {
    name: 'giveaway-info',
    description: 'Voir les informations d\'un giveaway existant',
  },
  async (interaction) => {
    // Récupérer tous les giveaways de la base de données
    const giveaways = await Giveaway.find();

    if (giveaways.length === 0) {
      return interaction.reply({ content: 'Aucun giveaway disponible.', ephemeral: true });
    }

    // Créer un menu déroulant avec les titres de tous les giveaways disponibles
    const menuOptions = giveaways.map(giveaway => ({
      label: `Giveaway: ${giveaway.prize}`,
      value: giveaway._id.toString(), // Utiliser l'ID du giveaway comme valeur
    }));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_giveaway')
      .setPlaceholder('Choisissez un giveaway')
      .addOptions(menuOptions);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    await interaction.reply({
      content: 'Choisissez un giveaway dans la liste :',
      components: [row],
      ephemeral: true,
    });

    // Gérer l'interaction avec le menu déroulant
    const filter = (i: Interaction): i is StringSelectMenuInteraction<CacheType> =>
      i.isStringSelectMenu() && i.customId === 'select_giveaway' && i.user.id === interaction.user.id;

    const collector = interaction.channel?.createMessageComponentCollector({ filter, time: 60000 });

    collector?.on('collect', async (i: StringSelectMenuInteraction<CacheType>) => {
      const selectedGiveawayId = i.values[0];
      const selectedGiveaway = await Giveaway.findById(selectedGiveawayId);

      if (!selectedGiveaway) {
        return i.reply({ content: 'Le giveaway sélectionné n\'existe pas.', ephemeral: true });
      }

      // Afficher les informations du giveaway sélectionné
      const embed = new EmbedBuilder()
        .setTitle(`🎉 Informations du Giveaway 🎉`)
        .addFields(
          { name: 'Prix', value: selectedGiveaway.prize, inline: true },
          { name: 'Participants', value: `${selectedGiveaway.participants.length}`, inline: true },
          { name: 'Date de fin', value: `${selectedGiveaway.endDate}`, inline: true }
        )
        .setColor(0x7289da);

      await i.reply({ embeds: [embed], ephemeral: true });
    });

    collector?.on('end', collected => {
      if (collected.size === 0) {
        interaction.followUp({ content: 'Temps écoulé, veuillez réessayer.', ephemeral: true });
      }
    });
  }
);

export default giveawayInfoCommand;