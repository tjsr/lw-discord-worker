import { SlashCommandStringOption } from "@discord-interactions/builders";
import { defaultBuildingChoices } from "./buildings.js";
import { defaultResourceChoices } from "./resources.js";

export const rssChoicesOption = new SlashCommandStringOption("type", "The resource type to display info on.")
  .setRequired(true)
  .addChoices(...defaultResourceChoices);

export const buildingTypeOption = new SlashCommandStringOption("type", "The building type to display info on.")
  .setRequired(true)
  .addChoices(...defaultBuildingChoices);
