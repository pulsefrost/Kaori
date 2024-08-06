import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

import { ActivityType, AllowedMentionsTypes, Client, codeBlock, Colors, EmbedBuilder, Events, GatewayIntentBits, Partials, version, ClientOptions as DiscordClientOptions } from 'discord.js';
import { DiscordInteractions, ErrorCodes, InteractionsError } from '@akki256/discord-interaction';
import { DiscordEvents } from './module/events';
import { guildId, admin } from '../config.json';
import { isBlocked } from './module/functions';
import mongoose from 'mongoose';
import cron from 'node-cron';
import changeVerificationLevel from './cron/changeVerificationLevel';
import ServerSettings from './schemas/ServerSettings';
import { Client as SelfbotClient } from 'discord.js-selfbot-v13';

// Type for the options parameter for SelfbotClient
interface SelfbotClientOptions {
  // Define other properties if needed
}

// Fonction pour créer un client avec des options spécifiques
function createClient(options: SelfbotClientOptions): SelfbotClient {
    return new SelfbotClient(options);
}

// Type for the client object
interface ClientTokenPair {
    client: SelfbotClient;
    token: string | undefined;
}

// Tableau des paires de client et de jeton
const clients: ClientTokenPair[] = [
    { client: createClient({}), token: process.env.Camelia },
    //{ client: createClient({}), token: process.env.Masha },
    { client: createClient({}), token: process.env.Minji },
    { client: createClient({}), token: process.env.Cassidy },
    { client: createClient({}), token: process.env.Keii },
    { client: createClient({}), token: process.env.Frost },
    { client: createClient({}), token: process.env.Maxcense },
    { client: createClient({}), token: process.env.Himeji },
    { client: createClient({}), token: process.env.Chino }
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
        });
    });
});

function reloadActivity() {
    mainClient.user?.setActivity({ name: `${mainClient.guilds.cache.size} Serveurs`, type: ActivityType.Competing });
}

mainClient.login(process.env.BOT_TOKEN);
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DBNAME });