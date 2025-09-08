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
import { sendError } from './core/response';
import { logger } from './utils/logger';
import { LogArea, LogLevel } from './types/logger';

/**
 * Main bot class with clean architecture
 */
export class UserUtilityBot {
  private client: Client;
  private commandManager: CommandManager;

  constructor() {
    // Validate configuration on startup
    validateConfig();
    
    // Configure logger
    logger.configure({
      consoleEnabled: true,
      minLevel: LogLevel.INFO
    });

    // Initialize Discord client
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds],
      allowedMentions: { parse: [] }
    });

    // Initialize command manager
    this.commandManager = new CommandManager();
    this.registerCommands();
    this.setupEventHandlers();
  }

  /**
   * Register all available commands
   */
  private registerCommands(): void {
    this.commandManager.register(new UserCommand());
    this.commandManager.register(new InviteCommand());
    this.commandManager.register(new BadDomainCommand());
    this.commandManager.register(new AvatarCommand());
    this.commandManager.register(new TimestampCommand());
    this.commandManager.register(new SnowflakeCommand());
    this.commandManager.register(new ColorCommand());
  }

  /**
   * Set up Discord event handlers
   */
  private setupEventHandlers(): void {
    this.client.once('clientReady', () => {
      logger.info(LogArea.STARTUP, `User Utility Bot is online as ${this.client.user?.tag}`);
      logger.spacer('=', undefined, LogLevel.INFO);
    });

    this.client.on('interactionCreate', async (interaction: Interaction) => {
      await this.handleInteraction(interaction);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  /**
   * Handle Discord interactions
   */
  private async handleInteraction(interaction: Interaction): Promise<void> {
    // Handle autocomplete interactions
    if (interaction.isAutocomplete()) {
      await this.handleAutocomplete(interaction);
      return;
    }

    // Only handle slash commands
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;
    
    // Only handle our main command
    if (commandName !== 'check') return;

    try {
      const subcommandName = interaction.options.getSubcommand();
      
      if (!this.commandManager.hasCommand(subcommandName)) {
        await sendError(interaction, 'Unknown subcommand. Please try again.');
        return;
      }

      // Execute the command
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

  /**
   * Handle autocomplete interactions
   */
  private async handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
    try {
      const { commandName } = interaction;
      
      // Only handle our main command
      if (commandName !== 'check') return;

      const subcommandName = interaction.options.getSubcommand();
      
      // Get the command and check if it supports autocomplete
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

  /**
   * Start the bot
   */
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

  /**
   * Graceful shutdown
   */
  private async shutdown(): Promise<void> {
    logger.info(LogArea.SHUTDOWN, 'Shutting down gracefully...');
    this.client.destroy();
    process.exit(0);
  }
}

/**
 * Start the bot if this file is run directly
 */
if (require.main === module) {
  const bot = new UserUtilityBot();
  bot.start();
}
