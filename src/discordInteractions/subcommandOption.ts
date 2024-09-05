import { SubcommandOption as DiscordInteractionsSubcommandOption } from "@discord-interactions/builders";
import { checkName } from "./utils.js";

export default class SubcommandOption extends DiscordInteractionsSubcommandOption {
  constructor(name: string, description: string) {
    super(checkName(name), description);
  }
}
