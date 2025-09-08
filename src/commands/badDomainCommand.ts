import { SlashCommandSubcommandBuilder, MessageFlags } from 'discord.js';
import { createHash } from 'crypto';
import axios from 'axios';
import { BaseCommand } from '../core/command';
import { CommandContext } from '../types';
import { sendError } from '../core/response';
import { validateDomain } from '../utils/parsers';
import { Endpoints } from '../core/config';
import { logger } from '../utils/logger';
import { LogArea } from '../types/logger';

export class BadDomainCommand extends BaseCommand {
  public readonly name = 'baddomain';
  public readonly description = 'Check if a domain is flagged as malicious';

  public buildCommand(): SlashCommandSubcommandBuilder {
    return this.addEphemeralOption(
      new SlashCommandSubcommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption(option =>
          option
            .setName('domain')
            .setDescription('The domain to check')
            .setRequired(true)
        )
    );
  }

  public async execute(context: CommandContext): Promise<void> {
    const { interaction } = context;
    const domainInput = interaction.options.getString('domain', true);
    const ephemeral = this.getEphemeralSetting(context);

    const validation = validateDomain(domainInput);
    if (!validation.isValid) {
      await sendError(interaction, validation.error!);
      return;
    }

    const { hostname, url } = validation;

    try {
      const response = await axios.get(Endpoints.BAD_DOMAINS);
      const badDomainHashes = new Set(response.data as string[]);
      
      const domainHash = createHash('sha256').update(hostname!).digest('hex');
      const isBadDomain = badDomainHashes.has(domainHash);
      const message = isBadDomain
        ? `⚠️ The domain \`${hostname}\` **is on the bad domain list**.`
        : `✅ The domain ${url} is **not** on the bad domain list.`;

      const flags = ephemeral ? MessageFlags.Ephemeral : undefined;
      await interaction.reply({ content: message, flags });

    } catch (error: any) {
      if (error.response?.status === 429) {
        logger.warning(LogArea.API, `Rate limited when checking domain: ${hostname}`);
        await sendError(interaction, 'Too many requests to the bad domain service. Please try again in a moment.');
      } else {
        logger.error(
          LogArea.API,
          `Error checking domain ${domainInput}: ${error.message || error}`
        );
        await sendError(interaction, 'Failed to check the bad domain list. Please try again later.');
      }
    }
  }
}
