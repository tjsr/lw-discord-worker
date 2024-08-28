import { SlashCommandStringOption } from "@discord-interactions/builders";
import { defaultBuildingChoices } from "./buildings.js";
import { defaultResourceChoices } from "./resources.js";

export const PARAM_BUILDING_TYPE = "buildingtype";
export const PARAM_RESOURCE_TYPE = "resourcetype";

export const interactionsRssChoicesOption = new SlashCommandStringOption(
  PARAM_RESOURCE_TYPE,
  "The resource type to display info on."
)
  .setRequired(true)
  .addChoices(...defaultResourceChoices);

export const interactionsBuildingTypeOption = new SlashCommandStringOption(
  PARAM_BUILDING_TYPE,
  "The building type to display info on."
)
  .setRequired(true)
  .addChoices(...defaultBuildingChoices);
