import { SlashCommandSubcommandBuilder } from 'discord.js';
import { CommandContext, AutocompleteContext } from '../types';

/**
 * Abstract base class for all commands
 * Provides consistent structure and common functionality
 */
export abstract class BaseCommand {
  public abstract readonly name: string;
  public abstract readonly description: string;

  /**
   * Build the slash command configuration
   */
  public abstract buildCommand(): SlashCommandSubcommandBuilder;

  /**
   * Execute the command
   */
  public abstract execute(context: CommandContext): Promise<void>;

  /**
   * Handle autocomplete interactions (optional)
   */
  public async handleAutocomplete?(context: AutocompleteContext): Promise<void>;

  /**
   * Helper to add ephemeral option to subcommands
   */
  protected addEphemeralOption(subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder {
    return subcommand.addBooleanOption(option =>
      option
        .setName('ephemeral')
        .setDescription('Send the reply as ephemeral (only you can see it)')
        .setRequired(false)
    );
  }

  /**
   * Get ephemeral setting from interaction
   */
  protected getEphemeralSetting(context: CommandContext): boolean {
    return context.interaction.options.getBoolean('ephemeral') ?? false;
  }
}
