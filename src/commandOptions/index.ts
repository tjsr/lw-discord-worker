import { SlashCommandStringOption } from "@discord-interactions/builders";
import { defaultBuildingChoices } from "./buildings.js";
import { defaultResourceChoices } from "./resources.js";

const PARAM_TYPE = "type";
export const PARAM_BUILDING_TYPE = PARAM_TYPE;
export const PARAM_RESOURCE_TYPE = PARAM_TYPE;

export const rssChoicesOption = new SlashCommandStringOption(
  PARAM_RESOURCE_TYPE,
  "The resource type to display info on."
)
  .setRequired(true)
  .addChoices(...defaultResourceChoices);

export const buildingTypeOption = new SlashCommandStringOption(
  PARAM_BUILDING_TYPE,
  "The building type to display info on."
)
  .setRequired(true)
  .addChoices(...defaultBuildingChoices);
