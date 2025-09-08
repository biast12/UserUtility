import { Patterns } from '../core/config';
import { UserIdParseResult, InviteCodeParseResult, DomainValidationResult } from '../types';

/**
 * Parse user ID from mention or direct ID
 */
export function parseUserId(input: string): UserIdParseResult {
  const match = input.match(Patterns.USER_MENTION);
  if (match) {
    return {
      userId: match[1],
      wasMention: true
    };
  }
  
  return {
    userId: input,
    wasMention: false
  };
}

/**
 * Parse invite code from URL or direct code
 */
export function parseInviteCode(input: string): InviteCodeParseResult {
  const match = input.match(Patterns.INVITE_URL);
  if (match) {
    return {
      code: match[1],
      wasUrl: true
    };
  }
  
  return {
    code: input,
    wasUrl: false
  };
}

/**
 * Validate and parse domain
 */
export function validateDomain(input: string): DomainValidationResult {
  let domain = input.trim().toLowerCase();
  
  // Add protocol if missing
  if (!Patterns.DOMAIN_PROTOCOL.test(domain)) {
    domain = `https://${domain}`;
  }

  try {
    const url = new URL(domain);
    const hostname = url.hostname;
    
    // Basic validation: must have at least one dot and no spaces
    if (!hostname.includes('.') || /\s/.test(hostname)) {
      return {
        isValid: false,
        error: 'Invalid domain format. Domain must contain at least one dot and no spaces.'
      };
    }

    return {
      isValid: true,
      hostname,
      url
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid domain format. Please provide a valid domain name (e.g., example.com).'
    };
  }
}

/**
 * Format Discord timestamp
 */
export function formatDiscordTimestamp(timestamp: number, format: string = 'R'): string {
  return `<t:${Math.floor(timestamp / 1000)}:${format}>`;
}

/**
 * Build Discord CDN URL
 */
export function buildCdnUrl(type: 'icons' | 'banners' | 'splashes' | 'avatars', id: string, hash: string, size?: number): string {
  const baseUrl = `https://cdn.discordapp.com/${type}/${id}/${hash}.png`;
  return size ? `${baseUrl}?size=${size}` : baseUrl;
}

/**
 * Filter and join non-empty values
 */
export function joinNonEmpty(values: (string | null | undefined)[], separator: string = '\n'): string {
  return values.filter(Boolean).join(separator);
}
