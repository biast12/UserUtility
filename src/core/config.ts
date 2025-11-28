import 'dotenv/config';
import { logger } from '../utils/logger';
import { LogArea } from '../types/logger';

export interface BotConfig {
  token: string;
  clientId?: string;
}

export interface BadgeEmojiConfig {
  [flagName: string]: string;
}

export const Colors = {
  DISCORD_BLUE: 0x5865F2,
  ERROR_RED: 0xED4245,
  SUCCESS_GREEN: 0x57F287,
  WARNING_YELLOW: 0xFEE75C,
} as const;

export const Endpoints = {
  DISCORD_API: 'https://discord.com/api/v10',
  DISCORD_CDN: 'https://cdn.discordapp.com',
  BAD_DOMAINS: 'https://cdn.discordapp.com/bad-domains/updated_hashes.json',
} as const;

export const Patterns = {
  USER_MENTION: /^<@!?(\d+)>$/,
  INVITE_URL: /(?:https?:\/\/)?(?:www\.)?discord(?:app)?\.gg\/([a-zA-Z0-9-]+)/i,
  DOMAIN_PROTOCOL: /^https?:\/\//,
} as const;

export function getBotConfig(): BotConfig {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    throw new Error('BOT_TOKEN is required but not set in environment variables');
  }

  let clientId = process.env.CLIENT_ID;
  if (!clientId) {
    try {
      const tokenPart = token.split('.')[0];
      clientId = Buffer.from(tokenPart, 'base64').toString('utf8');
      if (!/^\d+$/.test(clientId)) {
        clientId = undefined;
      }
    } catch { }
  }

  return { token, clientId };
}

export function validateConfig(): void {
  getBotConfig();
  logger.info(LogArea.STARTUP, 'Environment variables are set correctly.');
}
