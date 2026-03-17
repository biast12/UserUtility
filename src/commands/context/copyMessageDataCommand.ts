import { ApplicationCommandType, MessageFlags } from 'discord.js';
import { BaseContextMenuCommand } from '../../core/contextMenuCommand';
import { ContextMenuContext, MessageContextMenuContext } from '../../types';

export class CopyMessageDataCommand extends BaseContextMenuCommand {
  readonly name = 'Copy Message Data';
  readonly type = ApplicationCommandType.Message;

  async execute(context: ContextMenuContext): Promise<void> {
    const { interaction } = context as MessageContextMenuContext;

    const message = interaction.targetMessage;
    const data = message.toJSON();
    const json = JSON.stringify(data, null, 2);
    const buffer = Buffer.from(json, 'utf-8');

    await interaction.reply({
      content: 'Here\'s the raw message data:',
      files: [{ attachment: buffer, name: `message-${message.id}.json` }],
      flags: MessageFlags.Ephemeral
    });
  }
}
