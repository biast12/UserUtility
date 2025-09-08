import { SlashCommandSubcommandBuilder } from 'discord.js';
import { BaseCommand } from '../core/command';
import { CommandContext } from '../types';
import { ResponseBuilder, sendResponse, sendError } from '../core/response';
import { parseUserId, buildCdnUrl, joinNonEmpty } from '../utils/parsers';

/**
 * Command to get high-resolution user avatars and banners
 */
export class AvatarCommand extends BaseCommand {
  public readonly name = 'avatar';
  public readonly description = 'Get high-resolution avatar and banner for a Discord user';

  public buildCommand(): SlashCommandSubcommandBuilder {
    return this.addEphemeralOption(
      new SlashCommandSubcommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption(option =>
          option
            .setName('userid')
            .setDescription('The user ID or mention to get avatar for')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('size')
            .setDescription('Avatar size')
            .setRequired(false)
            .addChoices(
              { name: '128x128', value: '128' },
              { name: '256x256', value: '256' },
              { name: '512x512', value: '512' },
              { name: '1024x1024', value: '1024' },
              { name: '2048x2048', value: '2048' },
              { name: '4096x4096', value: '4096' }
            )
        )
    );
  }

  public async execute(context: CommandContext): Promise<void> {
    const { client, interaction } = context;
    const userIdInput = interaction.options.getString('userid', true);
    const size = parseInt(interaction.options.getString('size') || '1024');
    const ephemeral = this.getEphemeralSetting(context);

    try {
      // Parse user ID from mention or direct input
      const { userId } = parseUserId(userIdInput);
      
      // Fetch user data from Discord
      const user = await client.users.fetch(userId, { cache: false, force: true });
      
      // Build response
      const response = this.buildAvatarResponse(user, size);
      await sendResponse(interaction, response, ephemeral);

    } catch (error) {
      console.error(`Error fetching avatar for ${userIdInput}:`, error);
      await sendError(
        interaction,
        'Failed to fetch user avatar. Please check the user ID or mention and try again.'
      );
    }
  }

  private buildAvatarResponse(user: any, size: number): ReturnType<ResponseBuilder['build']> {
    const builder = new ResponseBuilder();
    
    // Get avatar URLs
    const avatarUrl = user.avatarURL({ size, extension: 'png', forceStatic: false });
    const defaultAvatarUrl = user.defaultAvatarURL;
    const bannerUrl = user.bannerURL({ size: 4096, extension: 'png' });
    
    // All info in one section to avoid component issues
    const allInfo = joinNonEmpty([
      `**Username:** \`${user.username}\``,
      user.globalName ? `**Global Name:** \`${user.globalName}\`` : null,
      `**ID:** \`${user.id}\``,
      `**Size:** \`${size}x${size}px\``,
      '',
      avatarUrl ? '**Avatar Download Links:**' : '**Avatar:**',
      avatarUrl ? joinNonEmpty([
        `• [PNG (${size}px)](${user.avatarURL({ size, extension: 'png' })})`,
        `• [JPG (${size}px)](${user.avatarURL({ size, extension: 'jpg' })})`,
        user.avatarURL({ extension: 'gif' }) ? `• [GIF (${size}px)](${user.avatarURL({ size, extension: 'gif' })})` : null,
        `• [WebP (${size}px)](${user.avatarURL({ size, extension: 'webp' })})`,
      ]) : 'This user is using the default Discord avatar.',
      bannerUrl ? '' : null,
      bannerUrl ? '**Banner Download Links:**' : null,
      bannerUrl ? joinNonEmpty([
        `• [PNG (4096px)](${user.bannerURL({ size: 4096, extension: 'png' })})`,
        `• [JPG (4096px)](${user.bannerURL({ size: 4096, extension: 'jpg' })})`,
        user.bannerURL({ extension: 'gif' }) ? `• [GIF (4096px)](${user.bannerURL({ size: 4096, extension: 'gif' })})` : null,
        `• [WebP (4096px)](${user.bannerURL({ size: 4096, extension: 'webp' })})`,
      ]) : null
    ]);

    // Use simple text display with avatar as accent
    builder.addText(`# ${user.globalName || user.username}'s Avatar\n\n${allInfo}`);
    
    // Add banner to media gallery if available
    if (bannerUrl) {
      builder.addMediaGallery(bannerUrl);
    }

    return builder.build();
  }
}
