import { CommandGroupBuilder, SlashCommandStringOption, SubcommandOption } from "@discord-interactions/builders";
import { Hero, defaultHeroList } from "../types/heroes";

import { APIApplicationCommandOptionChoice } from "discord-api-types/v10";

export const PARAM_HERO = "hero";

const getHeroCommandOptions = (heroList: Hero[]): APIApplicationCommandOptionChoice<string>[] => {
  const heroCommands = heroList.map((hero: Hero) => {
    return {
      name: hero.name,
      value: hero.name.toLowerCase()
    } as APIApplicationCommandOptionChoice<string>;
  });
  const commandChoices: APIApplicationCommandOptionChoice<string>[] = [
    {
      name: "any",
      value: "any"
    },
    ...heroCommands
  ];
  return commandChoices;
};

// const getHeroSubcommandGroups = (heroList: Hero[]) => {
//   const heroSubcommands = heroList.map((hero: Hero) => {
//     return new SubcommandGroupOption(hero.name.toLowerCase(), hero.name);
//   });

//   const commandChoices: SubcommandGroupOption[] = [new SubcommandGroupOption("any", "Any hero"), ...heroSubcommands];
//   return commandChoices;
// };

const getHeroSubcommands = (heroList: Hero[]): SubcommandOption[] => {
  const heroSubcommands = heroList.map((hero: Hero) => {
    return new SubcommandOption(hero.name.toLowerCase(), hero.name);
  });

  const subcommandChoices: SubcommandOption[] = [new SubcommandOption("any", "Any hero"), ...heroSubcommands];
  return subcommandChoices;
};

export const defaultHeroSubcommandOptions: SubcommandOption[] = getHeroSubcommands(
  defaultHeroList.filter((hero) => hero.rarity === "UR")
);
export const defaultHeroCommandOptions: APIApplicationCommandOptionChoice<string>[] = getHeroCommandOptions(
  defaultHeroList.filter((hero) => hero.rarity === "UR")
);

export const heroStringSlashCommandOption = new SlashCommandStringOption(PARAM_HERO, "Hero for stats info.")
  .setChoices(...defaultHeroCommandOptions)
  .setRequired(true);

export const heroSubcommands = new CommandGroupBuilder("forhero", "Hero for stats info.");
// .
// .addSubcommands;
//   .addSubcommands
// .
//   .add(
//     getHeroSubcommands(defaultHeroList)
//   ));
