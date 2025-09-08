import { BadgeDefinition, BadgeEmojiConfig } from '../types';
import badgeDefinitions from '../utils/badges.json';

/**
 * Service for handling Discord user badges with emoji display
 */
export class BadgeService {
  private static instance: BadgeService;
  private badgeEmojiMap: BadgeEmojiConfig = {};

  private constructor() {
    this.initializeBadgeMap();
  }

  public static getInstance(): BadgeService {
    if (!BadgeService.instance) {
      BadgeService.instance = new BadgeService();
    }
    return BadgeService.instance;
  }

  /**
   * Initialize badge emoji mapping from environment variables
   */
  private initializeBadgeMap(): void {
    for (const badge of badgeDefinitions as BadgeDefinition[]) {
      const emojiId = process.env[badge.EmojiIDEnv];
      if (emojiId) {
        this.badgeEmojiMap[badge.FlagName] = `<:${badge.EmojiName}:${emojiId}>`;
      }
    }
  }

  /**
   * Convert Discord user flags to emoji badges
   */
  public parseBadges(flags: string[]): string {
    const badges = flags
      .map(flag => this.badgeEmojiMap[flag])
      .filter(Boolean);
    
    return badges.join(' ');
  }

  /**
   * Check if any badges are configured
   */
  public hasBadgesConfigured(): boolean {
    return Object.keys(this.badgeEmojiMap).length > 0;
  }

  /**
   * Get raw badge names for debugging
   */
  public getRawBadges(flags: string[]): string {
    return flags.map(flag => `\`${flag}\``).join(', ');
  }
}
