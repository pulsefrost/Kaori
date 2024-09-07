import { ChatInput } from '@akki256/discord-interaction';
import Giveaway from '../../schemas/giveaway.schema';
import { endGiveaway } from '../../module/giveaway';
import { ActionRowBuilder, StringSelectMenuBuilder, Interaction, CacheType, StringSelectMenuInteraction } from 'discord.js';

const giveawayEndCommand = new ChatInput(
  {
    name: 'giveaway-end',
    description: 'Terminer un giveaway',
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
      .setCustomId('select_giveaway_end')
      .setPlaceholder('Choisissez un giveaway à terminer')
      .addOptions(menuOptions);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    await interaction.reply({
      content: 'Choisissez un giveaway dans la liste :',
      components: [row],
      ephemeral: true,
    });

    const filter = (i: Interaction): i is StringSelectMenuInteraction<CacheType> =>
      i.isStringSelectMenu() && i.customId === 'select_giveaway_end' && i.user.id === interaction.user.id;

    const collector = interaction.channel?.createMessageComponentCollector({ filter, time: 60000 });

    collector?.on('collect', async (i: StringSelectMenuInteraction<CacheType>) => {
      const selectedGiveawayId = i.values[0];
      const selectedGiveaway = await Giveaway.findById(selectedGiveawayId);

      if (!selectedGiveaway) {
        return i.reply({ content: 'Le giveaway sélectionné n\'existe pas.', ephemeral: true });
      }

      await endGiveaway(interaction, interaction.channel?.messages.cache.get(selectedGiveaway.messageId), selectedGiveaway.prize, selectedGiveaway._id.toString());

      await selectedGiveaway.delete();

      await i.reply({ content: 'Le giveaway a été terminé.', ephemeral: true });
    });

    collector?.on('end', collected => {
      if (collected.size === 0) {
        interaction.followUp({ content: 'Temps écoulé, veuillez réessayer.', ephemeral: true });
      }
    });
  }
);

export default giveawayEndCommand;