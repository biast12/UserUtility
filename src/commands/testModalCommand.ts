import { SlashCommandSubcommandBuilder, ModalSubmitInteraction, MessageFlags, ComponentType } from 'discord.js';
import { BaseCommand } from '../core/command';
import { CommandContext } from '../types';
import { sendError } from '../core/response';
import { applyPlaceholders, generateId } from '../utils/testPayload';
import { stripJsonComments } from '../utils/parsers';

export const TEST_MODAL_PREFIX = 'test_modal:';

export class TestModalCommand extends BaseCommand {
  public readonly name = 'modal';
  public readonly description = 'Show a raw modal payload JSON to test how it renders';

  public buildCommand(): SlashCommandSubcommandBuilder {
    return new SlashCommandSubcommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(option =>
        option
          .setName('payload')
          .setDescription('Modal payload as JSON ({ title, custom_id, components })')
          .setRequired(true)
          .setMaxLength(4000)
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

    if (typeof parsed.title !== 'string' || parsed.title.trim() === '') {
      await sendError(interaction, 'Modal payload must have a non-empty `title` string.');
      return;
    }

    if (!Array.isArray(parsed.components) || parsed.components.length === 0) {
      await sendError(interaction, 'Modal payload must have a `components` array with at least one action row containing text inputs.');
      return;
    }

    // Prefix custom_id so the modal submit handler can identify test modals.
    // We preserve any custom_id the user provided as the suffix.
    const userCustomId = typeof parsed.custom_id === 'string' && parsed.custom_id.trim() !== ''
      ? parsed.custom_id
      : generateId();
    const prefixedCustomId = `${TEST_MODAL_PREFIX}${userCustomId}`;

    const modalData = {
      title: parsed.title,
      custom_id: prefixedCustomId,
      components: parsed.components
    };

    try {
      // Pass the raw API object via the JSONEncodable interface — discord.js calls toJSON()
      // and forwards the result directly to the Discord API.
      await interaction.showModal({ toJSON: () => modalData } as any);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await sendError(interaction, `**Discord rejected the modal**\n\`\`\`\n${message}\n\`\`\``);
    }
  }
}

export async function handleTestModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
  const fields = [...interaction.fields.fields.values()]
    .filter((f): f is typeof f & { value: string } => f.type === ComponentType.TextInput);

  const lines = fields.length > 0
    ? fields.map(f => `\`${f.customId}\`  →  ${f.value !== '' ? f.value : '*(empty)*'}`)
    : ['*(no fields)*'];

  const json = JSON.stringify((interaction as any).components ?? [], null, 2);

  await interaction.reply({
    content: `**Modal submitted!**\n\n${lines.join('\n')}\n\`\`\`json\n${json.slice(0, 1800)}\n\`\`\``,
    flags: MessageFlags.Ephemeral
  });
}
