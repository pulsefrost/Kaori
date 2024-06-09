import { ChatInput } from '@akki256/discord-interaction';
import { ApplicationCommandOptionType, Colors, EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';

const kissCommand = new ChatInput(
  {
    name: 'kiss',
    description: 'Envoyer un baiser à quelqu\'un',
    options: [
      {
        name: 'user',
        description: 'L\'utilisateur à embrasser',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
    ],
    dmPermission: true,
  },
  async (interaction) => {
    const user = interaction.options.getUser('user');

    try {
      const response = await fetch('https://nekos.best/api/v2/hug/');
      const data = await response.json();

      const { anime_name, url } = data.results[0]; // Assuming only one result is returned

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${interaction.user} embrasse ${user}!`)
            .setImage(url)
            .setColor(Colors.Green)
            .setTitle(anime_name),
        ],
      });
    } catch (error) {
      console.error('Error fetching kiss image:', error);
      interaction.reply({
        content: 'Une erreur est survenue lors de l\'envoi du baiser. Veuillez réessayer plus tard.',
        ephemeral: true,
      });
    }
  }
);

module.exports = [kissCommand];