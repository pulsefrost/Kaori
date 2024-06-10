# Utiliser l'image officielle de Node.js version 18
FROM node:18

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier package.json et package-lock.json (si disponible)
COPY package*.json ./

# Installer les dépendances du projet
RUN npm install

# Copier le reste des fichiers de l'application
COPY . .

# Compiler le code TypeScript en JavaScript
RUN npm run build

# Exposer le port que votre application utilise
EXPOSE 3000

# Démarrer l'application
CMD ["node", "build/src/index.js"]
