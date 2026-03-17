import { SlashCommandBuilder, ContextMenuCommandBuilder } from 'discord.js';
import { BaseCommand } from './command';
import { BaseContextMenuCommand } from './contextMenuCommand';
import { CommandContext, ContextMenuContext } from '../types';

export class CommandManager {
  private commands = new Map<string, BaseCommand>();
  private contextMenuCommands = new Map<string, BaseContextMenuCommand>();

  public register(command: BaseCommand): void {
    this.commands.set(command.name, command);
  }

  public registerContextMenu(command: BaseContextMenuCommand): void {
    this.contextMenuCommands.set(command.name, command);
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

  public buildContextMenuCommands(): ContextMenuCommandBuilder[] {
    return Array.from(this.contextMenuCommands.values()).map(cmd => cmd.buildCommand());
  }

  public async execute(commandName: string, context: CommandContext): Promise<void> {
    const command = this.commands.get(commandName);
    if (!command) {
      throw new Error(`Unknown command: ${commandName}`);
    }

    await command.execute(context);
  }

  public async executeContextMenu(commandName: string, context: ContextMenuContext): Promise<void> {
    const command = this.contextMenuCommands.get(commandName);
    if (!command) {
      throw new Error(`Unknown context menu command: ${commandName}`);
    }

    await command.execute(context);
  }

  public getAllCommands(): BaseCommand[] {
    return Array.from(this.commands.values());
  }

  public getAllContextMenuCommands(): BaseContextMenuCommand[] {
    return Array.from(this.contextMenuCommands.values());
  }

  public hasCommand(commandName: string): boolean {
    return this.commands.has(commandName);
  }

  public hasContextMenuCommand(commandName: string): boolean {
    return this.contextMenuCommands.has(commandName);
  }
}
