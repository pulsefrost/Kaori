import { AuditLogEvent, Colors, EmbedBuilder, Events, formatEmoji, User } from 'discord.js';
import { Emojis } from '../../module/constant';
import { DiscordEventBuilder } from '../../module/events';
import { isBlocked } from '../../module/functions';
import { getServerSetting } from '../../module/mongo/middleware';

const kickLog = new DiscordEventBuilder({
  type: Events.GuildAuditLogEntryCreate,
  execute: async (auditLog, guild) => {
    if (isBlocked(guild) || auditLog.targetId === guild.client.user.id) return;
    if (auditLog.action !== AuditLogEvent.MemberKick || !(auditLog.target instanceof User)) return;

    const setting = await getServerSetting(guild.id, 'log');
    if (!setting?.kick.enable || !setting.kick.channel) return;

    const channel = await guild.channels.fetch(setting.kick.channel).catch(() => null);
    const executor = await auditLog.executor?.fetch();

    if (channel?.isTextBased())
      channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle('`🔨` Kick')
            .setDescription([
              `${formatEmoji(Emojis.Gray.member)} **Membre ciblé :** ${auditLog.target} [\`${auditLog.target.tag}\`]`,
              '',
              `${formatEmoji(Emojis.Blurple.member)} **Exécutant :** ${executor} [\`${executor?.tag}\`]`,
              `${formatEmoji(Emojis.Blurple.text)} **Raison :** ${auditLog.reason ?? 'Aucune raison spécifiée'}`,
            ].join('\n'))
            .setColor(Colors.Orange)
            .setThumbnail(auditLog.target.displayAvatarURL())
            .setTimestamp(),
        ],
      }).catch(() => { });
  },
});

module.exports = [kickLog];
