import { APIApplicationCommandOptionChoice } from "discord-api-types/v10";
import { TypeLookup } from "../types";

export const commandOptionChoice = (types: TypeLookup[]): APIApplicationCommandOptionChoice<string>[] =>
  types.map((elementType) => {
    return {
      name: elementType.name,
      value: elementType.value
    } as APIApplicationCommandOptionChoice<string>;
  });
