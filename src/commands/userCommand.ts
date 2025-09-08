import { SlashCommandSubcommandBuilder, User } from 'discord.js';
import { BaseCommand } from '../core/command';
import { CommandContext } from '../types';
import { ResponseBuilder, sendResponse, sendError } from '../core/response';
import { parseUserId, formatDiscordTimestamp, joinNonEmpty, buildCdnUrl } from '../utils/parsers';
import { BadgeService } from '../services/badgeService';

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
      
      // Fetch user data from Discord
      const user: User = await client.users.fetch(userId, { cache: false });
      
      // Build response
      const response = this.buildUserResponse(user);
      await sendResponse(interaction, response, ephemeral);

    } catch (error) {
      console.error(`Error fetching user ${userIdInput}:`, error);
      await sendError(
        interaction,
        'Failed to fetch user information. Please check the user ID or mention and try again.'
      );
    }
  }

  private buildUserResponse(user: User): ReturnType<ResponseBuilder['build']> {
    const builder = new ResponseBuilder();
    
    // Get user information
    const avatarUrl = user.avatarURL() || user.defaultAvatarURL;
    const flags = user.flags?.toArray() || [];
    const badgeService = BadgeService.getInstance();
    
    // Build user info content
    const userInfo = joinNonEmpty([
      `**Username:** \`${user.username}\``,
      user.globalName ? `**Global Name:** \`${user.globalName}\`` : null,
      `**ID:** \`${user.id}\``,
      `**Mention:** <@${user.id}>`,
      `**Created:** ${formatDiscordTimestamp(user.createdTimestamp)}`,
      flags.length > 0 ? `**Badges:** ${badgeService.parseBadges(flags.map(flag => flag.toString()))}` : null,
      this.getUserTypeInfo(user, flags)
    ]);

    // Add main section with avatar
    builder.addMainSection(
      user.globalName || user.username,
      userInfo,
      avatarUrl
    );

    return builder.build();
  }

  private getUserTypeInfo(user: User, flags: any[]): string | null {
    if (user.system) {
      return '**This user is a system account**';
    }
    
    if (user.bot) {
      const isVerified = flags.some(flag => flag.toString() === 'VerifiedBot');
      return isVerified 
        ? '**This user is a verified bot**'
        : '**This user is a bot**';
    }
    
    return null;
  }
}
