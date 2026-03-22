import { Patterns } from '../core/config';
import { UserIdParseResult, InviteCodeParseResult, DomainValidationResult } from '../types';

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

export function validateDomain(input: string): DomainValidationResult {
  let domain = input.trim().toLowerCase();
  if (!Patterns.DOMAIN_PROTOCOL.test(domain)) {
    domain = `https://${domain}`;
  }

  try {
    const url = new URL(domain);
    const hostname = url.hostname;

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

export function formatDiscordTimestamp(timestamp: number, format: string = 'R'): string {
  return `<t:${Math.floor(timestamp / 1000)}:${format}>`;
}

export function buildCdnUrl(type: 'icons' | 'banners' | 'splashes' | 'avatars', id: string, hash: string, size?: number): string {
  const baseUrl = `https://cdn.discordapp.com/${type}/${id}/${hash}.png`;
  return size ? `${baseUrl}?size=${size}` : baseUrl;
}

export function joinNonEmpty(values: (string | null | undefined)[], separator: string = '\n'): string {
  return values.filter(Boolean).join(separator);
}

/** Strip // line comments from JSON-like text, ignoring // inside string literals. */
export function stripJsonComments(input: string): string {
  let out = '';
  let i = 0;
  while (i < input.length) {
    if (input[i] === '"') {
      // Copy the entire string literal verbatim (handles \" escapes)
      out += input[i++];
      while (i < input.length) {
        if (input[i] === '\\') {
          out += input[i++];
          if (i < input.length) out += input[i++];
        } else if (input[i] === '"') {
          out += input[i++];
          break;
        } else {
          out += input[i++];
        }
      }
    } else if (input[i] === '/' && input[i + 1] === '/') {
      // Skip until end of line or the next JSON structural character,
      // whichever comes first — handles single-line Discord input with no real newlines.
      while (i < input.length && input[i] !== '\n' && input[i] !== '"' && input[i] !== '{' && input[i] !== '[' && input[i] !== '}' && input[i] !== ']') i++;
    } else {
      out += input[i++];
    }
  }
  return out;
}
