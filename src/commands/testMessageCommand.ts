import { SlashCommandSubcommandBuilder } from 'discord.js';
import { BaseCommand } from '../core/command';
import { CommandContext } from '../types';
import { sendError } from '../core/response';
import { applyPlaceholders } from '../utils/testPayload';

// Component types that belong to Components V2
const V2_COMPONENT_TYPES = new Set([9, 10, 11, 12, 13, 14, 17]);

// Fields allowed on a message payload sent via interaction.reply()
const ALLOWED_FIELDS = ['content', 'embeds', 'components', 'flags', 'tts', 'allowed_mentions', 'poll'] as const;

const IS_COMPONENTS_V2 = 1 << 15;

function hasV2Components(components: unknown): boolean {
  if (!Array.isArray(components)) return false;
  for (const comp of components) {
    if (typeof comp !== 'object' || comp === null) continue;
    const c = comp as Record<string, unknown>;
    if (typeof c.type === 'number' && V2_COMPONENT_TYPES.has(c.type)) return true;
    if (hasV2Components(c.components)) return true;
  }
  return false;
}

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

    // Apply placeholders before parsing so the result is valid JSON
    const resolved = applyPlaceholders(rawJson, client.user?.id ?? '');

    // Parse
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

    // Auto-detect Components V2 and add the flag if any V2 component types are present
    if (hasComponents && hasV2Components(payload.components)) {
      const currentFlags = typeof payload.flags === 'number' ? payload.flags : 0;
      payload.flags = currentFlags | IS_COMPONENTS_V2;
    }

    // IS_COMPONENTS_V2 is mutually exclusive with content and embeds
    const effectiveFlags = typeof payload.flags === 'number' ? payload.flags : 0;
    if ((effectiveFlags & IS_COMPONENTS_V2) !== 0 && (hasContent || hasEmbeds)) {
      await sendError(
        interaction,
        '`IS_COMPONENTS_V2` (`1 << 15`) cannot be combined with `content` or `embeds` — Discord will reject this with a 400 error.\n\nRemove `content`/`embeds` from your payload, or remove the flag.'
      );
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
