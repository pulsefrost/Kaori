import { ChatInputCommandInteraction, Guild, PermissionsBitField } from 'discord.js';
import Config from '../../config.json';

const dangerPermissions = new Map([
  [ 'Administrator', 'Administrateur' ],
  [ 'KickMembers', 'Expulser des membres' ],
  [ 'BanMembers', 'Bannir des membres' ],
  [ 'ManageChannels', 'Gérer les canaux' ],
  [ 'ManageGuild', 'Gérer le serveur' ],
  [ 'ManageMessages', 'Gérer les messages' ],
  [ 'ManageRoles', 'Gérer les rôles' ],
  [ 'ManageWebhooks', 'Gérer les webhooks' ],
  [ 'ManageEmojisAndStickers', 'Gérer les emojis et stickers' ],
  [ 'ManageEvents', 'Gérer les événements' ],
  [ 'ManageThreads', 'Gérer les threads' ],
  [ 'ModerateMembers', 'Modérer les membres' ],
]);

export function isBlocked(guild: Guild | null): boolean {
  interface BlackListType { guilds: string[]; users: string[] }
  const blackList: BlackListType = Config.blackList;

  if (!guild) return false;
  return (blackList.guilds.includes(guild.id) || blackList.users.includes(guild.ownerId));
}

export function isURL(text: string): boolean {
  return (text.startsWith('http://') || text.startsWith('https://'));
}

export function omitString(text: string, limit: number): string {
  return text.length > limit ? `${text.substring(0, limit - 4)} ...` : text;
}

export function checkAndFormatDangerPermission(permissions: Readonly<PermissionsBitField>) {
  return permissions.toArray().map(v => dangerPermissions.get(v)).filter(Boolean);
}

export async function checkPermission(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!Config.admin.users.includes(interaction.user.id)) await interaction.reply({ content: '`❌` Vous n\'avez pas la permission d\'exécuter cette commande', ephemeral: true });
}
