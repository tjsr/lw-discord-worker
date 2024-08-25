import {
  APIApplicationCommandInteractionDataBasicOption,
  APIApplicationCommandInteractionDataSubcommandOption
} from "discord-api-types/v10";
import {
  CommandGroup,
  DiscordApplication,
  RegisteredCommand,
  SlashCommand,
  SyncMode
} from "@discord-interactions/core";

import { AbstractSetupEndpoint } from "../setup.js";
import { Env } from "../../types/index.js";

export default abstract class AbstractRegister extends AbstractSetupEndpoint {
  constructor(app: DiscordApplication, db: D1Database, configValues: Map<string, string>, path = /^\/register$/) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    super(app, db, configValues, path);
  }

  protected abstract getCommand(): CommandGroup | SlashCommand;

  private checkCommand(command: CommandGroup | SlashCommand): void {
    if (!command) {
      throw new Error("Command is not defined");
    }
    if (!command.builder.name) {
      throw new Error("Command must have a name");
    }
    command.builder.options.forEach((option) => {
      if (!option.name) {
        throw new Error(`Command options in ${command.builder.name} must have a name.`);
      }
      option.options?.forEach((subOption) => {
        if (!subOption.name) {
          const errMessage = `Subcommand for option ${option.name} in ${command.builder.name} must have a name.`;
          console.error(errMessage, JSON.stringify(subOption));
          throw new Error(errMessage);
        }
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async handler(_request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
    const registrationResult = {
      result: "Local registration complete",
      commandStatuses: this._commandStatuses,
      success: undefined
    };
    await this.listAvailableCommands();
    let registeredCommands: RegisteredCommand[];
    const command = this.getCommand();

    this.checkCommand(command);

    try {
      registeredCommands = await this._app.commands.register(command).then((regCmdList) => {
        console.log(`Registered commands: ${regCmdList.map((cmd) => cmd.builder.name).join(",")}`);
        return regCmdList;
      });
    } catch (error) {
      const logErrMessage = `Error registering command ${command.builder.name}`;
      registrationResult.result = logErrMessage;
      console.error(logErrMessage, error);
      return new Response(JSON.stringify({ ...registrationResult, success: false }), {
        headers: {
          "content-type": "application/json;charset=UTF-8"
        }
      });
    }

    if (this._app.commands.syncMode === SyncMode.Enabled) {
      registrationResult.result = "Commands registered and synced to Discord";
    } else if (this._app.commands.syncMode === SyncMode.Strict) {
      registrationResult.result = "Commands registered and synced to Discord (Strict mode)";
    }

    await this.listRegisteredCommands(registeredCommands);
    await this.listPostCommands();

    return new Response(JSON.stringify(registrationResult), {
      headers: {
        "content-type": "application/json;charset=UTF-8"
      }
    });
  }
}
