import { SlashCommandSubcommandBuilder } from 'discord.js';
import { CommandContext, AutocompleteContext } from '../types';

export abstract class BaseCommand {
  public abstract readonly name: string;
  public abstract readonly description: string;

  public abstract buildCommand(): SlashCommandSubcommandBuilder;

  public abstract execute(context: CommandContext): Promise<void>;
  public async handleAutocomplete?(context: AutocompleteContext): Promise<void>;

  protected addEphemeralOption(subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder {
    return subcommand.addBooleanOption(option =>
      option
        .setName('ephemeral')
        .setDescription('Send the reply as ephemeral (only you can see it)')
        .setRequired(false)
    );
  }

  protected getEphemeralSetting(context: CommandContext): boolean {
    return context.interaction.options.getBoolean('ephemeral') ?? false;
  }
}
