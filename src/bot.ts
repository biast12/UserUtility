import { Client, GatewayIntentBits, Interaction } from 'discord.js';
import { validateConfig, getBotConfig } from './core/config';
import { CommandManager } from './core/commandManager';
import { UserCommand } from './commands/userCommand';
import { InviteCommand } from './commands/inviteCommand';
import { BadDomainCommand } from './commands/badDomainCommand';
import { sendError } from './core/response';

/**
 * Main bot class with clean architecture
 */
export class UserUtilityBot {
  private client: Client;
  private commandManager: CommandManager;

  constructor() {
    // Validate configuration on startup
    validateConfig();

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
  }

  /**
   * Set up Discord event handlers
   */
  private setupEventHandlers(): void {
    this.client.once('clientReady', () => {
      console.log(`✅ User Utility Bot is online as ${this.client.user?.tag}`);
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
      console.error(`❌ Error executing command "${commandName}":`, error instanceof Error ? error.message : error);
      await sendError(interaction, 'An unexpected error occurred while processing your request.');
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
      console.error('❌ Failed to start bot:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  private async shutdown(): Promise<void> {
    console.log('🔄 Shutting down gracefully...');
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
