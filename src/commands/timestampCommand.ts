import { SlashCommandSubcommandBuilder } from 'discord.js';
import { BaseCommand } from '../core/command';
import { CommandContext } from '../types';
import { ResponseBuilder, sendResponse, sendError } from '../core/response';
import { joinNonEmpty } from '../utils/parsers';
import { logger } from '../utils/logger';
import { LogArea } from '../types/logger';

/**
 * Command to convert dates/times to Discord timestamps
 */
export class TimestampCommand extends BaseCommand {
  public readonly name = 'timestamp';
  public readonly description = 'Convert dates and times to Discord timestamp format';

  public buildCommand(): SlashCommandSubcommandBuilder {
    return this.addEphemeralOption(
      new SlashCommandSubcommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption(option =>
          option
            .setName('datetime')
            .setDescription('Date/time to convert (e.g., "2024-12-25 15:30" or "now")')
            .setRequired(false)
        )
        .addIntegerOption(option =>
          option
            .setName('timestamp')
            .setDescription('Unix timestamp to convert')
            .setRequired(false)
        )
    );
  }

  public async execute(context: CommandContext): Promise<void> {
    const { interaction } = context;
    const datetimeInput = interaction.options.getString('datetime');
    const timestampInput = interaction.options.getInteger('timestamp');
    const ephemeral = this.getEphemeralSetting(context);

    try {
      let timestamp: number;

      if (timestampInput) {
        // Use provided timestamp
        timestamp = timestampInput;
      } else if (datetimeInput) {
        // Parse datetime string
        timestamp = this.parseDatetime(datetimeInput);
      } else {
        // Use current time
        timestamp = Math.floor(Date.now() / 1000);
      }

      const response = this.buildTimestampResponse(timestamp, datetimeInput || timestampInput?.toString());
      await sendResponse(interaction, response, ephemeral);

    } catch (error) {
      logger.error(
        LogArea.COMMANDS,
        `Error processing timestamp: ${error instanceof Error ? error.message : error}`
      );
      await sendError(
        interaction,
        'Failed to parse the date/time. Please use formats like "2024-12-25", "2024-12-25 15:30", "now", or a Unix timestamp.'
      );
    }
  }

  private parseDatetime(input: string): number {
    const cleaned = input.trim().toLowerCase();

    // Handle "now"
    if (cleaned === 'now') {
      return Math.floor(Date.now() / 1000);
    }

    // Handle relative times
    const relativeMatch = cleaned.match(/^(\d+)\s*(minutes?|mins?|hours?|hrs?|days?|weeks?|months?|years?)\s*(?:ago|from\s*now)?$/);
    if (relativeMatch) {
      const amount = parseInt(relativeMatch[1]);
      const unit = relativeMatch[2];
      const isAgo = cleaned.includes('ago');
      
      let milliseconds = 0;
      switch (unit) {
        case 'minute':
        case 'minutes':
        case 'min':
        case 'mins':
          milliseconds = amount * 60 * 1000;
          break;
        case 'hour':
        case 'hours':
        case 'hr':
        case 'hrs':
          milliseconds = amount * 60 * 60 * 1000;
          break;
        case 'day':
        case 'days':
          milliseconds = amount * 24 * 60 * 60 * 1000;
          break;
        case 'week':
        case 'weeks':
          milliseconds = amount * 7 * 24 * 60 * 60 * 1000;
          break;
        case 'month':
        case 'months':
          milliseconds = amount * 30 * 24 * 60 * 60 * 1000;
          break;
        case 'year':
        case 'years':
          milliseconds = amount * 365 * 24 * 60 * 60 * 1000;
          break;
      }

      const now = Date.now();
      const targetTime = isAgo ? now - milliseconds : now + milliseconds;
      return Math.floor(targetTime / 1000);
    }

    // Try to parse as date
    const date = new Date(input);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }

    return Math.floor(date.getTime() / 1000);
  }

  private buildTimestampResponse(timestamp: number, input?: string): ReturnType<ResponseBuilder['build']> {
    const builder = new ResponseBuilder();
    
    const date = new Date(timestamp * 1000);
    
    // All info in one section to avoid component issues
    const allInfo = joinNonEmpty([
      input ? `**Input:** \`${input}\`` : null,
      `**Unix Timestamp:** \`${timestamp}\``,
      `**ISO String:** \`${date.toISOString()}\``,
      `**Local Time:** \`${date.toLocaleString()}\``,
      '',
      '**Discord Formats:**',
      `\`<t:${timestamp}:t>\` → <t:${timestamp}:t> (Short Time)`,
      `\`<t:${timestamp}:T>\` → <t:${timestamp}:T> (Long Time)`,
      `\`<t:${timestamp}:d>\` → <t:${timestamp}:d> (Short Date)`,
      `\`<t:${timestamp}:D>\` → <t:${timestamp}:D> (Long Date)`,
      `\`<t:${timestamp}:f>\` → <t:${timestamp}:f> (Short Date/Time)`,
      `\`<t:${timestamp}:F>\` → <t:${timestamp}:F> (Long Date/Time)`,
      `\`<t:${timestamp}:R>\` → <t:${timestamp}:R> (Relative Time)`,
      '',
      '**Usage Examples:**',
      '• \`now\` - Current time',
      '• \`2024-12-25\` - Specific date',
      '• \`2024-12-25 15:30\` - Date with time',
      '• \`5 minutes ago\` - Relative past',
      '• \`2 hours from now\` - Relative future',
      '• Unix timestamp as integer'
    ]);

    // Use simple text display instead of complex sections
    builder.addText(`# Discord Timestamp Generator\n\n${allInfo}`);

    return builder.build();
  }
}
