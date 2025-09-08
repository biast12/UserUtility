import { SlashCommandSubcommandBuilder } from 'discord.js';
import { BaseCommand } from '../core/command';
import { CommandContext } from '../types';
import { ResponseBuilder, sendResponse, sendError } from '../core/response';
import { formatDiscordTimestamp, joinNonEmpty } from '../utils/parsers';
import { logger } from '../utils/logger';
import { LogArea } from '../types/logger';

/**
 * Command to decode Discord snowflake IDs
 */
export class SnowflakeCommand extends BaseCommand {
  public readonly name = 'snowflake';
  public readonly description = 'Decode Discord snowflake IDs to get creation date and other info';

  public buildCommand(): SlashCommandSubcommandBuilder {
    return this.addEphemeralOption(
      new SlashCommandSubcommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption(option =>
          option
            .setName('id')
            .setDescription('Discord ID (snowflake) to decode')
            .setRequired(true)
        )
    );
  }

  public async execute(context: CommandContext): Promise<void> {
    const { interaction } = context;
    const idInput = interaction.options.getString('id', true);
    const ephemeral = this.getEphemeralSetting(context);

    try {
      // Clean the ID (remove mentions if present)
      const cleanId = this.extractId(idInput);
      
      // Validate snowflake
      if (!this.isValidSnowflake(cleanId)) {
        await sendError(interaction, 'Invalid Discord ID format. Please provide a valid Discord snowflake ID.');
        return;
      }

      const response = this.buildSnowflakeResponse(cleanId);
      await sendResponse(interaction, response, ephemeral);

    } catch (error) {
      logger.error(
        LogArea.COMMANDS,
        `Error decoding snowflake: ${error instanceof Error ? error.message : error}`
      );
      await sendError(
        interaction,
        'Failed to decode the Discord ID. Please make sure it\'s a valid Discord snowflake.'
      );
    }
  }

  private extractId(input: string): string {
    // Remove mentions and other formatting
    const mentionMatch = input.match(/<[@#&]:?(\d+)>/);
    if (mentionMatch) {
      return mentionMatch[1];
    }
    
    // Remove non-digit characters
    return input.replace(/\D/g, '');
  }

  private isValidSnowflake(id: string): boolean {
    // Discord snowflakes are 64-bit integers
    const snowflake = BigInt(id);
    const discordEpoch = BigInt(1420070400000); // Discord's epoch (2015-01-01)
    
    // Check if the timestamp is reasonable
    const timestamp = (snowflake >> 22n) + discordEpoch;
    const now = BigInt(Date.now());
    
    return timestamp > discordEpoch && timestamp <= now;
  }

  private decodeSnowflake(id: string): {
    timestamp: number;
    workerId: number;
    processId: number;
    increment: number;
    binary: string;
  } {
    const snowflake = BigInt(id);
    const discordEpoch = BigInt(1420070400000);
    
    // Extract components
    const timestamp = Number((snowflake >> 22n) + discordEpoch);
    const workerId = Number((snowflake & 0x3E0000n) >> 17n);
    const processId = Number((snowflake & 0x1F000n) >> 12n);
    const increment = Number(snowflake & 0xFFFn);
    const binary = snowflake.toString(2).padStart(64, '0');
    
    return { timestamp, workerId, processId, increment, binary };
  }

  private getIdType(id: string): string {
    const snowflake = BigInt(id);
    const timestamp = Number((snowflake >> 22n) + BigInt(1420070400000));
    const date = new Date(timestamp);
    
    // Try to guess the type based on creation time and patterns
    // This is just for fun - we can't actually determine the exact type
    const year = date.getFullYear();
    
    if (year < 2016) return 'Early Discord Object';
    if (year < 2017) return 'User, Guild, or Channel';
    if (year < 2019) return 'Message, User, or Guild';
    
    return 'Unknown Discord Object';
  }

  private buildSnowflakeResponse(id: string): ReturnType<ResponseBuilder['build']> {
    const builder = new ResponseBuilder();
    const decoded = this.decodeSnowflake(id);
    const creationDate = new Date(decoded.timestamp);
    const idType = this.getIdType(id);
    
    // All info in one section to avoid component issues
    const allInfo = joinNonEmpty([
      `**ID:** \`${id}\``,
      `**Type:** \`${idType}\``,
      `**Created:** ${formatDiscordTimestamp(decoded.timestamp)} (${creationDate.toLocaleString()})`,
      `**Age:** ${formatDiscordTimestamp(decoded.timestamp, 'R')}`,
      '',
      '**Technical Details:**',
      `• **Unix Timestamp:** \`${Math.floor(decoded.timestamp / 1000)}\``,
      `• **Worker ID:** \`${decoded.workerId}\``,
      `• **Process ID:** \`${decoded.processId}\``,
      `• **Increment:** \`${decoded.increment}\``,
      `• **Binary:** \`${decoded.binary}\``,
      '',
      '**Snowflake Format:**',
      '\`TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT WWWWW PPPPP IIIIIIIIIIII\`',
      '• **T (42 bits):** Timestamp since Discord epoch',
      '• **W (5 bits):** Worker ID (0-31)',  
      '• **P (5 bits):** Process ID (0-31)',
      '• **I (12 bits):** Increment (0-4095)',
      '',
      '**Discord Epoch:** January 1, 2015 00:00:00 UTC',
      `**Theoretical Max:** ~${new Date(2015, 0, 1).getFullYear() + 139} (69 years from epoch)`
    ]);

    // Use simple text display instead of complex sections
    builder.addText(`# Discord Snowflake Decoder\n\n${allInfo}`);

    return builder.build();
  }
}
