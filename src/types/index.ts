import { SlashCommandBuilder, Client, ChatInputCommandInteraction } from 'discord.js';

// Core command interfaces
export interface CommandContext {
  client: Client;
  interaction: ChatInputCommandInteraction;
}

export interface CommandOptions {
  ephemeral?: boolean;
}

export interface BaseCommand {
  data: SlashCommandBuilder;
  execute(context: CommandContext): Promise<void>;
}

// Response types
export interface ComponentResponse {
  components: any[];
  flags?: number[];
}

export interface ErrorResponse extends ComponentResponse {
  error: string;
}

// Badge system
export interface BadgeDefinition {
  FlagName: string;
  EmojiName: string;
  EmojiIDEnv: string;
}

export interface BadgeEmojiConfig {
  [flagName: string]: string;
}

// Domain validation
export interface DomainValidationResult {
  isValid: boolean;
  hostname?: string;
  url?: URL;
  error?: string;
}

// User ID parsing
export interface UserIdParseResult {
  userId: string;
  wasMention: boolean;
}

// Invite code parsing
export interface InviteCodeParseResult {
  code: string;
  wasUrl: boolean;
}
