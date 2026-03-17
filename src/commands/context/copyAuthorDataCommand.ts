import { ApplicationCommandType, MessageFlags } from 'discord.js';
import { BaseContextMenuCommand } from '../../core/contextMenuCommand';
import { ContextMenuContext, MessageContextMenuContext } from '../../types';

export class CopyAuthorDataCommand extends BaseContextMenuCommand {
  readonly name = 'Copy Author Data';
  readonly type = ApplicationCommandType.Message;

  async execute(context: ContextMenuContext): Promise<void> {
    const { interaction } = context as MessageContextMenuContext;

    const author = interaction.targetMessage.author;
    const data = author.toJSON();
    const json = JSON.stringify(data, null, 2);
    const buffer = Buffer.from(json, 'utf-8');

    await interaction.reply({
      content: 'Here\'s the raw user data for the message author:',
      files: [{ attachment: buffer, name: `user-${author.id}.json` }],
      flags: MessageFlags.Ephemeral
    });
  }
}
