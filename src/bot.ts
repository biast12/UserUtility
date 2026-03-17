import { Client, GatewayIntentBits, Interaction, AutocompleteInteraction } from 'discord.js';
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
import { sendError } from './core/response';
import { logger } from './utils/logger';
import { LogArea, LogLevel } from './types/logger';

export class UserUtilityBot {
  private client: Client;
  private commandManager: CommandManager;

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

    this.commandManager = new CommandManager();
    this.registerCommands();
    this.setupEventHandlers();
  }

  private registerCommands(): void {
    this.commandManager.register(new UserCommand());
    this.commandManager.register(new InviteCommand());
    this.commandManager.register(new BadDomainCommand());
    this.commandManager.register(new AvatarCommand());
    this.commandManager.register(new TimestampCommand());
    this.commandManager.register(new SnowflakeCommand());
    this.commandManager.register(new ColorCommand());

    this.commandManager.registerContextMenu(new CopyMessageDataCommand());
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

    if (interaction.isMessageContextMenuCommand()) {
      const { commandName } = interaction;
      try {
        if (!this.commandManager.hasContextMenuCommand(commandName)) return;
        await this.commandManager.executeContextMenu(commandName, {
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
        if (!this.commandManager.hasContextMenuCommand(commandName)) return;
        await this.commandManager.executeContextMenu(commandName, {
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

    if (commandName !== 'check') return;

    try {
      const subcommandName = interaction.options.getSubcommand();

      if (!this.commandManager.hasCommand(subcommandName)) {
        await sendError(interaction, 'Unknown subcommand. Please try again.');
        return;
      }

      await this.commandManager.execute(subcommandName, {
        client: this.client,
        interaction
      });

    } catch (error) {
      logger.error(
        LogArea.COMMANDS,
        `Error executing command "${commandName}": ${error instanceof Error ? error.message : error}`
      );
      await sendError(interaction, 'An unexpected error occurred while processing your request.');
    }
  }

  private async handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
    try {
      const { commandName } = interaction;

      if (commandName !== 'check') return;

      const subcommandName = interaction.options.getSubcommand();
      const command = this.commandManager.getAllCommands().find(cmd => cmd.name === subcommandName);
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
