import { Schema, model } from 'mongoose';

const bumpReminderSchema = new Schema({
  serverId: { type: String, required: true }, // ID du serveur
  bumpChannel: { type: String, required: false }, // ID du salon où envoyer les rappels de bump
  bumpRole: { type: String, required: false }, // ID du rôle à mentionner
  reminderTime: { type: Date, required: true }, // Temps du prochain rappel
});

export default model('BumpReminder', bumpReminderSchema);