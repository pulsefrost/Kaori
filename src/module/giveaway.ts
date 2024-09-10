import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, TextChannel, StringSelectMenuBuilder, StringSelectMenuInteraction } from 'discord.js';  // Discord.js v14+
import { getTimeFromInput } from './functions'; // Fonction pour gérer la conversion de durée
import Giveaway from '../schemas/giveaway.schema'; // Importer le schéma de la base de données

// Fonction pour démarrer un giveaway
export async function startGiveaway(interaction: any, duration: string, prize: string, channel: TextChannel) {
    const endTime = Date.now() + getTimeFromInput(duration); // Convertit la durée en millisecondes
    const embed = new EmbedBuilder()
        .setTitle("🎉 Giveaway!")
        .setDescription(`Prix: **${prize}**\nOrganisé par: <@${interaction.user.id}>\nClique sur le bouton pour participer !\nTermine <t:${Math.floor(endTime / 1000)}:R>`)
        .setColor("#2F3136");

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('enter_giveaway')
            .setLabel('Participer')
            .setStyle(ButtonStyle.Primary)  // Utilisation des boutons
            .setDisabled(false)  // Le bouton est activé au départ
    );

    // Ajout du SelectMenu pour voir la liste des participants ou quitter le giveaway
    const selectMenuRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('giveaway_menu')
            .setPlaceholder('Voir les participants ou quitter le giveaway')
            .addOptions([
                {
                    label: 'Voir les participants',
                    value: 'view_participants',
                    description: 'Afficher la liste des participants',
                },
                {
                    label: 'Quitter le giveaway',
                    value: 'leave_giveaway',
                    description: 'Se désinscrire du giveaway',
                },
            ])
    );

    // Envoyer l'embed dans le salon spécifié
    const giveawayMessage = await channel.send({ embeds: [embed], components: [row, selectMenuRow] });

    // Sauvegarder le giveaway dans la base de données
    const newGiveaway = new Giveaway({
        messageId: giveawayMessage.id,
        channelId: channel.id,
        guildId: interaction.guild.id,
        prize,
        participants: [], // Initialiser la liste des participants
        endDate: new Date(endTime),
        startedBy: interaction.user.id, // Ajouter l'organisateur du giveaway
    });
    await newGiveaway.save();

    // Création d'un collecteur pour gérer les participations via le bouton
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

    // Création d'un collecteur pour gérer le SelectMenu
    const menuFilter = (i: any): i is StringSelectMenuInteraction => {
        return i.isStringSelectMenu() && i.customId === 'giveaway_menu';
    };
    
    const menuCollector = giveawayMessage.createMessageComponentCollector({
        filter: menuFilter,  // Utilisation correcte de 'filter'
        time: getTimeFromInput(duration),
    });    

    menuCollector.on('collect', async (i: StringSelectMenuInteraction) => {
        const giveaway = await Giveaway.findById(newGiveaway._id);

        if (!giveaway) {
            i.reply({ content: "Le giveaway n'existe plus.", ephemeral: true });
            return;
        }

        if (i.values[0] === 'view_participants') {
            // Voir la liste des participants
            const participantsList = giveaway.participants.length > 0
                ? giveaway.participants.map((id: string) => `<@${id}>`).join('\n')
                : 'Aucun participant pour le moment.';
            i.reply({ content: `Liste des participants :\n${participantsList}`, ephemeral: true });
        } else if (i.values[0] === 'leave_giveaway') {
            // Quitter le giveaway
            if (giveaway.participants.includes(i.user.id)) {
                giveaway.participants = giveaway.participants.filter((id: string) => id !== i.user.id);
                await giveaway.save();
                i.reply({ content: "Tu as quitté le giveaway.", ephemeral: true });
            } else {
                i.reply({ content: "Tu n'es pas inscrit au giveaway.", ephemeral: true });
            }
        }
    });

    // Fin du giveaway
    collector.on('end', async () => {
        await endGiveaway(interaction, giveawayMessage, prize, newGiveaway._id.toString());
    });
}

// Fonction pour terminer un giveaway
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

    // Envoi d'un MP au gagnant
    try {
        await winner.send({
            content: `🎉 Félicitations ${winner.user.tag} ! Tu as gagné **${prize}** dans le giveaway organisé sur ${interaction.guild.name} ! 🎁`,
            embeds: [
                new EmbedBuilder()
                    .setTitle("🎉 Bravo !")
                    .setDescription(`Nous te contacterons bientôt pour te remettre **${prize}**.\nMerci d'avoir participé au giveaway organisé par <@${giveaway.startedBy}> !`)
                    .setColor("Gold")
            ]
        });
    } catch (error) {
        console.error(`Erreur lors de l'envoi du message privé au gagnant : ${error}`);
    }

    await Giveaway.findByIdAndDelete(giveawayId);  // Supprimer l'entrée de la base de données
}