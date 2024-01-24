import { Client, Colors, EmbedBuilder, Guild, inlineCode } from 'discord.js';
import { Document } from 'mongoose';
import ServerSettings, { IServerSettings } from '../schemas/ServerSettings';

const donnéesNiveauVérification = [
  { name: 'Non défini', description: 'Illimité' },
  { name: 'Faible', description: 'Comptes avec vérification par e-mail uniquement' },
  { name: 'Moyen', description: 'Comptes inscrits sur Discord depuis plus de 5 minutes uniquement' },
  { name: 'Élevé', description: 'Membres du serveur depuis plus de 10 minutes uniquement' },
  { name: 'Extrême', description: 'Comptes avec vérification par téléphone uniquement' },
];

const démarrer = async (client: Client, heure: number) => {
  const paramètres = await ServerSettings.find({ 'changeVerificationLevel.enable': true, 'changeVerificationLevel.time.start': heure });

  for await (const paramètre of paramètres) {
    const serveur = await client.guilds.fetch(paramètre.serverId).catch(() => null);
    const niveau = paramètre.changeVerificationLevel.level.new;
    if (!serveur || niveau == null) return;

    paramètre.changeVerificationLevel.level.old = serveur.verificationLevel;
    await paramètre.save({ wtimeout: 1_500 });

    serveur.setVerificationLevel(niveau)
      .then(() => envoyerJournal(serveur, paramètre, niveau, 'Démarrage'))
      .catch(() => { });
  }
};

const fin = async (client: Client, heure: number) => {
  const paramètres = await ServerSettings.find({ 'changeVerificationLevel.enable': true, 'changeVerificationLevel.time.end': heure });

  for await (const paramètre of paramètres) {
    const serveur = await client.guilds.fetch(paramètre.serverId).catch(() => null);
    const niveau = paramètre.changeVerificationLevel.level.old;
    if (!serveur || niveau == null) return;

    serveur.setVerificationLevel(niveau)
      .then(() => envoyerJournal(serveur, paramètre, niveau, 'Fin'))
      .catch(() => { });
  }
};

async function envoyerJournal(serveur: Guild, paramètre: (Document<unknown, unknown, IServerSettings> & IServerSettings), niveau: number, libellé: string) {
  if (!paramètre.changeVerificationLevel.log.enable || !paramètre.changeVerificationLevel.log.channel) return;

  const canal = await serveur.channels.fetch(paramètre.changeVerificationLevel.log.channel).catch(() => null);
  if (!canal?.isTextBased()) return;

  canal
    .send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`\`✅\` Modification automatique du niveau de vérification - ${libellé}`)
          .setDescription([
            `Le niveau de vérification du serveur a été changé en **${donneesNiveauVérification[niveau].name}**`,
            inlineCode(donneesNiveauVérification[niveau].description),
          ].join('\n'))
          .setColor(Colors.Green),
      ],
    })
    .catch(() => { });
}

export default (client: Client) => [démarrer, fin].forEach(v => v(client, (new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000))).getHours()));
