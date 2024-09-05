import { CommandGroupBuilder as DiscordInteractionsCommandGroupBuilder } from "@discord-interactions/builders/dist/commands/CommandGroupBuilder";
import { RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord-api-types/v10";
import { checkName } from "./utils.js";

export default class CommandGroupBuilder extends DiscordInteractionsCommandGroupBuilder {
  constructor(name: RESTPostAPIChatInputApplicationCommandsJSONBody | string, description?: string) {
    super(checkName(name), description);
  }
}
