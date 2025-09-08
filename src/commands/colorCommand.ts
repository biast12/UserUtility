import { SlashCommandSubcommandBuilder, AutocompleteInteraction } from 'discord.js';
import { BaseCommand } from '../core/command';
import { CommandContext, AutocompleteContext } from '../types';
import { ResponseBuilder, sendResponse, sendError } from '../core/response';
import { joinNonEmpty } from '../utils/parsers';
import { logger } from '../utils/logger';
import { LogArea } from '../types/logger';

export class ColorCommand extends BaseCommand {
  public readonly name = 'color';
  public readonly description = 'Convert and preview colors in different formats';

  public buildCommand(): SlashCommandSubcommandBuilder {
    return this.addEphemeralOption(
      new SlashCommandSubcommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption(option =>
          option
            .setName('color')
            .setDescription('Color in hex (#ff0000), rgb (255,0,0), or decimal (16711680) format')
            .setRequired(true)
            .setAutocomplete(true)
        )
    );
  }

  public async execute(context: CommandContext): Promise<void> {
    const { interaction } = context;
    const colorInput = interaction.options.getString('color', true);
    const ephemeral = this.getEphemeralSetting(context);

    try {
      const color = this.parseColor(colorInput);
      if (!color) {
        await sendError(
          interaction,
          'Invalid color format. Please use hex (#ff0000), RGB (255,0,0), or decimal (16711680) format.'
        );
        return;
      }

      const response = this.buildColorResponse(color);
      await sendResponse(interaction, response, ephemeral);

    } catch (error) {
      logger.error(
        LogArea.COMMANDS,
        `Error processing color: ${error instanceof Error ? error.message : error}`
      );
      await sendError(
        interaction,
        'Failed to process the color. Please check the format and try again.'
      );
    }
  }

  private parseColor(input: string): { r: number; g: number; b: number } | null {
    const cleaned = input.trim().toLowerCase();

    const hexMatch = cleaned.match(/^#?([a-f0-9]{6}|[a-f0-9]{3})$/);
    if (hexMatch) {
      let hex = hexMatch[1];
      if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
      }
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return { r, g, b };
    }

    const rgbMatch = cleaned.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      if (r <= 255 && g <= 255 && b <= 255) {
        return { r, g, b };
      }
    }

