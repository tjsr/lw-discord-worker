import { CommandGroup, SlashCommandContext } from "@discord-interactions/core";
import { CommandGroupBuilder, SubcommandGroupOption } from "@discord-interactions/builders";

import { defaultHeroSubcommandOptions } from "../../commandOptions/heroes";

// const heroSubcommands =

const heroSetCommanGroup = new SubcommandGroupOption("set", "Set values for an obtained hero.").addSubcommands(
  ...defaultHeroSubcommandOptions
);

//     new CommandGroup(

//       builder) => builder)
//   new SubcommandOption("set", "Set values for an obtained hero.")
//     .
//     .addStringOption(heroStringSlashCommandOption)
//     .addStringOption(
//       new SlashCommandStringOption(PARAM_AMOUNT, "The amount of resources to be stored.").setRequired(true)
//     )
//     .addStringOption(rssSizeOption)
//   )),
// )

export class HeroCommand extends CommandGroup {
  private _db: D1Database;

  constructor(db: D1Database) {
    super(new CommandGroupBuilder("hero", "Store resources held.").addSubcommandGroups(heroSetCommanGroup), {
      set: {
        handler: async (context: SlashCommandContext) => {
          const hasHero = context.hasOption("forhero");
          if (!hasHero) {
            throw new Error("No hero provided.");
          }
        }
      }
    });
    this._db = db;
  }
}
