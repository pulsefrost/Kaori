import { ChatInput } from '@akki256/discord-interaction';
import { ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, TextChannel, GuildChannel, CacheType, Interaction, StringSelectMenuInteraction } from 'discord.js';
import Giveaway from '../../schemas/giveaway.schema';
import { startGiveaway, endGiveaway } from '../../module/giveaway';

const giveawayCommand = new ChatInput(
  {
    name: 'giveaway',
    description: 'Gérer les giveaways',
    options: [
      {
        name: 'start',
        type: ApplicationCommandOptionType.Subcommand,
        description: 'Démarrer un giveaway',
        options: [
          {
            name: 'prize',
            type: ApplicationCommandOptionType.String,
            description: 'Le prix du giveaway',
            required: true,
          },
          {
            name: 'duration',
            type: ApplicationCommandOptionType.String,
            description: 'La durée du giveaway (ex: 1s, 1m, 1d, 1h, 1w)',
            required: true,
          },
          {
            name: 'channel',
            type: ApplicationCommandOptionType.Channel,
            description: "Le salon où envoyer l'embed du giveaway",
            required: true,
          },
        ],
      },
      {
        name: 'reroll',
        type: ApplicationCommandOptionType.Subcommand,
        description: 'Reroll un giveaway',
      },
      {
        name: 'participants',
        type: ApplicationCommandOptionType.Subcommand,
        description: 'Voir les participants d\'un giveaway',
      },
      {
        name: 'info',
        type: ApplicationCommandOptionType.Subcommand,
        description: 'Voir les informations d\'un giveaway',
      },
      {
        name: 'end',
        type: ApplicationCommandOptionType.Subcommand,
        description: 'Terminer un giveaway',
      },
      {
        name: 'cancel',
        type: ApplicationCommandOptionType.Subcommand,
        description: 'Annuler un giveaway',
      },
    ],
  },
  async (interaction) => {
    const Subcommand = interaction.options.getSubcommand();
    const giveaways = await Giveaway.find();

    if (Subcommand === 'start') {
      const prize = interaction.options.getString('prize');
      const duration = interaction.options.getString('duration');
      const channel = interaction.options.getChannel('channel') as GuildChannel | null;

      if (prize && duration && channel && channel instanceof TextChannel) {
        await startGiveaway(interaction, duration, prize, channel);
        await interaction.reply({ content: '🎉 Le giveaway a été lancé avec succès !', ephemeral: true });
      } else {
        await interaction.reply({ content: "Veuillez spécifier un salon textuel valide.", ephemeral: true });
      }
    } else if (giveaways.length === 0) {
      await interaction.reply({ content: 'Aucun giveaway disponible.', ephemeral: true });
    } else {
      const menuOptions = giveaways.map(giveaway => ({
        label: `Giveaway: ${giveaway.prize}`,
        value: giveaway._id.toString(),
      }));

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`select_giveaway_${Subcommand}`)
        .setPlaceholder('Choisissez un giveaway')
        .addOptions(menuOptions);

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

      await interaction.reply({
        content: 'Choisissez un giveaway dans la liste :',
        components: [row],
        ephemeral: true,
      });

      const filter = (i: Interaction): i is StringSelectMenuInteraction<CacheType> =>
        i.isStringSelectMenu() && i.customId === `select_giveaway_${Subcommand}` && i.user.id === interaction.user.id;

      const collector = interaction.channel?.createMessageComponentCollector({ filter, time: 60000 });

      collector?.on('collect', async (i: StringSelectMenuInteraction<CacheType>) => {
        const selectedGiveawayId = i.values[0];
        const selectedGiveaway = await Giveaway.findById(selectedGiveawayId);

        if (!selectedGiveaway) {
          return i.reply({ content: 'Le giveaway sélectionné n\'existe pas.', ephemeral: true });
        }

        if (Subcommand === 'reroll') {
          const newWinnerId = selectedGiveaway.participants[Math.floor(Math.random() * selectedGiveaway.participants.length)];
          const newWinner = await interaction.guild?.members.fetch(newWinnerId);

          const embed = new EmbedBuilder()
            .setTitle('🎉 Nouveau Gagnant ! 🎉')
            .setDescription(`Le nouveau gagnant est ${newWinner}! Félicitations !`)
            .setColor(0x7289da);

          await i.reply({ embeds: [embed], ephemeral: true });
        } else if (Subcommand === 'participants') {
          if (selectedGiveaway.participants.length === 0) {
            await i.reply({ content: 'Aucun participant pour ce giveaway.', ephemeral: true });
          } else {
            const participants = selectedGiveaway.participants.map((id: string) => `<@${id}>`).join('\n');
            const embed = new EmbedBuilder()
              .setTitle('🎉 Participants du Giveaway 🎉')
              .setDescription(participants)
              .setColor(0x7289da);

            await i.reply({ embeds: [embed], ephemeral: true });
          }
        } else if (Subcommand === 'info') {
          const embed = new EmbedBuilder()
            .setTitle('🎉 Informations du Giveaway 🎉')
            .addFields(
              { name: 'Prix', value: selectedGiveaway.prize, inline: true },
              { name: 'Participants', value: `${selectedGiveaway.participants.length}`, inline: true },
              { name: 'Date de fin', value: `${selectedGiveaway.endDate}`, inline: true }
            )
            .setColor(0x7289da);

          await i.reply({ embeds: [embed], ephemeral: true });
        } else if (Subcommand === 'end') {
          await endGiveaway(interaction, interaction.channel?.messages.cache.get(selectedGiveaway.messageId), selectedGiveaway.prize, selectedGiveaway._id.toString());
          await selectedGiveaway.delete();
          await i.reply({ content: 'Le giveaway a été terminé.', ephemeral: true });
        } else if (Subcommand === 'cancel') {
          const message = await interaction.channel?.messages.fetch(selectedGiveaway.messageId);
          if (message) {
            await message.delete();
          }
          await selectedGiveaway.delete();
          await i.reply({ content: 'Le giveaway a été annulé et supprimé avec succès.', ephemeral: true });
        }
      });

      collector?.on('end', collected => {
        if (collected.size === 0) {
          interaction.followUp({ content: 'Temps écoulé, veuillez réessayer.', ephemeral: true });
        }
      });
    }
  }
);

export default giveawayCommand;