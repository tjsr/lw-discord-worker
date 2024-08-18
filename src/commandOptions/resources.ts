import { APIApplicationCommandOptionChoice } from "discord-api-types/v10";
import { commandOptionChoice } from "./commandOptionChoice.js";
import { defaultResources } from "../types/elements";

export const defaultResourceChoices: APIApplicationCommandOptionChoice<string>[] =
  commandOptionChoice(defaultResources);
