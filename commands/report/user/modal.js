const discord = require('discord.js');
const Configs = require('../../../schemas/configSchema');

/** @type {import('@djs-tools/interactions').ModalRegister} */
const modalInteraction = {
  data: {
		customId: 'userReport',
    type: 'MODAL',
  },
	exec: async (interaction) => {
		const Config = await Configs.findOne({ serverId: interaction.guildId });

		const customId = interaction.components[0].components[0].customId;
		const reason = interaction.components[0].components[0].value;
		const user = await interaction.client.users.fetch(customId).catch(() => {});

		const channel = await interaction.guild.channels.fetch(Config.report.channel).catch(() => {});
		if (!channel) {
			await Config.updateOne({ $set: { 'report.channel': null } });
			Config.save({ wtimeout: 1500 });

			const errorEmbed = new discord.EmbedBuilder()
				.setAuthor({ name: '通報の送信中に問題が発生しました。', iconURL: 'https://cdn.discordapp.com/attachments/958791423161954445/1022819275456651294/mark_batsu_illust_899.png' })
				.setColor('Red');
			return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
		}

		const content = `**\`⚠️\` ${interaction.user}が${interaction.channel}で\`ユーザー\`を通報しました！**`;

		const contentEmbed = new discord.EmbedBuilder()
			.setDescription(`${user} \`${user.tag}\``)
			.setColor('2f3136')
			.setFields({ name: '通報理由', value: discord.codeBlock(reason) })
			.setThumbnail(user.displayAvatarURL());

		const button = new discord.ActionRowBuilder().addComponents(
			new discord.ButtonBuilder()
				.setCustomId('report-completed')
				.setLabel('対処済み')
				.setStyle(discord.ButtonStyle.Success),
			new discord.ButtonBuilder()
				.setCustomId('report-ignore')
				.setLabel('無視')
				.setStyle(discord.ButtonStyle.Danger),
		);

		channel.send({ content: Config.report?.mention ? `${Config.report.mentionRole}\n${content}` : content, embeds: [contentEmbed], components: [button] })
			.then(() => {
				const successEmbed = new discord.EmbedBuilder()
					.setDescription('✅ **報告ありがとうございます！** 通報をサーバー運営に送信しました！')
					.setColor('Green');
				interaction.reply({ embeds: [successEmbed], ephemeral: true });
			})
			.catch(() => {
				const errorEmbed = new discord.EmbedBuilder()
					.setAuthor({ name: '通報の送信中に問題が発生しました。時間を置いてもう一度お試しください。', iconURL: 'https://cdn.discordapp.com/attachments/958791423161954445/1022819275456651294/mark_batsu_illust_899.png' })
					.setColor('Red');
				interaction.reply({ embeds: [errorEmbed], ephemeral: true });
			});
	},
};

module.exports = [ modalInteraction ];