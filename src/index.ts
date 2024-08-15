import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

import express from 'express';
import {
    ActivityType, AllowedMentionsTypes, Client, codeBlock, Colors,
    EmbedBuilder, Events, GatewayIntentBits, Partials, version, ClientOptions as DiscordClientOptions
} from 'discord.js';
import { DiscordInteractions, ErrorCodes, InteractionsError } from '@akki256/discord-interaction';
import { DiscordEvents } from './module/events';
import { guildId, admin } from '../config.json';
import { isBlocked } from './module/functions';
import mongoose from 'mongoose';
import cron from 'node-cron';
import changeVerificationLevel from './cron/changeVerificationLevel';
import ServerSettings from './schemas/ServerSettings';
import { Client as SelfbotClient, ClientOptions as SelfbotClientOptions } from 'discord.js-selfbot-v13';

// Configuration du serveur Express
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot is running');
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

// Type étendu pour les options du client
type ExtendedSelfbotClientOptions = SelfbotClientOptions & {
    // Ajouter des propriétés supplémentaires si nécessaire
    customProperty?: string;
};

// Fonction pour créer un client avec des options spécifiques
function createClient(options: ExtendedSelfbotClientOptions): SelfbotClient {
    return new SelfbotClient(options);
}

// Tableau des paires de client et de jeton
const clients: { client: SelfbotClient; token: string | undefined }[] = [
    //{ client: createClient({}), token: process.env.Camelia },
    //{ client: createClient({}), token: process.env.Masha },
    { client: createClient({}), token: process.env.Minji },
    //{ client: createClient({}), token: process.env.Cassidy },
    { client: createClient({}), token: process.env.Keii },
    { client: createClient({}), token: process.env.Frost },
    { client: createClient({}), token: process.env.Himeji },
];

// Fonction pour se connecter avec un jeton donné
async function connectClient(client: SelfbotClient, token: string | undefined): Promise<void> {
    if (token) {
        try {
            await client.login(token);
            console.log(`${client.user?.username} est connecté avec succès.`);
        } catch (error) {
            console.error(`Impossible de se connecter avec le jeton ${token}:`, error);
        }
    } else {
        console.error("Le jeton est indéfini.");
    }
}

// Connecte chaque client
clients.forEach(({ client, token }) => {
    connectClient(client, token);
});

// Initialisation du bot principal avec discord.js
const mainClient = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [
        Partials.Channel, Partials.GuildMember,
        Partials.Message, Partials.User,
    ],
    allowedMentions: {
        parse: [
            AllowedMentionsTypes.Role, AllowedMentionsTypes.User,
        ],
    },
} as DiscordClientOptions); // Cast to DiscordClientOptions

const events = new DiscordEvents(mainClient);
const interactions = new DiscordInteractions(mainClient);
interactions.loadRegistries(path.resolve(__dirname, './interactions'));

mainClient.once(Events.ClientReady, () => {
    console.log('[INFO] Le BOT est prêt !');
    console.table({
        'Utilisateur du BOT': mainClient.user?.tag,
        'Serveur(s)': `${mainClient.guilds.cache.size} Serveurs`,
        'En train d\'observer': `${mainClient.guilds.cache.reduce((a, b) => a + b.memberCount, 0)} Membres`,
        'Discord.js': `v${version}`,
        'Node.js': process.version,
        'Plateforme': `${process.platform} | ${process.arch}`,
        'Mémoire': `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} Mo | ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} Mo`,
    });

    interactions.registerCommands({ guildId: guildId ?? undefined, deleteNoLoad: true });
    events.register(path.resolve(__dirname, './events'));
    reloadActivity();

    cron.schedule('0 * * * *', () => changeVerificationLevel(mainClient));
});

mainClient.on(Events.GuildCreate, () => reloadActivity());
mainClient.on(Events.GuildDelete, async (guild) => {
    ServerSettings.deleteOne({ serverId: guild.id }).exec();
    reloadActivity();
});

mainClient.on(Events.InteractionCreate, interaction => {
    if (!interaction.isRepliable()) return;

    if (isBlocked(interaction.guild))
        interaction.reply({
            content: `\`🚫\` L'utilisation de ${interaction.client.user.username} sur ce serveur est interdite. Les réclamations peuvent être déposées [ici](https://discord.gg/fVcjCNn733)`,
            ephemeral: true,
        });

    interactions.run(interaction)
        .catch((err) => {
            if (err instanceof InteractionsError && err.code === ErrorCodes.CommandHasCoolTime)
                return interaction.reply({ content: '`⌛` La commande est en cooldown', ephemeral: true });
            console.log(err);
        });
});

process.on('uncaughtException', (err) => {
    console.error(err);

    mainClient.channels.fetch(admin.error).then(channel => {
        if (!channel?.isTextBased()) return;
        channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('`❌` Une exception a été levée')
                    .setDescription(codeBlock(`${err.stack}`))
                    .setColor(Colors.Red)
                    .setTimestamp(),
            ],
        }).catch(fetchError => {
            console.error('Failed to send error message:', fetchError);
        });
    }).catch(fetchError => {
        console.error('Failed to fetch admin channel:', fetchError);
    });
});

function reloadActivity() {
    mainClient.user?.setActivity({ name: `${mainClient.guilds.cache.size} Serveurs`, type: ActivityType.Competing });
}

mainClient.login(process.env.BOT_TOKEN).catch(err => {
    console.error('Failed to log in the main client:', err);
});

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DBNAME })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
    });
