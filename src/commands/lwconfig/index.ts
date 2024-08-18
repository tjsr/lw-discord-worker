import { CommandGroup, SlashCommandContext } from "@discord-interactions/core";
import { CommandGroupBuilder, MessageBuilder, SlashCommandStringOption, SubcommandOption } from "@discord-interactions/builders";

import { APIApplicationCommandInteractionDataStringOption } from "discord-api-types/v10";

export class LWConfigCommand extends CommandGroup {
  private _config: Map<string, string>;

  private async validateConfigConfigured(context: SlashCommandContext): Promise<boolean> {
    if (!this._config) {
      return context
        .reply(new MessageBuilder().setContent(`Config manager is not correctly configured.`))
        .then(() => false);
    }
    return Promise.resolve(true);
  }

  private async validateOption(
    context: SlashCommandContext,
    option: APIApplicationCommandInteractionDataStringOption
  ): Promise<boolean> {
    if (!this._config) {
      return context
        .reply(new MessageBuilder().setContent(`Config manager is not correctly configured.`))
        .then(() => false);
    }
    if (!option) {
      return context.reply(new MessageBuilder().setContent(`Unrecognised or invalid config key!`)).then(() => false);
    }
    if (!option.value) {
      return context.reply(new MessageBuilder().setContent(`No key provided to look up.`)).then(() => false);
    }

    const configValue = this._config.get(option.value);
    if (!configValue) {
      return context
        .reply(new MessageBuilder().setContent(`Config value not set for ${option.value}.`))
        .then(() => false);
    }

    return Promise.resolve(true);
  }

  constructor(config: Map<string, string>) {
    super(
      new CommandGroupBuilder("config", "A simple config command.").addSubcommands(
        new SubcommandOption("get", "Get a config value.").addStringOption(
          new SlashCommandStringOption("key", "The config key to reteieve.").setRequired(true)
        ),
        new SubcommandOption("set", "Set a config value.")
          .addStringOption(new SlashCommandStringOption("key", "The config key to set.").setRequired(true))
          .addStringOption(
            new SlashCommandStringOption("value", "The config value to set the key as.").setRequired(true)
          )
      ),
      {
        get: {
          handler: async (context: SlashCommandContext) => {
            const configOption = context.getStringOption("key");
            if (await this.validateOption(context, configOption)) {
              const configValue = config.get(configOption.value);
              return context.reply(
                new MessageBuilder().setContent(`Config value for ${configOption.value}: ${configValue}!`)
              );
            }
            return Promise.resolve();
          }
        },
        set: {
          handler: async (context: SlashCommandContext) => {
            if (await this.validateConfigConfigured(context)) {
              const configOption = context.getStringOption("key");
              if (!configOption) {
                return context.reply(new MessageBuilder().setContent(`No key provided to set.`));
              }
              const configValue = context.getStringOption("value");

              this._config.set(configOption.value, configValue.value);
              context.reply(
                new MessageBuilder().setContent(`Config key ${configOption.value} set to \"${configValue.value}\"`)
              );
            }
          }
        }
      }
    );
    this._config = config;
  }
}
