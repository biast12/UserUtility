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

    // Support both a bare modal object ({ title, custom_id, components })
    // and a wrapped interaction response ({ type, data: { title, custom_id, components } }).
    const modalPayload = typeof parsed.data === 'object' && parsed.data !== null && !Array.isArray(parsed.data)
      ? parsed.data as Record<string, unknown>
      : parsed;

    // Prefix custom_id so the modal submit handler can identify test modals.
    // We preserve any custom_id the user provided as the suffix.
    const userCustomId = typeof modalPayload.custom_id === 'string' && modalPayload.custom_id.trim() !== ''
      ? modalPayload.custom_id
      : generateId();

    const modalData = { ...modalPayload, custom_id: `${TEST_MODAL_PREFIX}${userCustomId}` };

    try {
      // Pass the raw API object via the JSONEncodable interface — discord.js calls toJSON()
      // and forwards the result directly to the Discord API.
      await interaction.showModal({ toJSON: () => modalData } as any);
    } catch {
    }
  }
}

interface ExtractedField {
  customId: string;
  values: string[];
}

function extractFields(components: unknown[]): ExtractedField[] {
  const results: ExtractedField[] = [];
  for (const comp of components) {
    if (typeof comp !== 'object' || comp === null) continue;
    const c = comp as Record<string, unknown>;

    // discord.js exposes camelCase (customId) but raw API uses snake_case (custom_id)
    const id = (typeof c.customId === 'string' ? c.customId : null)
      ?? (typeof c.custom_id === 'string' ? c.custom_id : null);
    if (id !== null) {
      if (typeof c.value === 'string') {
        // TextInput (4)
        results.push({ customId: id, values: [c.value] });
      } else if (Array.isArray(c.values)) {
        // Selects (3,5,6,7,8), RadioGroup (21), CheckboxGroup (22)
        results.push({ customId: id, values: c.values as string[] })
      } else if (typeof c.filename === 'string') {
        // FileUpload (19)
        const size = typeof c.fileSize === 'number' || typeof c.file_size === 'number'
          ? ` (${c.fileSize ?? c.file_size} bytes)`
          : '';
        results.push({ customId: id, values: [`${c.filename}${size}`] });
      } else if (typeof c.value === 'boolean') {
        // Checkbox (23)
        results.push({ customId: id, values: [c.value ? 'checked' : 'unchecked'] });
      }
    }

    if (Array.isArray(c.components)) results.push(...extractFields(c.components));
    if (typeof c.component === 'object' && c.component !== null) results.push(...extractFields([c.component]));
  }
  return results;
}

export async function handleTestModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
  const rawComponents: unknown[] = (interaction as any).components ?? [];
  const fields = extractFields(rawComponents);

  const lines = fields.length > 0
    ? fields.map(f => `\`${f.customId}\`  →  ${f.values.length > 0 ? f.values.join(', ') : '*(empty)*'}`)
    : ['*(no fields)*'];

  const json = JSON.stringify(rawComponents, null, 2);

  await interaction.reply({
    content: `**Modal submitted!**\n\n${lines.join('\n')}\n\`\`\`json\n${json.slice(0, 1800)}\n\`\`\``,
    flags: MessageFlags.Ephemeral
  });
}
