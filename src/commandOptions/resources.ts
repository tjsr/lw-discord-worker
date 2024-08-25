import { PARAM_AMOUNT, PARAM_CRATE_SIZE } from "../commands/rss/index.js";
import { SlashCommandStringOption, SubcommandOption } from "@discord-interactions/builders";

import { APIApplicationCommandOptionChoice } from "discord-api-types/v10";
import { commandOptionChoice } from "./commandOptionChoice.js";
import { defaultResources } from "../types/elements";
import { resourceBoxSizes } from "../types/resources.js";

export const boxSizeCommandOptions = ["rss", ...resourceBoxSizes].map((size: string) => {
  return {
    name: size,
    value: size
  } as APIApplicationCommandOptionChoice<string>;
});

export const defaultResourceChoices: APIApplicationCommandOptionChoice<string>[] =
  commandOptionChoice(defaultResources);

export const rssSizeOption = new SlashCommandStringOption(
  PARAM_CRATE_SIZE,
  "The size of the resources crate being specified."
)
  .setChoices(...boxSizeCommandOptions)
  .setRequired(false);

export const rssAmountOption = new SubcommandOption(PARAM_AMOUNT, "The amount of resources to be stored.").setRequired(
  true
);
