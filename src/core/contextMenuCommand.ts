import { ContextMenuCommandBuilder, ApplicationCommandType } from 'discord.js';
import { ContextMenuContext } from '../types';

export abstract class BaseContextMenuCommand {
  abstract readonly name: string;
  abstract readonly type: ApplicationCommandType.Message | ApplicationCommandType.User;

  buildCommand(): ContextMenuCommandBuilder {
    return new ContextMenuCommandBuilder()
      .setName(this.name)
      .setType(this.type);
  }

  abstract execute(context: ContextMenuContext): Promise<void>;
}
