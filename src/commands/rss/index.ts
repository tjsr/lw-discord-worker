import {
  CommandGroupBuilder,
  SlashCommandIntegerOption,
  SlashCommandStringOption,
  SubcommandOption
} from "@discord-interactions/builders";

import { APIApplicationCommandOptionChoice } from "discord-api-types/v10";
import { CommandGroup } from "@discord-interactions/core";
import { RssCrateType } from "../../types";
import { rssChoicesOption } from "../../commandOptions";
import { saveUserRss } from "../../db/rss";

const boxSizeOptionValues = ["rss", "R", "SR", "SSR", "UR"];
const boxSizeOptions = boxSizeOptionValues.map((size: string) => {
  return {
    name: size,
    value: size
  } as APIApplicationCommandOptionChoice<string>;
});

const rssSizeOption = new SlashCommandStringOption("crate", "The amount of resources to be stored.")
  .setChoices(...boxSizeOptions)
  .setRequired(true);

export class RSSCommand extends CommandGroup {
  private _db: D1Database;

  constructor(db: D1Database) {
    super(
      new CommandGroupBuilder("rss", "Store resources held.").addSubcommands(
        new SubcommandOption("set", "Set the number of an RSS type currently possessed.")
          .addStringOption(rssChoicesOption)
          .addIntegerOption(
            new SlashCommandIntegerOption("amount", "The amount of resources to be stored.").setRequired(true)
          )
          .addStringOption(rssSizeOption)
      ),
      {
        set: {
          handler: async (context) => {
            const rssType = context.getStringOption("type");
            if (!rssType) {
              return context.reply("Invalid RSS type provided.");
            }
            const rssAmount = context.getIntegerOption("amount");
            if (!rssAmount) {
              return context.reply("Invalid RSS amount provided.");
            }
            const rssCrate = context.getStringOption("crate");
            if (rssCrate && rssCrate?.value && !boxSizeOptionValues.includes(rssCrate.value)) {
              return context.reply("Invalid RSS crate size provided.");
            }

            // Todo - check data.
            const rssCrateType: RssCrateType = (rssCrate?.value ?? "rss") as RssCrateType;

            return saveUserRss(this._db, context.user.id, rssType.value, rssAmount.value, rssCrateType)
              .then((userRss) => {
                console.log(`Updated ${rssType.value} to ${rssAmount.value}${rssCrate?.value ?? ""}.`, userRss);
                return context.reply(
                  `Updated ${rssType.value} for user <@${context.user?.id}> to ${rssAmount.value}${rssCrate?.value ?? ""}.`
                );
              })
              .catch((err) => {
                console.error(`Failed to update ${rssType.value} to ${rssAmount.value}${rssCrate?.value ?? ""}.`, err);
                return context.reply(
                  `Failed to update ${rssType.value} to ${rssAmount.value}${rssCrate?.value ?? ""}.`
                );
              });
          }
        }
      }
    );
    this._db = db;
  }
}
