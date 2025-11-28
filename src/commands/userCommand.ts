import { SlashCommandSubcommandBuilder, User, UserFlagsString } from 'discord.js';
import { BaseCommand } from '../core/command';
import { CommandContext } from '../types';
import { ResponseBuilder, sendResponse, sendError } from '../core/response';
import { parseUserId, formatDiscordTimestamp, joinNonEmpty } from '../utils/parsers';
import { BadgeService } from '../services/badgeService';
import { logger } from '../utils/logger';
import { LogArea } from '../types/logger';

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
      const { userId } = parseUserId(userIdInput);

      const user: User = await client.users.fetch(userId, { force: true });

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

    const avatarUrl = user.avatarURL({ size: 512 }) || user.defaultAvatarURL;
    const flags = user.flags?.toArray() || [];
    const badgeService = BadgeService.getInstance();
    const basicInfo = joinNonEmpty([
      `**Username:** \`${user.username}\``,
      user.globalName ? `**Global Name:** \`${user.globalName}\`` : null,
      `**ID:** \`${user.id}\``,
      `**Mention:** <@${user.id}>`,
      `**Created:** ${formatDiscordTimestamp(user.createdTimestamp)}`,
      `**Account Age:** ${formatDiscordTimestamp(user.createdTimestamp, 'R')}`,
      flags.length > 0 ? `**Badges:** ${badgeService.parseBadges(flags.map(flag => flag.toString()))}` : null,
      this.getUserTypeInfo(user, flags),
      this.getUserAvatarDecorationInfo(user),
      this.getUserCollectiblesInfo(user),
      this.getUserPrimaryGuildInfo(user)
    ]);

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

    // Add avatar decoration and guild tag badge in the same row if available
    const avatarDecorationUrl = user.avatarDecorationURL();
    const guildTagBadgeUrl = user.guildTagBadgeURL();

    if (avatarDecorationUrl || guildTagBadgeUrl) {
      const decorationUrls = [avatarDecorationUrl, guildTagBadgeUrl].filter(Boolean) as string[];
      builder.addMediaGalleryMultiple(decorationUrls);
    }

    return builder.build();
  }

  private getUserTypeInfo(user: User, flags: UserFlagsString[]): string | null {
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

  private getUserAvatarDecorationInfo(user: User): string | null {
    try {
      if (user.avatarDecorationData) {
        const { skuId } = user.avatarDecorationData;
        return `**Avatar Decoration:** SKU \`${skuId}\``;
      }
    } catch (error) {
      logger.error(
        LogArea.COMMANDS,
        `Error reading avatar decoration: ${error instanceof Error ? error.message : error}`
      );
    }

    return null;
  }

  private getUserCollectiblesInfo(user: User): string | null {
    try {
      if (user.collectibles?.nameplate) {
        const { nameplate } = user.collectibles;
        return `**Profile Decoration:** ${nameplate.label || 'Custom Nameplate'}`;
      }
    } catch (error) {
      logger.error(
        LogArea.COMMANDS,
        `Error reading collectibles: ${error instanceof Error ? error.message : error}`
      );
    }

    return null;
  }

  private getUserPrimaryGuildInfo(user: User): string | null {
    try {
      if (user.primaryGuild) {
        const parts: string[] = [];

        if (user.primaryGuild.tag) {
          parts.push(`\`${user.primaryGuild.tag}\``);
        }

        if (user.primaryGuild.badge) {
          parts.push(`Badge: ${user.primaryGuild.badge}`);
        }

        if (parts.length > 0) {
          return `**Primary Guild:** ${parts.join(' • ')}`;
        }
      }
    } catch (error) {
      logger.error(
        LogArea.COMMANDS,
        `Error reading primary guild: ${error instanceof Error ? error.message : error}`
      );
    }

    return null;
  }
}
