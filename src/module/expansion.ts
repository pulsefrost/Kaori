import { Colors, EmbedBuilder, Message, time } from 'discord.js';
import { EmbedPagination } from './pagination';

export function urlExpansion(message: Message, guildId?: string) {
	/** @type {(RegExpMatchArray & {groups: {[K in 'guildId'|'channelId' |'messageId']: string}})[]} */
	const results = [...message.content.matchAll(/https:\/\/(?:.+\.)?discord(?:.+)?.com\/channels\/(?<guildId>\d+)\/(?<channelId>\d+)\/(?<messageId>\d+)/g)];
	results.forEach(async result => {
		if (!result.groups) return;
		try {
			if (guildId && result.groups.guildId !== guildId) return;

			const guild = await message.client.guilds.fetch(result.groups.guildId!);
			if (!guild) throw new URIError(`Le serveur avec l'ID:\`${result.groups.guildId}\` n'a pas été trouvé`);
			const channel = await guild.channels.fetch(result.groups.channelId).catch(() => { });
			if (!(channel && channel.isTextBased())) throw new URIError(`Le canal avec l'ID:\`${result.groups.guildId}\` n'existe pas ou n'est pas accessible`);
			const msg = await channel.messages.fetch(result.groups.messageId).catch(() => { });
			if (!msg) throw new URIError(`Le message avec l'ID:\`${result.groups.messageId}\` n'existe pas ou n'est pas accessible`);

			const pagination = new EmbedPagination();

			const infoEmbed = new EmbedBuilder()
				.setTitle('Développement du message')
				.setColor('White')
				.setURL(result[0])
				.setAuthor({
					name: msg.member?.displayName ?? msg.author.tag,
					iconURL: msg.member?.displayAvatarURL() ?? msg.author.displayAvatarURL(),
				})
				.addFields(
					{ name: 'Heure d\'envoi', value: time(msg.createdAt), inline: true },
				);
			const contentEmbeds = (msg.content.match(/.{1,1024}/gs) ?? []).map(content => new EmbedBuilder(infoEmbed.toJSON())
				.setDescription(content));
			const attachmentEmbeds = msg.attachments.map(attachment => new EmbedBuilder(infoEmbed.toJSON())
				.setImage(attachment.url));
			if (!contentEmbeds.concat(attachmentEmbeds).length) pagination.addPage(infoEmbed);
			pagination.addPages(...contentEmbeds, ...attachmentEmbeds, ...msg.embeds.map(v => EmbedBuilder.from(v)))
				.replyMessage(message, { allowedMentions: { parse: [] } });
		}
		catch (err) {
			console.log(err);
			const em = new EmbedBuilder()
				.setTitle('Erreur!')
				.setColor(Colors.White)
				.setDescription('Une erreur inattendue s\'est produite.');
			message.reply({ embeds: [em], allowedMentions: { parse: [] } });
		}
	});
}
