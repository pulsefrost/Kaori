import { Schema, model } from 'mongoose';

// Schéma pour sauvegarder les rappels configurés par les utilisateurs
const reminderSchema = new Schema({
  userId: { type: String, required: true }, // ID de l'utilisateur
  message: { type: String, required: true }, // Message du rappel
  remindAt: { type: Date, required: true }, // Date et heure à laquelle le rappel sera envoyé
  createdAt: { type: Date, default: Date.now }, // Date de création du rappel
  isSent: { type: Boolean, default: false }, // Statut du rappel (envoyé ou non)
});

export default model('Reminder', reminderSchema);