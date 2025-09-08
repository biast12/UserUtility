import { SlashCommandBuilder } from 'discord.js';
import { BaseCommand } from './command';
import { CommandContext } from '../types';

export class CommandManager {
  private commands = new Map<string, BaseCommand>();

  public register(command: BaseCommand): void {
    this.commands.set(command.name, command);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    const builder = new SlashCommandBuilder()
      .setName('check')
      .setDescription('User utility commands and information tools');
    for (const command of this.commands.values()) {
      builder.addSubcommand(command.buildCommand());
    }

    return builder;
  }

  public async execute(commandName: string, context: CommandContext): Promise<void> {
    const command = this.commands.get(commandName);
    if (!command) {
      throw new Error(`Unknown command: ${commandName}`);
    }

    await command.execute(context);
  }

  public getAllCommands(): BaseCommand[] {
    return Array.from(this.commands.values());
  }

  public hasCommand(commandName: string): boolean {
    return this.commands.has(commandName);
  }
}
