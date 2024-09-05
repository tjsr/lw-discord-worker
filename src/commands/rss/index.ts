import { CommandGroup, SlashCommandContext } from "@discord-interactions/core";
import { CommandGroupBuilder, SubcommandOption } from "../../discordInteractions";
import { PARAM_RESOURCE_TYPE, interactionsRssChoicesOption } from "../../commandOptions";
import { boxSizeCommandOptions, rssAmountOption, rssSizeOption } from "../../commandOptions/resources";

import { APIApplicationCommandOptionChoice } from "discord-api-types/v10";
import { ResourceValue } from "../../types/resources";
import { RssCrateType } from "../../types";
import { saveUserRss } from "../../db/rss";

export const PARAM_CRATE_SIZE = "cratesize";
export const PARAM_AMOUNT = "amount";

interface RssCrateInputs {
  rssType: string;
  rssAmount: string;
  rssCrate: string;
}

const isEmpty = (str: string): boolean => {
  return !str || str.trim().length === 0;
};

const isValidOption = (optionValue: string, options: APIApplicationCommandOptionChoice<string>[]): boolean => {
  return !isEmpty(optionValue) && !options.map((option) => option.value).includes(optionValue);
};

const isValidCrateSize = (crateSize: string, options: APIApplicationCommandOptionChoice<string>[]): boolean =>
  isValidOption(crateSize, options);

const rssSetSubcommand = new SubcommandOption("set", "Set the number of an RSS type currently possessed.")
  .addStringOption(interactionsRssChoicesOption)
  .addStringOption(rssAmountOption)
  .addStringOption(rssSizeOption);

const hasSubcommandOption = (option: SubcommandOption, name: string, recursive = false): boolean => {
  return (
    option.name === name ||
    option.options.some((opt: any) => {
      if (recursive && opt.options !== undefined) {
        return hasSubcommandOption(opt.options, name, recursive);
      } else {
        return opt.name === name;
      }
    })
  );
};

const rssCommandBuilder = new CommandGroupBuilder("rss", "Store resources held.").addSubcommands(rssSetSubcommand);

export class RSSCommand extends CommandGroup {
  private _db: D1Database;

  private parseRssContextValues(context: SlashCommandContext): RssCrateInputs {
    const rssType = context.getStringOption(PARAM_RESOURCE_TYPE);
    if (!rssType && hasSubcommandOption(rssSetSubcommand, PARAM_RESOURCE_TYPE)) {
      throw new Error("Invalid RSS type provided.");
    }
    const rssAmount = context.getStringOption(PARAM_AMOUNT);
    if (!rssAmount) {
      throw new Error("Invalid RSS amount provided.");
    }
    let crateSize = "rss";
    if (context.hasOption(PARAM_CRATE_SIZE)) {
      const rssCrate = context.getStringOption(PARAM_CRATE_SIZE);
      if (!isValidCrateSize(rssCrate?.value, boxSizeCommandOptions)) {
        throw new Error("Invalid RSS crate size provided.");
      }
      crateSize = rssCrate?.value ?? "rss";
    }
    return {
      rssType: rssType?.value,
      rssAmount: rssAmount.value,
      rssCrate: crateSize
    };
  }

  constructor(db: D1Database) {
    super(rssCommandBuilder, {
      set: {
        handler: async (context) => {
          let rssInputs: RssCrateInputs;
          try {
            rssInputs = this.parseRssContextValues(context);
          } catch (err) {
            console.warn("Failed to parse RSS inputs.", err);
            return context.reply("Failed to parse RSS inputs.");
          }

          // Todo - check data.
          const rssCrateType: RssCrateType = (rssInputs.rssCrate ?? "rss") as RssCrateType;
          let parsedRssAmount: ResourceValue;
          try {
            parsedRssAmount = new ResourceValue(rssInputs.rssAmount);
          } catch (err) {
            console.error(`Failed to parse RSS amount ${rssInputs.rssAmount}.`, err);
            return context.reply(`Unable to parse RSS amount ${rssInputs.rssAmount}.`);
          }

          return saveUserRss(this._db, context.user.id, rssInputs.rssType, parsedRssAmount.intValue, rssCrateType)
            .then((userRss) => {
              const updateMessage = `Updated ${rssInputs.rssType} for user <@${context.user?.id}> to ${rssInputs.rssAmount}${rssInputs.rssCrate ?? ""}.`;
              console.log(updateMessage, userRss);
              return context.reply(updateMessage);
            })
            .catch((err) => {
              const errMessage = `Failed to update ${rssInputs.rssType} to ${rssInputs.rssAmount}${rssInputs.rssCrate ?? ""}.`;
              console.error(errMessage, err);
              return context.reply(errMessage);
            });
        }
      }
    });
    this._db = db;
  }
}
