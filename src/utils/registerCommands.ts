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
import { CopyAuthorDataCommand } from '../commands/context/copyAuthorDataCommand';
import { CopyMemberDataCommand } from '../commands/context/copyMemberDataCommand';
import { TestMessageCommand } from '../commands/testMessageCommand';
import { TestModalCommand } from '../commands/testModalCommand';
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

    // Set up command managers
    const checkCommandManager = new CommandManager('check', 'User utility commands and information tools');
    checkCommandManager.register(new UserCommand());
    checkCommandManager.register(new InviteCommand());
    checkCommandManager.register(new BadDomainCommand());
    checkCommandManager.register(new AvatarCommand());
    checkCommandManager.register(new TimestampCommand());
    checkCommandManager.register(new SnowflakeCommand());
    checkCommandManager.register(new ColorCommand());

    const testCommandManager = new CommandManager('test', 'Commands for testing raw Discord payloads');
    testCommandManager.register(new TestMessageCommand());
    testCommandManager.register(new TestModalCommand());

    const contextMenuManager = new CommandManager();
    contextMenuManager.registerContextMenu(new CopyMessageDataCommand());
    contextMenuManager.registerContextMenu(new CopyUserDataCommand());
    contextMenuManager.registerContextMenu(new CopyAuthorDataCommand());
    contextMenuManager.registerContextMenu(new CopyMemberDataCommand());

    // Build all commands
    const commands = [
      checkCommandManager.buildSlashCommand().toJSON(),
      testCommandManager.buildSlashCommand().toJSON(),
      ...contextMenuManager.buildContextMenuCommands().map(cmd => cmd.toJSON())
    ];

    // Create REST client and deploy commands
    const rest = new REST({ version: '10' }).setToken(config.token);

    await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands }
    );

    // Log registered commands
    const totalSlash = checkCommandManager.getAllCommands().length + testCommandManager.getAllCommands().length;
    const contextMenuCommands = contextMenuManager.getAllContextMenuCommands();
    logger.info(LogArea.NONE, `Successfully registered ${totalSlash} slash subcommands and ${contextMenuCommands.length} context menu command(s)`);
    checkCommandManager.getAllCommands().forEach(cmd => logger.info(LogArea.NONE, `  /check ${cmd.name}`));
    testCommandManager.getAllCommands().forEach(cmd => logger.info(LogArea.NONE, `  /test ${cmd.name}`));
    contextMenuCommands.forEach(cmd => logger.info(LogArea.NONE, `  [context menu] ${cmd.name}`));
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
