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

  readonly integrationTypes: ApplicationIntegrationType[] = [
    ApplicationIntegrationType.UserInstall
  ];
  readonly contexts: InteractionContextType[] = [
    InteractionContextType.Guild,
    InteractionContextType.BotDM,
    InteractionContextType.PrivateChannel
  ];

  buildCommand(): ContextMenuCommandBuilder {
    return new ContextMenuCommandBuilder()
      .setName(this.name)
      .setType(this.type)
      .setIntegrationTypes(this.integrationTypes)
      .setContexts(this.contexts);
  }

  abstract execute(context: ContextMenuContext): Promise<void>;
}
