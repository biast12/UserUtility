import {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  ContainerBuilder,
  MessageFlags,
  BitFieldResolvable,
  MessageFlagsString,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction
} from 'discord.js';

// Core command interfaces
export interface CommandContext {
  client: Client;
  interaction: ChatInputCommandInteraction;
}

export interface MessageContextMenuContext {
  client: Client;
  interaction: MessageContextMenuCommandInteraction;
}

export interface UserContextMenuContext {
  client: Client;
  interaction: UserContextMenuCommandInteraction;
}

export type ContextMenuContext = MessageContextMenuContext | UserContextMenuContext;

export interface AutocompleteContext {
  client: Client;
  interaction: AutocompleteInteraction;
}

export interface CommandOptions {
  ephemeral?: boolean;
}

// Response types
export interface ComponentResponse {
  components: ContainerBuilder[];
  flags?:
  | BitFieldResolvable<
    Extract<MessageFlagsString, 'Ephemeral' | 'SuppressEmbeds' | 'SuppressNotifications' | 'IsComponentsV2'>,
    | MessageFlags.Ephemeral
    | MessageFlags.SuppressEmbeds
    | MessageFlags.SuppressNotifications
    | MessageFlags.IsComponentsV2
  >
  | undefined;
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

// Re-export commonly used discord.js types for convenience
export type {
  // User-related types
  Collectibles,
  NameplateData,
  UserPrimaryGuild,
  AvatarDecorationData,
  UserFlagsString,
  UserFlagsBitField,

  // Message-related types
  Message,
  MessageFlagsString,
  MessageFlagsBitField,
  MessageType,
  MessageCall,

  // Guild-related types
  Guild,
  GuildMember,

  // Poll types
  Poll,
  PollAnswer,

  // Emoji types
  ApplicationEmoji,

  // Attachment types
  Attachment
} from 'discord.js';

// Re-export discord-api-types for API structures
export type { APIInvite } from 'discord-api-types/v10';
// Export InviteType enum as both type and value
export { InviteType } from 'discord-api-types/v10';
