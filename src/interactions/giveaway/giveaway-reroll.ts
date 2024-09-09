import { ChatInput } from '@akki256/discord-interaction';
import Giveaway from '../../schemas/giveaway.schema';
import { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, Interaction, CacheType, StringSelectMenuInteraction } from 'discord.js';

const giveawayRerollCommand = new ChatInput(
  {
    name: 'giveaway-reroll',
    description: 'Reroll un giveaway',
  },
  async (interaction) => {
    const giveaways = await Giveaway.find();

    if (giveaways.length === 0) {
      return interaction.reply({ content: 'Aucun giveaway disponible.', ephemeral: true });
    }

    const menuOptions = giveaways.map(giveaway => ({
      label: `Giveaway: ${giveaway.prize}`,
      value: giveaway._id.toString(),
    }));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_giveaway_reroll')
      .setPlaceholder('Choisissez un giveaway à reroll')
      .addOptions(menuOptions);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    await interaction.reply({
      content: 'Choisissez un giveaway dans la liste :',
      components: [row],
      ephemeral: true,
    });

    const filter = (i: Interaction): i is StringSelectMenuInteraction<CacheType> =>
      i.isStringSelectMenu() && i.customId === 'select_giveaway_reroll' && i.user.id === interaction.user.id;

    const collector = interaction.channel?.createMessageComponentCollector({ filter, time: 60000 });

    collector?.on('collect', async (i: StringSelectMenuInteraction<CacheType>) => {
      const selectedGiveawayId = i.values[0];
      const selectedGiveaway = await Giveaway.findById(selectedGiveawayId);

      if (!selectedGiveaway) {
        return i.reply({ content: 'Le giveaway sélectionné n\'existe pas.', ephemeral: true });
      }

      if (selectedGiveaway.participants.length === 0) {
        return i.reply({ content: 'Aucun participant à ce giveaway.', ephemeral: true });
      }

      const newWinnerId = selectedGiveaway.participants[Math.floor(Math.random() * selectedGiveaway.participants.length)];
      const newWinner = await interaction.guild?.members.fetch(newWinnerId);

      const embed = new EmbedBuilder()
        .setTitle('🎉 Nouveau Gagnant ! 🎉')
        .setDescription(`Le nouveau gagnant est ${newWinner}! Félicitations !`)
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

export default giveawayRerollCommand;