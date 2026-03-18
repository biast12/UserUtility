import { Client, GatewayIntentBits, Interaction, AutocompleteInteraction, ModalSubmitInteraction } from 'discord.js';
import { validateConfig, getBotConfig } from './core/config';
import { CommandManager } from './core/commandManager';
import { UserCommand } from './commands/userCommand';
import { InviteCommand } from './commands/inviteCommand';
import { BadDomainCommand } from './commands/badDomainCommand';
import { AvatarCommand } from './commands/avatarCommand';
import { TimestampCommand } from './commands/timestampCommand';
import { SnowflakeCommand } from './commands/snowflakeCommand';
import { ColorCommand } from './commands/colorCommand';
import { CopyMessageDataCommand } from './commands/context/copyMessageDataCommand';
import { CopyUserDataCommand } from './commands/context/copyUserDataCommand';
import { CopyAuthorDataCommand } from './commands/context/copyAuthorDataCommand';
import { CopyMemberDataCommand } from './commands/context/copyMemberDataCommand';
import { TestMessageCommand } from './commands/testMessageCommand';
import { TestModalCommand, TEST_MODAL_PREFIX, handleTestModalSubmit } from './commands/testModalCommand';
import { sendError } from './core/response';
import { logger } from './utils/logger';
import { LogArea, LogLevel } from './types/logger';

export class UserUtilityBot {
  private client: Client;
  private checkCommandManager: CommandManager;
  private testCommandManager: CommandManager;
  private contextMenuManager: CommandManager;

  constructor() {
    validateConfig();

    logger.configure({
      consoleEnabled: true,
      minLevel: LogLevel.INFO
    });

    this.client = new Client({
      intents: [GatewayIntentBits.Guilds],
      allowedMentions: { parse: [] }
    });

    this.checkCommandManager = new CommandManager('check', 'User utility commands and information tools');
    this.testCommandManager = new CommandManager('test', 'Commands for testing raw Discord payloads');
    this.contextMenuManager = new CommandManager();
    this.registerCommands();
    this.setupEventHandlers();
  }

  private registerCommands(): void {
    this.checkCommandManager.register(new UserCommand());
    this.checkCommandManager.register(new InviteCommand());
    this.checkCommandManager.register(new BadDomainCommand());
    this.checkCommandManager.register(new AvatarCommand());
    this.checkCommandManager.register(new TimestampCommand());
    this.checkCommandManager.register(new SnowflakeCommand());
    this.checkCommandManager.register(new ColorCommand());
    
    this.testCommandManager.register(new TestMessageCommand());
    this.testCommandManager.register(new TestModalCommand());

    this.contextMenuManager.registerContextMenu(new CopyMessageDataCommand());
    this.contextMenuManager.registerContextMenu(new CopyUserDataCommand());
    this.contextMenuManager.registerContextMenu(new CopyAuthorDataCommand());
    this.contextMenuManager.registerContextMenu(new CopyMemberDataCommand());
  }

  private setupEventHandlers(): void {
    this.client.once('clientReady', () => {
      logger.info(LogArea.STARTUP, `User Utility Bot is online as ${this.client.user?.tag}`);
      logger.spacer('=', undefined, LogLevel.INFO);
    });

    this.client.on('interactionCreate', async (interaction: Interaction) => {
      await this.handleInteraction(interaction);
    });

    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  private async handleInteraction(interaction: Interaction): Promise<void> {
    if (interaction.isAutocomplete()) {
      await this.handleAutocomplete(interaction);
      return;
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith(TEST_MODAL_PREFIX)) {
      try {
        await handleTestModalSubmit(interaction as ModalSubmitInteraction);
      } catch (error) {
        logger.error(
          LogArea.COMMANDS,
          `Error handling test modal submit: ${error instanceof Error ? error.message : error}`
        );
      }
      return;
    }

    if (interaction.isMessageContextMenuCommand()) {
      const { commandName } = interaction;
      try {
        if (!this.contextMenuManager.hasContextMenuCommand(commandName)) return;
        await this.contextMenuManager.executeContextMenu(commandName, {
          client: this.client,
          interaction
        });
      } catch (error) {
        logger.error(
          LogArea.COMMANDS,
          `Error executing context menu command "${commandName}": ${error instanceof Error ? error.message : error}`
        );
      }
      return;
    }

    if (interaction.isUserContextMenuCommand()) {
      const { commandName } = interaction;
      try {
        if (!this.contextMenuManager.hasContextMenuCommand(commandName)) return;
        await this.contextMenuManager.executeContextMenu(commandName, {
          client: this.client,
          interaction
        });
      } catch (error) {
        logger.error(
          LogArea.COMMANDS,
          `Error executing context menu command "${commandName}": ${error instanceof Error ? error.message : error}`
        );
      }
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    const manager = commandName === 'check' ? this.checkCommandManager
      : commandName === 'test' ? this.testCommandManager
      : null;

    if (!manager) return;

    try {
      const subcommandName = interaction.options.getSubcommand();

      if (!manager.hasCommand(subcommandName)) {
        await sendError(interaction, 'Unknown subcommand. Please try again.');
        return;
      }

      await manager.execute(subcommandName, {
        client: this.client,
        interaction
      });

    } catch (error) {
      logger.error(
        LogArea.COMMANDS,
        `Error executing command "/${commandName}": ${error instanceof Error ? error.message : error}`
      );
      await sendError(interaction, 'An unexpected error occurred while processing your request.');
    }
  }

  private async handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
    try {
      const { commandName } = interaction;

      const manager = commandName === 'check' ? this.checkCommandManager
        : commandName === 'test' ? this.testCommandManager
        : null;

      if (!manager) return;

      const subcommandName = interaction.options.getSubcommand();
      const command = manager.getAllCommands().find(cmd => cmd.name === subcommandName);
      if (command && command.handleAutocomplete) {
        await command.handleAutocomplete({
          client: this.client,
          interaction
        });
      }
    } catch (error) {
      logger.error(
        LogArea.AUTOCOMPLETE,
        `Error handling autocomplete: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  public async start(): Promise<void> {
    try {
      const config = getBotConfig();
      await this.client.login(config.token);
    } catch (error) {
      logger.error(
        LogArea.STARTUP,
        `Failed to start bot: ${error instanceof Error ? error.message : error}`
      );
      process.exit(1);
    }
  }

  private async shutdown(): Promise<void> {
    logger.info(LogArea.SHUTDOWN, 'Shutting down gracefully...');
    this.client.destroy();
    process.exit(0);
  }
}

if (require.main === module) {
  const bot = new UserUtilityBot();
  bot.start();
}
