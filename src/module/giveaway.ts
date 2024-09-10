import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, TextChannel, StringSelectMenuBuilder, StringSelectMenuInteraction, PermissionsBitField } from 'discord.js';  // Discord.js v14+
import { getTimeFromInput } from './functions'; // Fonction pour gérer la conversion de durée
import Giveaway from '../schemas/giveaway.schema'; // Importer le schéma de la base de données

// Fonction pour démarrer un giveaway
export async function startGiveaway(interaction: any, duration: string, prize: string, channel: TextChannel) {
    const endTime = Date.now() + getTimeFromInput(duration); // Convertit la durée en millisecondes
    const embed = new EmbedBuilder()
        .setTitle("🎉 Giveaway!")
        .setDescription(`Prix: **${prize}**\nOrganisé par: <@${interaction.user.id}>\nClique sur le bouton pour participer !\nTermine <t:${Math.floor(endTime / 1000)}:R>`)
        .setColor(0x2f3136); // Couleur de fond des embeds Discord

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('enter_giveaway')
            .setLabel('Participer')
            .setStyle(ButtonStyle.Primary)  // Utilisation des boutons
            .setDisabled(false)  // Le bouton est activé au départ
    );

    // Ajout du SelectMenu pour voir la liste des participants, quitter, reroll, ou supprimer le giveaway
    const selectMenuRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('giveaway_menu')
            .setPlaceholder('Options de gestion du giveaway')
            .addOptions([
                {
                    label: 'Voir les participants',
                    value: 'view_participants',
                    description: 'Afficher la liste des participants',
                    emoji: '<:participants:1282880025116278844>',
                },
                {
                    label: 'Quitter le giveaway',
                    value: 'leave_giveaway',
                    description: 'Se désinscrire du giveaway',
                    emoji: '<:leave:1282880017533108235>',
                },
                {
                    label: 'Reroll le giveaway',
                    value: 'reroll_giveaway',
                    description: 'Reroll le giveaway pour choisir un nouveau gagnant',
                    emoji: '<:reroll:1282880031793610763>',
                },
                {
                    label: 'Supprimer le giveaway',
                    value: 'delete_giveaway',
                    description: 'Supprimer le giveaway définitivement',
                    emoji: '<:delete:1282880442332352602>',
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
        time: getTimeFromInput(duration)
    });

    menuCollector.on('collect', async (i: StringSelectMenuInteraction) => {
        const giveaway = await Giveaway.findById(newGiveaway._id);

        if (!giveaway) {
            i.reply({ content: "Le giveaway n'existe plus.", ephemeral: true });
            return;
        }

        if (i.values[0] === 'view_participants') {
            // Voir la liste des participants en embed
            const participantsList = giveaway.participants.length > 0
                ? giveaway.participants.map((id: string) => `<@${id}>`).join('\n')
                : 'Aucun participant pour le moment.';
            
            const participantsEmbed = new EmbedBuilder()
                .setTitle("Liste des participants")
                .setDescription(participantsList)
                .setColor(0x2f3136); // Couleur de fond des embeds Discord

            i.reply({ embeds: [participantsEmbed], ephemeral: true });
        } else if (i.values[0] === 'leave_giveaway') {
            // Quitter le giveaway
            if (giveaway.participants.includes(i.user.id)) {
                giveaway.participants = giveaway.participants.filter((id: string) => id !== i.user.id);
                await giveaway.save();
                i.reply({ content: "Tu as quitté le giveaway.", ephemeral: true });
            } else {
                i.reply({ content: "Tu n'es pas inscrit au giveaway.", ephemeral: true });
            }
        } else if (i.values[0] === 'reroll_giveaway') {
            // Reroll le giveaway (autorisé pour ceux ayant la permission de gérer les messages)
            if (!i.memberPermissions?.has(PermissionsBitField.Flags.ManageMessages)) {
                return i.reply({ content: "Seuls ceux ayant la permission de gérer les messages peuvent reroll ce giveaway.", ephemeral: true });
            }
            await rerollGiveaway(i, giveawayMessage, prize, newGiveaway._id.toString());
        } else if (i.values[0] === 'delete_giveaway') {
            // Supprimer le giveaway (autorisé pour ceux ayant la permission de gérer les messages)
            if (!i.memberPermissions?.has(PermissionsBitField.Flags.ManageMessages)) {
                return i.reply({ content: "Seuls ceux ayant la permission de gérer les messages peuvent supprimer ce giveaway.", ephemeral: true });
            }
            await deleteGiveaway(i, giveawayMessage, newGiveaway._id.toString());
        }
    });

    // Fin du giveaway
    collector.on('end', async () => {
        await endGiveaway(interaction, giveawayMessage, prize, newGiveaway._id.toString());
    });
}

