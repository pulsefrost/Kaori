
import { ChatInput } from '@akki256/discord-interaction';
import { EmbedBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';

const helpCommand = new ChatInput(
  {
    name: 'help',
    description: 'Affiche la liste des commandes disponibles et leurs descriptions',
    dmPermission: true,
  },
  async (interaction) => {
    // Path to the interactions (commands) folder
    const commandsPath = path.join(__dirname, 'interactions');

    // List all command files
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

    // Array to hold command details
    let commandList = [];

    // Loop through each command file and extract name and description
    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, file));

      // Check if the command has a name and description
      if (command.default?.name && command.default?.description) {
        commandList.push(`**/${command.default.name}** - ${command.default.description}`);
      }
    }

    // Create the embed message
    const helpEmbed = new EmbedBuilder()
      .setTitle('Liste des commandes')
      .setDescription(commandList.join('\n'))
      .setColor(0x00AE86);

    // Send the embed as a reply
    await interaction.reply({ embeds: [helpEmbed] });
  }
);

export default helpCommand;
