import { SlashCommandSubcommandBuilder } from 'discord.js';
import type { APIInvite } from 'discord-api-types/v10';
import axios from 'axios';
import { BaseCommand } from '../core/command';
import { CommandContext } from '../types';
import { ResponseBuilder, sendResponse, sendError } from '../core/response';
import { parseInviteCode, formatDiscordTimestamp, joinNonEmpty, buildCdnUrl } from '../utils/parsers';
import { Endpoints } from '../core/config';
import { logger } from '../utils/logger';
import { LogArea } from '../types/logger';
export class InviteCommand extends BaseCommand {
  public readonly name = 'invite';
  public readonly description = 'Get information about a Discord invite';

  public buildCommand(): SlashCommandSubcommandBuilder {
    return this.addEphemeralOption(
      new SlashCommandSubcommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption(option =>
          option
            .setName('code')
            .setDescription('The invite code to look up')
            .setRequired(true)
        )
    );
  }

  public async execute(context: CommandContext): Promise<void> {
    const { interaction } = context;
    const codeInput = interaction.options.getString('code', true);
    const ephemeral = this.getEphemeralSetting(context);

    try {
      const { code } = parseInviteCode(codeInput);
      const response = await axios.get(
        `${Endpoints.DISCORD_API}/invites/${code}?with_counts=true&with_expiration=true`
      );
      const inviteData: APIInvite = response.data;
      
      const inviteResponse = this.buildInviteResponse(inviteData, code);
      await sendResponse(interaction, inviteResponse, ephemeral);

    } catch (error: any) {
      const { code } = parseInviteCode(codeInput);
      
      if (error.response?.status === 404) {
        await sendError(
          interaction,
          `Invite code \`${code}\` was not found. It may be expired, revoked, or invalid.\n\n[API URL](${Endpoints.DISCORD_API}/invites/${code}?with_counts=true&with_expiration=true)`
        );
      } else if (error.response?.status === 429) {
        logger.warning(LogArea.API, `Rate limited when fetching invite: ${code}`);
        await sendError(
          interaction,
          `Too many requests. Please try again in a moment.`
        );
      } else {
        logger.error(
          LogArea.API,
          `Error fetching invite ${code}: ${error.message || error}`
        );
        await sendError(
          interaction,
          `Failed to fetch invite information for \`${code}\`. Please check the code and try again.\n\n[API URL](${Endpoints.DISCORD_API}/invites/${code}?with_counts=true&with_expiration=true)`
        );
      }
    }
  }

  private buildInviteResponse(invite: APIInvite, code: string): ReturnType<ResponseBuilder['build']> {
    const builder = new ResponseBuilder();
    const { guild, channel, inviter } = invite;

    if (!guild) {
      builder.addText('❌ **Error:** Unable to retrieve guild information for this invite.');
      return builder.build();
    }

    const guildIconUrl = guild.icon ? buildCdnUrl('icons', guild.id, guild.icon) : undefined;
    const description = guild.description || 'No description.';
    const memberCount = invite.approximate_member_count ?? null;
    const onlineCount = invite.approximate_presence_count ?? null;

    builder.addMainSection(guild.name, description, guildIconUrl, description);
    const guildInfo = joinNonEmpty([
      `**ID:** \`${guild.id}\``,
      memberCount !== null ? `**Members:** \`${memberCount}\`` : '**Members:** `Hidden`',
      onlineCount !== null ? `**Online:** \`${onlineCount}\`` : '**Online:** `Hidden`',
      channel?.name ? `**Channel:** \`${channel.name}\`` : null,
      invite.expires_at ? `**Expires:** ${formatDiscordTimestamp(new Date(invite.expires_at).getTime())}` : `**Expires:** \`Never\``,
      (guild.vanity_url_code && code === guild.vanity_url_code) ? null : `**Invite:** https://discord.gg/${code}`,
      guild.vanity_url_code ? `**Vanity:** https://discord.gg/${guild.vanity_url_code}` : null,
      guild.premium_subscription_count ? `**Boosts:** \`${guild.premium_subscription_count}\`` : null
    ]);

    builder.addTextSection('Guild', guildInfo);

    if (inviter) {
      const inviterAvatarUrl = inviter.avatar ? buildCdnUrl('avatars', inviter.id, inviter.avatar) : undefined;
      const inviterInfo = joinNonEmpty([
        `**ID:** \`${inviter.id}\``,
        `**Username:** \`${inviter.username}\``,
        inviter.global_name ? `**Global Name:** \`${inviter.global_name}\`` : null,
        `**Mention:** <@${inviter.id}>`
      ]);

      builder.addThumbnailSection('Inviter', inviterInfo, inviterAvatarUrl, inviter.global_name || '');
    }

    builder.addText(`**API URL:** ${Endpoints.DISCORD_API}/invites/${code}?with_counts=true&with_expiration=true`);
    const mediaUrl = guild?.banner ? buildCdnUrl('banners', guild.id, guild.banner, 4096) :
                     guild?.splash ? buildCdnUrl('splashes', guild.id, guild.splash, 4096) : null;
    
    if (mediaUrl) {
      builder.addMediaGallery(mediaUrl);
    }

    return builder.build();
  }
}
