import { AttachmentBuilder, AuditLogEvent, Colors, EmbedBuilder, Events, formatEmoji, GuildBasedChannel, Message, time, User } from 'discord.js';
import { Emojis } from '../../module/constant';
import { DiscordEventBuilder } from '../../module/events';
import { isBlocked } from '../../module/functions';
import { getServerSetting } from '../../module/mongo/middleware';
import axios from 'axios';
import admZip from 'adm-zip';

const selfDeleteLog = new DiscordEventBuilder({
	type: Events.MessageDelete,
	execute: async (message) => {
		if (!message.inGuild() || message.author?.bot) return;
		if (isBlocked(message.guild)) return;
		const setting = await getServerSetting(message.guildId, 'log');
		if (!setting?.delete.enable || !setting.delete.channel) return;
		const logCh = await message.guild.channels.fetch(setting.delete.channel).catch(() => undefined);
		sendDeleteLog(message, logCh);
	},
});

const deleteLog = new DiscordEventBuilder({
	type: Events.GuildAuditLogEntryCreate,
	execute: async (auditLog, guild) => {
		if (isBlocked(guild)) return;
		if (auditLog.action !== AuditLogEvent.MessageDelete || !(auditLog.target instanceof Message)) return;
		if (!auditLog.target.inGuild() || auditLog.target.author?.bot) return;

		const setting = await getServerSetting(guild.id, 'log');
		if (!setting?.delete.enable || !setting.delete.channel) return;
		const logCh = await guild.channels.fetch(setting.delete.channel).catch(() => undefined);
		sendDeleteLog(auditLog.target, logCh, auditLog.executor);
	},
});

async function sendDeleteLog(message: Message<true>, channel?: GuildBasedChannel | null, executer?: User | null) {
	if (!message.channel || !message.author) return;
	if (!channel?.isTextBased()) return;
	const beforeMessage = (await message.channel.messages.fetch({ before: message.id, limit: 1 })).first();

	const embed = new EmbedBuilder()
		.setTitle('`💬` Message supprimé')
		.setURL(beforeMessage?.url ?? null)
		.setDescription([
			`${formatEmoji(Emojis.Gray.channel)} **Canal :** ${message.channel} [\`${message.channel.name}\`]`,
			`${formatEmoji(Emojis.Gray.member)} **Auteur :** ${message.author} [\`${message.author.tag}\`]`,
			`${formatEmoji(Emojis.Gray.member)} **Supprimé par :** ${executer ? `${executer} [\`${executer.tag}\`]` : 'L\'auteur lui-même'}`,
			`${formatEmoji(Emojis.Gray.schedule)} **Heure d'envoi :** ${time(message.createdAt)}`,
		].join('\n'))
		.setColor(Colors.White)
		.setThumbnail(message.author?.avatarURL() ?? null)
		.setFields({ name: 'Message', value: message.content || 'Aucun' });

	if (message.attachments.size) {
		const zip = new admZip();
		for await (const attachment of message.attachments.values()) {
			const res = await axios.get(attachment.url, { responseType: 'arraybuffer' }).catch(() => null);
			if (!res) continue;
			zip.addFile(attachment.name, res.data);
		}
		const attachment = new AttachmentBuilder(zip.toBuffer(), { name: 'attachments.zip' });
		channel.send({ embeds: [embed], files: [attachment] });
	}
	else channel.send({ embeds: [embed] });
}

module.exports = [selfDeleteLog, deleteLog];