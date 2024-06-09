# Utiliser une image de base officielle de Node.js
FROM node:18

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier le fichier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances du projet
RUN npm install

# Copier le reste de l'application
COPY . .

# Compiler l'application TypeScript
RUN npm run build

# Exposer le port sur lequel l'application va fonctionner
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["npm", "start"]
