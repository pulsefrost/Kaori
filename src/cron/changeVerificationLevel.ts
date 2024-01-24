import { Client, Colors, EmbedBuilder, Guild, inlineCode } from 'discord.js';
import { Document } from 'mongoose';
import ServerSettings, { IServerSettings } from '../schemas/ServerSettings';

const verificationLevelData = [
  { name: 'Ne pas défini', description: 'Illimité' },
  { name: 'Faible', description: 'Uniquement les comptes avec une vérification par e-mail' },
  { name: 'Moyen', description: 'Comptes enregistrés sur Discord depuis plus de 5 minutes uniquement' },
  { name: 'Élevé', description: 'Membres de ce serveur depuis plus de 10 minutes uniquement' },
  { name: 'Maximum', description: 'Uniquement les comptes avec une vérification téléphonique' },
];

const start = async (client: Client, hour: number) => {
  const Settings = await ServerSettings.find({ 'changeVerificationLevel.enable': true, 'changeVerificationLevel.time.start': hour });

  for await (const Setting of Settings) {
    const guild = await client.guilds.fetch(Setting.serverId).catch(() => null);
    const level = Setting.changeVerificationLevel.level.new;
    if (!guild || level == null) return;

    Setting.changeVerificationLevel.level.old = guild.verificationLevel;
    await Setting.save({ wtimeout: 1_500 });

    guild.setVerificationLevel(level)
      .then(() => sendLog(guild, Setting, level, 'Début'))
      .catch(() => { });
  }
};

const end = async (client: Client, hour: number) => {
  const Settings = await ServerSettings.find({ 'changeVerificationLevel.enable': true, 'changeVerificationLevel.time.end': hour });

  for await (const Setting of Settings) {
    const guild = await client.guilds.fetch(Setting.serverId).catch(() => null);
    const level = Setting.changeVerificationLevel.level.old;
    if (!guild || level == null) return;

    guild.setVerificationLevel(level)
      .then(() => sendLog(guild, Setting, level, 'Fin'))
      .catch(() => { });
  }
};

async function sendLog(guild: Guild, setting: (Document<unknown, unknown, IServerSettings> & IServerSettings), level: number, label: string) {
  if (!setting.changeVerificationLevel.log.enable || !setting.changeVerificationLevel.log.channel) return;

  const channel = await guild.channels.fetch(setting.changeVerificationLevel.log.channel).catch(() => null);
  if (!channel?.isTextBased()) return;

  channel
    .send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`\`✅\` Modification automatique du niveau de vérification - ${label}`)
          .setDescription([
            `Le niveau de vérification du serveur a été changé en **${verificationLevelData[level].name}**`,
            inlineCode(verificationLevelData[level].description),
          ].join('\n'))
          .setColor(Colors.Green),
      ],
    })
    .catch(() => { });
}

export default (client: Client) => [start, end].forEach(v => v(client, (new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000))).getHours()));
