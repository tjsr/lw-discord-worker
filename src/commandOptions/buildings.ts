import { APIApplicationCommandOptionChoice } from "discord-api-types/v10";
import { commandOptionChoice } from "./commandOptionChoice.js";
import { defaultBuildings } from "../types/elements";

export const defaultBuildingChoices: APIApplicationCommandOptionChoice<string>[] =
  commandOptionChoice(defaultBuildings);
