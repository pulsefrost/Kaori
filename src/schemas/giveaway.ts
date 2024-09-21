import { Schema, model } from 'mongoose';

const giveawaySchema = new Schema({
  messageId: { type: String, required: true }, // ID du message Discord où le giveaway a été posté
  channelId: { type: String, required: true }, // ID du canal où le giveaway est en cours
  guildId: { type: String, required: true },   // ID du serveur
  prize: { type: String, required: true },     // Prix du giveaway
  participants: { type: [String], default: [] }, // Liste des participants
  endDate: { type: Date, required: true },     // Date de fin du giveaway
  startedBy: { type: String, required: true }, // ID de l'utilisateur qui a créé le giveaway (organisateur)
  createdAt: { type: Date, default: Date.now }, // Date de création du giveaway
  status: { type: String, enum: ['active', 'ended'], default: 'active' }, // État du giveaway
});

export default model('Giveaway', giveawaySchema);