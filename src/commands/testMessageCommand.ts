import { SlashCommandSubcommandBuilder } from 'discord.js';
import { BaseCommand } from '../core/command';
import { CommandContext } from '../types';
import { sendError } from '../core/response';
import { applyPlaceholders } from '../utils/testPayload';
import { stripJsonComments } from '../utils/parsers';

// Fields allowed on a message payload sent via interaction.reply()
const ALLOWED_FIELDS = ['content', 'embeds', 'components', 'flags', 'tts', 'allowed_mentions', 'poll'] as const;

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

    // Strip // line comments and apply placeholders before parsing
    const stripped = stripJsonComments(rawJson);
    const resolved = applyPlaceholders(stripped, client.user?.id ?? '');

    let parsed: Record<string, unknown>;
    try {
      const value = JSON.parse(resolved);
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        await sendError(interaction, 'Payload must be a JSON **object** `{...}`, not an array or primitive.');
        return;
      }
      parsed = value as Record<string, unknown>;
    } catch (err) {
      const msg = err instanceof SyntaxError ? err.message : String(err);
      await sendError(interaction, `**Invalid JSON**\n\`\`\`\n${msg}\n\`\`\``);
      return;
    }

    // Whitelist fields — strip anything Discord wouldn't accept or that could cause issues
    const payload: Record<string, unknown> = {};
    for (const field of ALLOWED_FIELDS) {
      if (field in parsed) payload[field] = parsed[field];
    }

    // Must have at least one visible piece of content
    const hasContent = typeof payload.content === 'string' && payload.content.trim() !== '';
    const hasEmbeds = Array.isArray(payload.embeds) && payload.embeds.length > 0;
    const hasComponents = Array.isArray(payload.components) && payload.components.length > 0;
    if (!hasContent && !hasEmbeds && !hasComponents) {
      await sendError(interaction, 'Payload must include at least one of: `content`, `embeds`, or `components`.');
      return;
    }

    try {
      await interaction.reply(payload as any);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await sendError(interaction, `**Discord rejected the payload**\n\`\`\`\n${message}\n\`\`\``);
    }
  }
}
