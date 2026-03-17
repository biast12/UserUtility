import {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  ApplicationIntegrationType,
  InteractionContextType
} from 'discord.js';
import { ContextMenuContext } from '../types';

export abstract class BaseContextMenuCommand {
  abstract readonly name: string;
  abstract readonly type: ApplicationCommandType.Message | ApplicationCommandType.User;

  readonly integrationTypes?: ApplicationIntegrationType[];
  readonly contexts?: InteractionContextType[];

  buildCommand(): ContextMenuCommandBuilder {
    const builder = new ContextMenuCommandBuilder()
      .setName(this.name)
      .setType(this.type);

    if (this.integrationTypes) {
      builder.setIntegrationTypes(this.integrationTypes);
    }

    if (this.contexts) {
      builder.setContexts(this.contexts);
    }

    return builder;
  }

  abstract execute(context: ContextMenuContext): Promise<void>;
}
