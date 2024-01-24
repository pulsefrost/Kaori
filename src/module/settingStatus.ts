import { ButtonStyle, channelMention, formatEmoji, roleMention } from 'discord.js';
import { Emojis } from './constant';

const StatusEmoji = {
  enable: '1076014905922170900',
  disable: '1076014910686908467',
  sync: '1076014908946268191',
};

export function booleanStatus(boolean?: boolean): string {
  return boolean ? `${formatEmoji(StatusEmoji.enable)} **État:** Activé` : `${formatEmoji(StatusEmoji.disable)} **État:** Désactivé`;
}

export function channelStatus(channel?: (string | null)): string {
  return `${formatEmoji(Emojis.Gray.channel)} **Canal:** ${channel ? channelMention(channel) : 'Non défini'}`;
}

export function roleStatus(role?: (string | null)): string {
  return `${formatEmoji(Emojis.Gray.member)} **Rôle:** ${role ? roleMention(role) : 'Non défini'}`;
}

export function buttonLabelStatus(enable?: boolean): string {
  return enable ? 'Désactiver' : 'Activer';
}

export function buttonStyleStatus(enable?: boolean): number {
  return enable ? ButtonStyle.Danger : ButtonStyle.Success;
}
