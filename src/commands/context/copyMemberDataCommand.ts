import {
  ApplicationCommandType,
  ApplicationIntegrationType,
  InteractionContextType,
  GuildMember,
  MessageFlags
} from 'discord.js';
import { BaseContextMenuCommand } from '../../core/contextMenuCommand';
import { ContextMenuContext, UserContextMenuContext } from '../../types';

export class CopyMemberDataCommand extends BaseContextMenuCommand {
  readonly name = 'Copy Member Data';
  readonly type = ApplicationCommandType.User;
  readonly integrationTypes = [ApplicationIntegrationType.UserInstall];
  readonly contexts = [InteractionContextType.Guild];

  async execute(context: ContextMenuContext): Promise<void> {
    const { interaction } = context as UserContextMenuContext;

    const member = interaction.targetMember;
    if (!member) {
      await interaction.reply({
        content: 'Could not resolve member data. This command only works in servers.',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const data = member instanceof GuildMember ? member.toJSON() : member;
    const json = JSON.stringify(data, null, 2);
    const buffer = Buffer.from(json, 'utf-8');

    const userId = interaction.targetUser.id;

    await interaction.reply({
      content: 'Here\'s the raw member data:',
      files: [{ attachment: buffer, name: `member-${userId}.json` }],
      flags: MessageFlags.Ephemeral
    });
  }
}