    const simpleRgbMatch = cleaned.match(/^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)$/);
    if (simpleRgbMatch) {
      const r = parseInt(simpleRgbMatch[1]);
      const g = parseInt(simpleRgbMatch[2]);
      const b = parseInt(simpleRgbMatch[3]);
      if (r <= 255 && g <= 255 && b <= 255) {
        return { r, g, b };
      }
    }

    const decimalMatch = cleaned.match(/^(\d+)$/);
    if (decimalMatch) {
      const decimal = parseInt(decimalMatch[1]);
      if (decimal <= 16777215) {
        const r = (decimal >> 16) & 0xFF;
        const g = (decimal >> 8) & 0xFF;
        const b = decimal & 0xFF;
        return { r, g, b };
      }
    }

    return null;
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  private getColorName(r: number, g: number, b: number): string {
    const colors = [
      { name: 'Red', r: 255, g: 0, b: 0 },
      { name: 'Green', r: 0, g: 255, b: 0 },
      { name: 'Blue', r: 0, g: 0, b: 255 },
      { name: 'Yellow', r: 255, g: 255, b: 0 },
      { name: 'Cyan', r: 0, g: 255, b: 255 },
      { name: 'Magenta', r: 255, g: 0, b: 255 },
      { name: 'White', r: 255, g: 255, b: 255 },
      { name: 'Black', r: 0, g: 0, b: 0 },
      { name: 'Orange', r: 255, g: 165, b: 0 },
      { name: 'Purple', r: 128, g: 0, b: 128 },
      { name: 'Pink', r: 255, g: 192, b: 203 },
      { name: 'Brown', r: 165, g: 42, b: 42 },
      { name: 'Gray', r: 128, g: 128, b: 128 },
      { name: 'Discord Blurple', r: 88, g: 101, b: 242 },
      { name: 'Discord Green', r: 87, g: 242, b: 135 },
      { name: 'Discord Yellow', r: 254, g: 231, b: 92 },
      { name: 'Discord Red', r: 237, g: 66, b: 69 }
    ];

    let closestColor = colors[0];
    let minDistance = Infinity;

    for (const color of colors) {
      const distance = Math.sqrt(
        Math.pow(r - color.r, 2) + 
        Math.pow(g - color.g, 2) + 
        Math.pow(b - color.b, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = color;
      }
    }

    return minDistance < 50 ? closestColor.name : 'Unknown';
  }

  private buildColorResponse(color: { r: number; g: number; b: number }): ReturnType<ResponseBuilder['build']> {
    const builder = new ResponseBuilder(color.r << 16 | color.g << 8 | color.b);
    const { r, g, b } = color;
    const hsl = this.rgbToHsl(r, g, b);
    const colorName = this.getColorName(r, g, b);
    
    const allInfo = joinNonEmpty([
      `**Color Name:** \`${colorName}\``,
      `**RGB Values:** \`${r}, ${g}, ${b}\``,
      `**Brightness:** \`${Math.round((r * 0.299 + g * 0.587 + b * 0.114))}/255\``,
      '',
      '**Formats:**',
      `• **Hex:** \`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}\``,
      `• **Decimal:** \`${(r << 16) | (g << 8) | b}\``,
      `• **RGB:** \`rgb(${r}, ${g}, ${b})\``,
      `• **HSL:** \`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)\``,
      `• **Discord Embed:** \`0x${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}\``,
      `• **Role Color:** \`${(r << 16) | (g << 8) | b}\` (decimal for Discord roles)`,
      '',
      '**Usage Examples:**',
      `\`\`\`javascript\n.setColor(0x${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')})\n\`\`\``,
      `\`\`\`css\ncolor: #${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')};\n\`\`\``,
      '',
      '**Discord Role Features:**',
      '• **Gradient Roles:** Discord now supports gradient role colors!',
      '• **Role Icons:** Roles can have custom icons alongside colors',
      '• **Animated WebP:** Discord supports animated WebP for profile elements'
    ]);

    // Use simple text display instead of complex sections
    builder.addText(`# Color Preview\n\n${allInfo}`);

    return builder.build();
  }

  /**
   * Handle autocomplete for color suggestions
   */
  public async handleAutocomplete(context: AutocompleteContext): Promise<void> {
    const interaction = context.interaction;
    const focusedOption = interaction.options.getFocused();
    
    // Common color suggestions
    const colorSuggestions = [
      { name: 'Discord Blurple', value: '#5865f2' },
      { name: 'Discord Green', value: '#57f287' },
      { name: 'Discord Yellow', value: '#fee75c' },
      { name: 'Discord Red', value: '#ed4245' },
      { name: 'Discord Dark', value: '#2c2f33' },
      { name: 'Red', value: '#ff0000' },
      { name: 'Green', value: '#00ff00' },
      { name: 'Blue', value: '#0000ff' },
      { name: 'Yellow', value: '#ffff00' },
      { name: 'Orange', value: '#ffa500' },
      { name: 'Purple', value: '#800080' },
      { name: 'Pink', value: '#ffc0cb' },
      { name: 'Cyan', value: '#00ffff' },
      { name: 'White', value: '#ffffff' },
      { name: 'Black', value: '#000000' },
      { name: 'Gray', value: '#808080' }
    ];

    // Filter suggestions based on user input
    const filtered = colorSuggestions
      .filter(color => 
        color.name.toLowerCase().includes(focusedOption.toLowerCase()) ||
        color.value.toLowerCase().includes(focusedOption.toLowerCase())
      )
      .slice(0, 25); // Discord limit

    await interaction.respond(filtered);
  }
}
