import { SlashCommandSubcommandBuilder } from 'discord.js';
import { BaseCommand } from '../core/command';
import { CommandContext } from '../types';
import { sendError, StandardResponses } from '../core/response';
import { applyPlaceholders } from '../utils/testPayload';
import { stripJsonComments } from '../utils/parsers';

export class TestMessageCommand extends BaseCommand {
  public readonly name = 'message';
  public readonly description = 'Post a raw message payload JSON to test how it renders';

  public buildCommand(): SlashCommandSubcommandBuilder {
    return new SlashCommandSubcommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(option =>
        option
          .setName('payload')
          .setDescription('Full message payload as JSON (content, embeds, components, flags, tts, allowed_mentions, poll)')
          .setRequired(true)
          .setMaxLength(6000)
      );
  }

  public async execute(context: CommandContext): Promise<void> {
    const { client, interaction } = context;
    const rawJson = interaction.options.getString('payload', true);

    const resolved = applyPlaceholders(stripJsonComments(rawJson), client.user?.id ?? '');

    let parsed: Record<string, unknown>;
    try {
      const value = JSON.parse(resolved);
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        await sendError(interaction, 'Payload must be a JSON **object** `{...}`.');
        return;
      }
      parsed = value as Record<string, unknown>;
    } catch (err) {
      const msg = err instanceof SyntaxError ? err.message : String(err);
      await sendError(interaction, `**Invalid JSON**\n\`\`\`\n${msg}\n\`\`\``);
      return;
    }

    await interaction.deferReply();

    try {
      await interaction.editReply(parsed as any);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const errorResponse = StandardResponses.error(`**Discord rejected the payload**\n\`\`\`\n${message}\n\`\`\``);
      await interaction.editReply({ components: errorResponse.components, flags: errorResponse.flags } as any);
    }
  }
}
