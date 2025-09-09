import {
  MessageFlags,
  ChatInputCommandInteraction,
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder
} from 'discord.js';
import { Colors } from './config';
import { ComponentResponse } from '../types';

export class ResponseBuilder {
  private container: ContainerBuilder;

  constructor(color: number = Colors.DISCORD_BLUE) {
    this.container = new ContainerBuilder().setAccentColor(color);
  }

  addMainSection(title: string, content: string, thumbnailUrl?: string, thumbnailDescription?: string): this {
    const section = new SectionBuilder();
    
    if (thumbnailUrl && thumbnailUrl.trim() !== '') {
      const thumbnail = new ThumbnailBuilder().setURL(thumbnailUrl);
      if (thumbnailDescription) {
        thumbnail.setDescription(thumbnailDescription);
      }
      section.setThumbnailAccessory(thumbnail);
    }

    section.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${title}`),
      new TextDisplayBuilder().setContent(content)
    );

    this.container.addSectionComponents(section);
    return this;
  }

  addTextSection(title: string, content: string): this {
    this.container
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## **${title}**`),
        new TextDisplayBuilder().setContent(content)
      );
    return this;
  }

  addThumbnailSection(title: string, content: string, thumbnailUrl?: string, thumbnailDescription?: string): this {
    const section = new SectionBuilder();
    
    if (thumbnailUrl && thumbnailUrl.trim() !== '') {
      const thumbnail = new ThumbnailBuilder().setURL(thumbnailUrl);
      if (thumbnailDescription) {
        thumbnail.setDescription(thumbnailDescription);
      }
      section.setThumbnailAccessory(thumbnail);
    }

    section.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## **${title}**`),
      new TextDisplayBuilder().setContent(content)
    );

    this.container
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addSectionComponents(section);
    
    return this;
  }

  addText(content: string): this {
    this.container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(content)
    );
    return this;
  }

  addMediaGallery(imageUrl: string): this {
    if (imageUrl && imageUrl.trim() !== '') {
      this.container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder().setURL(imageUrl)
        )
      );
    }
    return this;
  }

  build(): ComponentResponse {
    return {
      components: [this.container],
      flags: [MessageFlags.IsComponentsV2]
    };
  }
}

export class StandardResponses {
  static error(message: string): ComponentResponse {
    return new ResponseBuilder(Colors.ERROR_RED)
      .addText('❌ **ERROR**')
      .addText(message)
      .build();
  }

  static success(message: string): ComponentResponse {
    return new ResponseBuilder(Colors.SUCCESS_GREEN)
      .addText('✅ **SUCCESS**')
      .addText(message)
      .build();
  }

  static warning(message: string): ComponentResponse {
    return new ResponseBuilder(Colors.WARNING_YELLOW)
      .addText('⚠️ **WARNING**')
      .addText(message)
      .build();
  }
}

export async function sendResponse(
  interaction: ChatInputCommandInteraction,
  response: ComponentResponse,
  ephemeral: boolean = false
): Promise<void> {
  const flags = ephemeral 
    ? [...(response.flags || []), MessageFlags.Ephemeral]
    : response.flags;

  const payload = {
    components: response.components,
    flags
  };

  if (interaction.replied || interaction.deferred) {
    await interaction.followUp(payload);
  } else {
    await interaction.reply(payload);
  }
}

export async function sendError(
  interaction: ChatInputCommandInteraction,
  message: string
): Promise<void> {
  await sendResponse(interaction, StandardResponses.error(message), true);
}