// Fonction pour reroll un giveaway
export async function rerollGiveaway(interaction: any, message: any, prize: string, giveawayId: string) {
    const giveaway = await Giveaway.findById(giveawayId);

    if (!giveaway || giveaway.participants.length === 0) {
        return interaction.reply({ content: "Impossible de reroll, il n'y a aucun participant.", ephemeral: true });
    }

    const newWinnerId = giveaway.participants[Math.floor(Math.random() * giveaway.participants.length)];
    const newWinner = await interaction.guild?.members.fetch(newWinnerId);

    const embed = new EmbedBuilder()
        .setTitle("<:gift:1282878733157531669> Giveaway rerollé !")
        .setDescription(`Le nouveau gagnant de **${prize}** est <@${newWinnerId}> ! Félicitations !`)
        .setColor(0x2f3136); // Couleur de fond des embeds Discord

    await message.edit({ embeds: [embed] });

    return interaction.reply({ content: `🎉 Le giveaway a été rerollé et <@${newWinnerId}> est le nouveau gagnant !`, ephemeral: true });
}

// Fonction pour supprimer un giveaway
export async function deleteGiveaway(interaction: any, message: any, giveawayId: string) {
    const giveaway = await Giveaway.findByIdAndDelete(giveawayId);

    if (!giveaway) {
        return interaction.reply({ content: "Le giveaway n'existe plus ou a déjà été supprimé.", ephemeral: true });
    }

    await message.delete();
    return interaction.reply({ content: "Le giveaway a été supprimé avec succès.", ephemeral: true });
}

// Fonction pour terminer un giveaway
export async function endGiveaway(interaction: any, message: any, prize: string, giveawayId: string) {
    const giveaway = await Giveaway.findById(giveawayId);

    if (!giveaway || giveaway.participants.length === 0) { // Vérification de null pour 'giveaway'
        await message.edit({ content: "Aucun participant, le giveaway est annulé.", components: [] });
        return;
    }

    const winnerId = giveaway.participants[Math.floor(Math.random() * giveaway.participants.length)];
    const winner = await interaction.guild?.members.fetch(winnerId);

    const embed = new EmbedBuilder()
        .setTitle("<:gift:1282878733157531669> Giveaway terminé !")
        .setDescription(`Le gagnant de **${prize}** est <@${winnerId}> ! Félicitations !\nOrganisé par : <@${giveaway.startedBy}>`)
        .setColor(0x2f3136); // Couleur de fond des embeds Discord

    const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('enter_giveaway')
            .setLabel('Participer')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)  // Désactiver le bouton
    );

    await message.edit({ content: "<:gift:1282878733157531669> Le giveaway est terminé ! 🎉", embeds: [embed], components: [disabledRow] });

    // Répondre à l'interaction avec le gagnant
    await interaction.followUp({ content: `<:gift:1282878733157531669> Félicitations <@${winnerId}> ! Tu as gagné **${prize}** !` });

    // Envoi d'un MP au gagnant
    try {
        await winner.send({
            content: `<:gift:1282878733157531669> Félicitations ${winner.user.tag} ! Tu as gagné la lotterie **${prize}** dans le giveaway organisé sur ${interaction.guild.name} !`,
            embeds: [
                new EmbedBuilder()
                    .setTitle("<:gift:1282878733157531669> Bravo !")
                    .setDescription(`Nous te contacterons bientôt pour te remettre le prix **${prize}**.\nMerci d'avoir participé au giveaway organisé par <@${giveaway.startedBy}> !`)
                    .setColor(0x2f3136)
            ]
        });
    } catch (error) {
        console.error(`Erreur lors de l'envoi du message privé au gagnant : ${error}`);
    }
}