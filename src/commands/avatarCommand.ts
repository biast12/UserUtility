import { SlashCommandSubcommandBuilder } from 'discord.js';
import { BaseCommand } from '../core/command';
import { CommandContext } from '../types';
import { ResponseBuilder, sendResponse, sendError } from '../core/response';
import { parseUserId, joinNonEmpty } from '../utils/parsers';
import { logger } from '../utils/logger';
import { LogArea } from '../types/logger';

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
      const { userId } = parseUserId(userIdInput);

      const user = await client.users.fetch(userId, { cache: false, force: true });

      const response = this.buildAvatarResponse(user, size);
      await sendResponse(interaction, response, ephemeral);

    } catch (error) {
      logger.error(
        LogArea.COMMANDS,
        `Error fetching avatar for ${userIdInput}: ${error instanceof Error ? error.message : error}`
      );
      await sendError(
        interaction,
        'Failed to fetch user avatar. Please check the user ID or mention and try again.'
      );
    }
  }

  private buildAvatarResponse(user: any, size: number): ReturnType<ResponseBuilder['build']> {
    const builder = new ResponseBuilder();

    const avatarUrl = user.avatarURL({ size, extension: 'png', forceStatic: false });
    const bannerUrl = user.bannerURL({ size: 4096, extension: 'png' });

    const isAvatarAnimated = user.avatar && user.avatar.startsWith('a_');
    const isBannerAnimated = user.banner && user.banner.startsWith('a_');
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
        isAvatarAnimated ? `• [GIF (${size}px)](${user.avatarURL({ size, extension: 'gif' })})` : null,
        `• [WebP (${size}px)](${user.avatarURL({ size, extension: 'webp' })})`,
      ]) : 'This user is using the default Discord avatar.',
      bannerUrl ? '' : null,
      bannerUrl ? '**Banner Download Links:**' : null,
      bannerUrl ? joinNonEmpty([
        `• [PNG (4096px)](${user.bannerURL({ size: 4096, extension: 'png' })})`,
        `• [JPG (4096px)](${user.bannerURL({ size: 4096, extension: 'jpg' })})`,
        isBannerAnimated ? `• [GIF (4096px)](${user.bannerURL({ size: 4096, extension: 'gif' })})` : null,
        `• [WebP (4096px)](${user.bannerURL({ size: 4096, extension: 'webp' })})`,
      ]) : null,
    ]);

    builder.addText(`# ${user.globalName || user.username}'s Avatar\n\n${allInfo}`);
    if (bannerUrl) {
      builder.addMediaGallery(bannerUrl);
    }

    return builder.build();
  }
}
