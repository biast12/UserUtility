import { REST, Routes } from 'discord.js';
import { getBotConfig } from '../core/config';
import { CommandManager } from '../core/commandManager';
import { UserCommand } from '../commands/userCommand';
import { InviteCommand } from '../commands/inviteCommand';
import { BadDomainCommand } from '../commands/badDomainCommand';
import { AvatarCommand } from '../commands/avatarCommand';
import { TimestampCommand } from '../commands/timestampCommand';
import { SnowflakeCommand } from '../commands/snowflakeCommand';
import { ColorCommand } from '../commands/colorCommand';
import { CopyMessageDataCommand } from '../commands/context/copyMessageDataCommand';
import { CopyUserDataCommand } from '../commands/context/copyUserDataCommand';
import { logger } from './logger';
import { LogArea } from '../types/logger';

/**
 * Register all slash commands with Discord
 */
async function registerCommands(): Promise<void> {
  try {
    logger.info(LogArea.NONE, 'Starting command registration...');

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
    commandManager.register(new AvatarCommand());
    commandManager.register(new TimestampCommand());
    commandManager.register(new SnowflakeCommand());
    commandManager.register(new ColorCommand());

    commandManager.registerContextMenu(new CopyMessageDataCommand());
    commandManager.registerContextMenu(new CopyUserDataCommand());

    // Build all commands
    const slashCommand = commandManager.buildSlashCommand();
    const contextMenuCommands = commandManager.buildContextMenuCommands();
    const commands = [slashCommand.toJSON(), ...contextMenuCommands.map(cmd => cmd.toJSON())];

    // Create REST client and deploy commands
    const rest = new REST({ version: '10' }).setToken(config.token);

    await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands }
    );

    // Log registered commands
    const registeredCommands = commandManager.getAllCommands();
    const registeredContextMenuCommands = commandManager.getAllContextMenuCommands();

    logger.info(LogArea.NONE, `Successfully registered ${registeredCommands.length} slash subcommands and ${registeredContextMenuCommands.length} context menu command(s)`);
    registeredCommands.forEach(cmd => logger.info(LogArea.NONE, `  /check ${cmd.name}`));
    registeredContextMenuCommands.forEach(cmd => logger.info(LogArea.NONE, `  [context menu] ${cmd.name}`));
    logger.spacer();

  } catch (error) {
    logger.error(
      LogArea.STARTUP,
      `Failed to register commands: ${error instanceof Error ? error.message : error}`
    );
    process.exit(1);
  }
}

// Run registration if this file is executed directly
registerCommands();
