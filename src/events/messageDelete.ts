import { Client, Message } from 'discord.js';
import Giveaway from '../schemas/giveaway'; // Importer le schéma de la base de données

module.exports = {
  name: 'messageDelete',
  async execute(message: Message, client: Client) {
    if (!message.guild) return; // Assurez-vous que le message appartient à un serveur

    // Chercher le giveaway dans la base de données par l'ID du message supprimé
    const giveaway = await Giveaway.findOne({ messageId: message.id });

    if (giveaway) {
      // Si un giveaway correspond à ce message, le supprimer de la base de données
      await Giveaway.findByIdAndDelete(giveaway._id);
      console.log(`Giveaway avec le message ID ${message.id} supprimé de la base de données.`);
    }
  },
};