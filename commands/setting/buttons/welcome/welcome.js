// eslint-disable-next-line no-unused-vars
const discord = require('discord.js');

/**
* @callback InteractionCallback
* @param {discord.MessageContextMenuInteraction} interaction
* @param {...any} [args]
* @returns {void}
*/
/**
* @typedef ContextMenuData
* @prop {string} customid
* @prop {'BUTTON'|'SELECT_MENU'} type
*/

module.exports = {
    /** @type {discord.ApplicationCommandData|ContextMenuData} */
    data: { customid: 'setting-welcome', type: 'BUTTON' },
    /** @type {InteractionCallback} */
    exec: async (client, interaction, Configs, language) => {
        const config = await Configs.findOne({ where: { serverId: interaction.guild.id } });
        const welcome = config.get('welcome');
        const welcomeCh = config.get('welcomeCh');

        /** @type {discord.MessageEmbed} */
        const embed = interaction.message.embeds[0];
        /** @type {discord.MessageActionRow} */
        const select = interaction.message.components[0];
        /** @type {discord.MessageActionRow} */
        const button = interaction.message.components[1];

        if (welcome) {
            Configs.update({ welcome: false }, { where: { serverId: interaction.guild.id } });
            embed.fields[0] = { name: `${language('SETTING_WELCOMEMESSAGE_FIELD_1')}`, value: `${language('SETTING_DISABLE')}`, inline: true };
            button.components[1]
                .setLabel(language('SETTING_BUTTON_ENABLE'))
                .setStyle('SUCCESS');
        } else {
            Configs.update({ welcome: true }, { where: { serverId: interaction.guild.id } });
            embed.fields[0] = { name: `${language('SETTING_WELCOMEMESSAGE_FIELD_1')}`, value: `${language('SETTING_CHANNEL_ENABLE', welcomeCh)}`, inline: true };
            button.components[1]
                .setLabel(language('SETTING_BUTTON_DISABLE'))
                .setStyle('DANGER');
        }
        interaction.update({ embeds: [embed], components: [select, button] });
    },
};