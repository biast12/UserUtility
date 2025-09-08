import { SlashCommandSubcommandBuilder, User } from 'discord.js';
import { BaseCommand } from '../core/command';
import { CommandContext } from '../types';
import { ResponseBuilder, sendResponse, sendError } from '../core/response';
import { parseUserId, formatDiscordTimestamp, joinNonEmpty, buildCdnUrl } from '../utils/parsers';
import { BadgeService } from '../services/badgeService';
import { logger } from '../utils/logger';
import { LogArea } from '../types/logger';

/**
 * Command to look up Discord user information
 */
export class UserCommand extends BaseCommand {
  public readonly name = 'user';
  public readonly description = 'Get information about a Discord user';

  public buildCommand(): SlashCommandSubcommandBuilder {
    return this.addEphemeralOption(
      new SlashCommandSubcommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption(option =>
          option
            .setName('userid')
            .setDescription('The user ID or mention to look up')
            .setRequired(true)
        )
    );
  }

  public async execute(context: CommandContext): Promise<void> {
    const { client, interaction } = context;
    const userIdInput = interaction.options.getString('userid', true);
    const ephemeral = this.getEphemeralSetting(context);

    try {
      // Parse user ID from mention or direct input
      const { userId } = parseUserId(userIdInput);
      
      // Fetch user data from Discord with full profile information
      const user: User = await client.users.fetch(userId, { force: true });
      
      // Build response
      const response = this.buildUserResponse(user);
      await sendResponse(interaction, response, ephemeral);

    } catch (error) {
      logger.error(
        LogArea.COMMANDS,
        `Error fetching user ${userIdInput}: ${error instanceof Error ? error.message : error}`
      );
      await sendError(
        interaction,
        'Failed to fetch user information. Please check the user ID or mention and try again.'
      );
    }
  }

  private buildUserResponse(user: User): ReturnType<ResponseBuilder['build']> {
    const builder = new ResponseBuilder();
    
    // Get user information
    const avatarUrl = user.avatarURL({ size: 512 }) || user.defaultAvatarURL;
    const flags = user.flags?.toArray() || [];
    const badgeService = BadgeService.getInstance();
    
    // Basic user info
    const basicInfo = joinNonEmpty([
      `**Username:** \`${user.username}\``,
      user.globalName ? `**Global Name:** \`${user.globalName}\`` : null,
      `**ID:** \`${user.id}\``,
      `**Mention:** <@${user.id}>`,
      `**Created:** ${formatDiscordTimestamp(user.createdTimestamp)}`,
      `**Account Age:** ${formatDiscordTimestamp(user.createdTimestamp, 'R')}`,
      flags.length > 0 ? `**Badges:** ${badgeService.parseBadges(flags.map(flag => flag.toString()))}` : null,
      this.getUserTypeInfo(user, flags),
      this.getUserCollectiblesInfo(user)
    ]);

    // Add main section with avatar
    builder.addMainSection(
      user.globalName || user.username,
      basicInfo,
      avatarUrl
    );

    // Add banner if available
    const bannerUrl = user.bannerURL({ size: 1024 });
    if (bannerUrl) {
      builder.addMediaGallery(bannerUrl);
    }

    return builder.build();
  }

  private getUserTypeInfo(user: User, flags: any[]): string | null {
    if (user.system) {
      return '🤖 **This user is a system account**';
    }
    
    if (user.bot) {
      const isVerified = flags.some(flag => flag.toString() === 'VerifiedBot');
      return isVerified 
        ? '✅ **This user is a verified bot**'
        : '🤖 **This user is a bot**';
    }
    
    return null;
  }

  private getUserCollectiblesInfo(user: User): string | null {
    try {
      // Check if user has collectibles (new in Discord.js 14.22.0)
      const collectibles = (user as any).collectibles;
      if (collectibles && collectibles.length > 0) {
        const collectibleNames = collectibles.map((item: any) => {
          if (item.sku_id) {
            // Profile effect or decoration
            return item.sku_id;
          }
          return 'Unknown Collectible';
        });
        
        const collectibleCount = collectibles.length;
        return `✨ **Profile Effects:** ${collectibleCount} active ${collectibleCount === 1 ? 'effect' : 'effects'}`;
      }
    } catch (error) {
      // Collectibles not available or not supported in this version
    }
    
    return null;
  }
}
