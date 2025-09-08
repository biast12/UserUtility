import { REST, Routes } from 'discord.js';
import { getBotConfig } from '../core/config';
import { CommandManager } from '../core/commandManager';
import { UserCommand } from '../commands/userCommand';
import { InviteCommand } from '../commands/inviteCommand';
import { BadDomainCommand } from '../commands/badDomainCommand';

/**
 * Register all slash commands with Discord
 */
async function registerCommands(): Promise<void> {
  try {
    console.log('🔄 Starting command registration...');

    // Get configuration
    const config = getBotConfig();
    if (!config.clientId) {
      throw new Error('CLIENT_ID could not be determined. Please set it in environment variables.');
    }

    // Set up command manager and register all commands
    const commandManager = new CommandManager();
    commandManager.register(new UserCommand());
    commandManager.register(new InviteCommand());
    commandManager.register(new BadDomainCommand());

    // Build slash command
    const slashCommand = commandManager.buildSlashCommand();
    const commands = [slashCommand.toJSON()];

    // Create REST client and deploy commands
    const rest = new REST({ version: '10' }).setToken(config.token);
    
    await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands }
    );

    // Count and log registered commands
    const registeredCommands = commandManager.getAllCommands();
    const commandList = registeredCommands.map(cmd => `  /check ${cmd.name}`);

    console.log(`✅ Successfully registered ${registeredCommands.length} user utility commands:\n`);
    commandList.forEach(cmd => console.log(cmd));

  } catch (error) {
    console.error('❌ Failed to register commands:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run registration if this file is executed directly
registerCommands();
