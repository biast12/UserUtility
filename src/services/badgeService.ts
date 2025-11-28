import type { ApplicationEmoji, Client } from 'discord.js';
import { BadgeDefinition, BadgeEmojiConfig } from '../types';
import badgeDefinitions from '../utils/badges.json';
import { logger } from '../utils/logger';
import { LogArea } from '../types/logger';

export class BadgeService {
  private static instance: BadgeService;
  private badgeEmojiMap: BadgeEmojiConfig = {};
  private client: Client | null = null;

  private constructor() {
    this.initializeBadgeMap();
  }

  public static getInstance(): BadgeService {
    if (!BadgeService.instance) {
      BadgeService.instance = new BadgeService();
    }
    return BadgeService.instance;
  }

  public setClient(client: Client): void {
    this.client = client;
  }

  private initializeBadgeMap(): void {
    for (const badge of badgeDefinitions as BadgeDefinition[]) {
      const emojiId = process.env[badge.EmojiIDEnv];
      if (emojiId) {
        this.badgeEmojiMap[badge.FlagName] = `<:${badge.EmojiName}:${emojiId}>`;
      }
    }
  }

  public async loadFromApplicationEmojis(): Promise<void> {
    if (!this.client?.application) {
      logger.warning(LogArea.COMMANDS, 'Cannot load application emojis: client not initialized');
      return;
    }

    try {
      const emojis = await this.client.application.emojis.fetch();

      for (const badge of badgeDefinitions as BadgeDefinition[]) {
        const emoji = emojis.find(e => e.name === badge.EmojiName);

        if (emoji && this.isApplicationEmojiAvailable(emoji)) {
          this.badgeEmojiMap[badge.FlagName] = `<:${emoji.name}:${emoji.id}>`;
        }
      }

      logger.info(
        LogArea.COMMANDS,
        `Loaded ${Object.keys(this.badgeEmojiMap).length} badge emojis from application`
      );
    } catch (error) {
      logger.error(
        LogArea.COMMANDS,
        `Failed to load application emojis: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  private isApplicationEmojiAvailable(emoji: ApplicationEmoji): boolean {
    return emoji.available;
  }

  public parseBadges(flags: string[]): string {
    const badges = flags
      .map(flag => this.badgeEmojiMap[flag])
      .filter(Boolean);
    
    return badges.join(' ');
  }

  public hasBadgesConfigured(): boolean {
    return Object.keys(this.badgeEmojiMap).length > 0;
  }

  public getRawBadges(flags: string[]): string {
    return flags.map(flag => `\`${flag}\``).join(', ');
  }
}
