import { ButtonStyle, channelMention, formatEmoji, roleMention } from 'discord.js';
import { Emojis } from './constant';

const StatusEmoji = {
  enable: '1251318815187537951',
  disable: '1251318812758900817',
  sync: '1251319301109977172',
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