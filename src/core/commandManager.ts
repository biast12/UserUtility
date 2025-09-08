import { SlashCommandBuilder } from 'discord.js';
import { BaseCommand } from './command';
import { CommandContext } from '../types';

/**
 * Manages command registration and execution
 * Provides clean separation between command definition and routing
 */
export class CommandManager {
  private commands = new Map<string, BaseCommand>();

  /**
   * Register a command
   */
  public register(command: BaseCommand): void {
    this.commands.set(command.name, command);
  }

  /**
   * Build the unified slash command with all subcommands
   */
  public buildSlashCommand(): SlashCommandBuilder {
    const builder = new SlashCommandBuilder()
      .setName('check')
      .setDescription('User utility commands and information tools');

    // Add all registered commands as subcommands
    for (const command of this.commands.values()) {
      builder.addSubcommand(command.buildCommand());
    }

    return builder;
  }

  /**
   * Execute a command by name
   */
  public async execute(commandName: string, context: CommandContext): Promise<void> {
    const command = this.commands.get(commandName);
    if (!command) {
      throw new Error(`Unknown command: ${commandName}`);
    }

    await command.execute(context);
  }

  /**
   * Get all registered commands
   */
  public getAllCommands(): BaseCommand[] {
    return Array.from(this.commands.values());
  }

  /**
   * Check if a command exists
   */
  public hasCommand(commandName: string): boolean {
    return this.commands.has(commandName);
  }
}
