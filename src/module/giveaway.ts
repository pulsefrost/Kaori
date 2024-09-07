import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, TextChannel } from 'discord.js';  // Discord.js v14+
import { getTimeFromInput } from './functions'; // Fonction pour gérer la conversion de durée
import Giveaway from '../schemas/giveaway.schema'; // Importer le schéma de la base de données

export async function startGiveaway(interaction: any, duration: string, prize: string, channel: TextChannel) {
    const endTime = Date.now() + getTimeFromInput(duration); // Convertit la durée en millisecondes
    const embed = new EmbedBuilder()
        .setTitle("🎉 Giveaway!")
        .setDescription(`Prix: **${prize}**\nClique sur le bouton pour participer !\nTermine <t:${Math.floor(endTime / 1000)}:R>`)
        .setColor("#2F3136");

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('enter_giveaway')
            .setLabel('Participer')
            .setStyle(ButtonStyle.Primary)  // Utilisation des boutons
            .setDisabled(false)  // Le bouton est activé au départ
    );

    // Envoyer l'embed dans le salon spécifié
    const giveawayMessage = await channel.send({ embeds: [embed], components: [row] });

    // Sauvegarder le giveaway dans la base de données
    const newGiveaway = new Giveaway({
        messageId: giveawayMessage.id,
        channelId: channel.id,
        guildId: interaction.guild.id,
        prize,
        participants: [], // Initialiser la liste des participants
        endDate: new Date(endTime),
    });
    await newGiveaway.save();

    // Création d'un collecteur pour gérer les participations
    const filter = (i: any) => i.customId === 'enter_giveaway';
    const collector = giveawayMessage.createMessageComponentCollector({ filter, time: getTimeFromInput(duration) });

    collector.on('collect', async (i: any) => {
        const giveaway = await Giveaway.findById(newGiveaway._id);

        if (giveaway && !giveaway.participants.includes(i.user.id)) { // Ajout de la vérification de null
            giveaway.participants.push(i.user.id);
            await giveaway.save();  // Sauvegarder la participation dans la base de données
            i.reply({ content: 'Tu es inscrit au giveaway!', ephemeral: true });
        } else if (giveaway) {
            i.reply({ content: 'Tu es déjà inscrit au giveaway.', ephemeral: true });
        } else {
            i.reply({ content: "Le giveaway n'existe plus.", ephemeral: true });
        }
    });

    collector.on('end', async () => {
        await endGiveaway(interaction, giveawayMessage, prize, newGiveaway._id.toString());
    });
}

export async function endGiveaway(interaction: any, message: any, prize: string, giveawayId: string) {
    const giveaway = await Giveaway.findById(giveawayId);

    if (!giveaway || giveaway.participants.length === 0) { // Vérification de null pour 'giveaway'
        await message.edit({ content: "Aucun participant, le giveaway est annulé.", components: [] });
        await Giveaway.findByIdAndDelete(giveawayId); // Supprimer le giveaway de la base de données
        return;
    }

    // Si l'interaction n'a pas encore reçu de réponse, différer la réponse
    if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply({ ephemeral: true });
    }

    const winnerId = giveaway.participants[Math.floor(Math.random() * giveaway.participants.length)];
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

    // Répondre à l'interaction avec le gagnant
    await interaction.followUp({ content: `🎉 Félicitations <@${winnerId}> ! Tu as gagné **${prize}** ! 🎉` });

    await Giveaway.findByIdAndDelete(giveawayId);  // Supprimer l'entrée de la base de données
}
