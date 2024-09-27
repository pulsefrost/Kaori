import { Schema, model } from 'mongoose';

const profileSchema = new Schema({
  userId: { type: String, required: true, unique: true }, // ID de l'utilisateur
  firstName: { type: String, required: false }, // Prénom
  age: { type: Number, required: false }, // Âge
  country: { type: String, required: false }, // Pays
  origin: { type: String, required: false }, // Origine
  relationship: { type: String, required: false }, // Situation relationnelle
  birthday: { type: String, required: false }, // Date d'anniversaire (format JJ/MM)
  educationLevel: { type: String, required: false }, // Niveau scolaire
  hobbies: { type: String, required: false }, // Loisirs/Passions
  job: { type: String, required: false }, // Profession/Occupation
  quote: { type: String, required: false }, // Citation favorite
  languages: { type: String, required: false }, // Langues parlées
  skills: { type: String, required: false }, // Compétences spécifiques
  favorites: { type: String, required: false }, // Films/Livres/Jeux préférés
  lifeGoal: { type: String, required: false }, // Objectif de vie
  music: { type: String, required: false }, // Musique préférée
  mbti: { type: String, required: false }, // Type de personnalité (MBTI)
  nickname: { type: String, required: false }, // Surnom ou Username préféré
  favoriteColor: { type: String, required: false }, // Couleur préférée
  favoriteAnimal: { type: String, required: false }, // Animal préféré
  status: { type: String, required: false }, // Statut personnalisé
}, { timestamps: true }); // Ajoute des timestamps pour les dates de création et de mise à jour

export default model('Profile', profileSchema);