import { ApplicationCommandType, MessageFlags } from 'discord.js';
import { BaseContextMenuCommand } from '../../core/contextMenuCommand';
import { ContextMenuContext, UserContextMenuContext } from '../../types';

export class CopyUserDataCommand extends BaseContextMenuCommand {
  readonly name = 'Copy User Data';
  readonly type = ApplicationCommandType.User;

  async execute(context: ContextMenuContext): Promise<void> {
    const { interaction } = context as UserContextMenuContext;

    const user = interaction.targetUser;
    const data = user.toJSON();
    const json = JSON.stringify(data, null, 2);
    const buffer = Buffer.from(json, 'utf-8');

    await interaction.reply({
      content: 'Here\'s the raw user data:',
      files: [{ attachment: buffer, name: `user-${user.id}.json` }],
      flags: MessageFlags.Ephemeral
    });
  }
}
