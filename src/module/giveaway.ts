import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';  // Discord.js v14+
import { getTimeFromInput } from './functions'; // Fonction pour gérer la conversion de durée
import Giveaway from '../schemas/giveaway.schema'; // Importer le schéma de la base de données

let participants = new Set<string>();

export async function startGiveaway(interaction: any, duration: string, prize: string, emote?: string) {
    const endTime = Date.now() + getTimeFromInput(duration); // Convertit la durée en millisecondes
    const embed = new EmbedBuilder()
        .setTitle("🎉 Giveaway!")
        .setDescription(`Prix: **${prize}**\nClique sur le bouton pour participer !\nTermine <t:${Math.floor(endTime / 1000)}:R>`)
        .setColor("Random");

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('enter_giveaway')
            .setLabel('Participer')
            .setStyle(ButtonStyle.Primary)  // Utilisation des boutons
            .setDisabled(false)  // Le bouton est activé au départ
    );

    const giveawayMessage = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    if (emote) {
        await giveawayMessage.react(emote);
    }

    const newGiveaway = new Giveaway({
        messageId: giveawayMessage.id,
        channelId: interaction.channel.id,
        guildId: interaction.guild.id,
        prize,
        participants: [],
        endDate: new Date(endTime),
    });
    await newGiveaway.save();

    const filter = (i: any) => i.customId === 'enter_giveaway';
    const collector = giveawayMessage.createMessageComponentCollector({ filter, time: getTimeFromInput(duration) });

    collector.on('collect', (i: any) => {
        participants.add(i.user.id);
        i.reply({ content: 'Tu es inscrit au giveaway!', ephemeral: true });
    });

    collector.on('end', async () => {
        await endGiveaway(interaction, giveawayMessage, prize, newGiveaway._id.toString());
    });
}

export async function endGiveaway(interaction: any, message: any, prize: string, giveawayId: string) {
    if (participants.size === 0) {
        await message.edit({ content: "Aucun participant, le giveaway est annulé.", components: [] });
        await Giveaway.findByIdAndDelete(giveawayId); // Supprimer le giveaway de la base de données
        return;
    }

    const winnerId = Array.from(participants)[Math.floor(Math.random() * participants.size)];
    const winner = await interaction.guild?.members.fetch(winnerId);

    const embed = new EmbedBuilder()
        .setTitle("🎉 Giveaway terminé !")
        .setDescription(`Le gagnant de **${prize}** est ${winner} ! Félicitations !`)
        .setColor("Green");

    const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('enter_giveaway')
            .setLabel('Participer')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)  // Désactiver le bouton
    );

    await message.edit({ content: "🎉 Le giveaway est terminé ! 🎉", embeds: [embed], components: [disabledRow] });

    await interaction.followUp({ content: `🎉 Félicitations <@${winnerId}> ! Tu as gagné **${prize}** ! 🎉` });

    await Giveaway.findByIdAndDelete(giveawayId);  // Supprimer l'entrée de la base de données

    participants.clear(); // Réinitialisation pour de futurs giveaways
}