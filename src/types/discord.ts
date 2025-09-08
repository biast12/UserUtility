// Simplified and cleaned Discord API interfaces
// Only including fields we actually use to reduce complexity

export interface DiscordInvite {
  type: number;
  code: string;
  inviter?: DiscordInviter;
  expires_at: string | null;
  guild: DiscordGuild;
  guild_id: string;
  channel: DiscordChannel;
  profile?: DiscordProfile;
  approximate_member_count: number;
  approximate_presence_count: number;
  uses: number;
  max_uses: number;
}

export interface DiscordInviter {
  id: string;
  username: string;
  avatar: string | null;
  global_name: string | null;
  clan: DiscordClan | null;
}

export interface DiscordClan {
  tag: string | null;
}

export interface DiscordChannel {
  id: string;
  type: number;
  name: string;
}

export interface DiscordGuild {
  id: string;
  name: string;
  splash: string | null;
  banner: string | null;
  description: string | null;
  icon: string | null;
  vanity_url_code: string | null;
  premium_subscription_count: number;
  premium_tier: number;
}

export interface DiscordProfile {
  id: string;
  name: string;
  member_count: number;
  online_count: number;
  description: string | null;
}
