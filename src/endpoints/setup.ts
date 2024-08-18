import { CommandStatus, Env } from "../types";
import { DiscordApplication, RegisteredCommand } from "@discord-interactions/core";

import Endpoint from ".";
import { commandList } from "../commands";
import { createOrUpdateCommandStats } from "../utils/commandStats";

export default class Setup extends Endpoint {
  private _app: DiscordApplication;
  private _commandStatuses: CommandStatus[] = [];
  public set commandStatuses(commandStatuses: CommandStatus[]) {
    this._commandStatuses = commandStatuses;
  }

  public async listPostCommands(): Promise<void> {
    return this.listCommandsAndFlag({ availablePost: true });
  }

  public async listAvailableCommands(): Promise<void> {
    return this.listCommandsAndFlag({ availableAtSetup: true });
  }

  public async listCommandsAndFlag(commandStatus: Partial<CommandStatus>): Promise<void> {
    const commands = await this._app.rest.getApplicationCommands(this._app.clientId);
    console.log(`Available commands: ${commands.map((command) => command.name).join(", ")}`);
    createOrUpdateCommandStats(this._commandStatuses, commands, commandStatus);
    return Promise.resolve();
  }

  public async listRegisteredCommands(commands: RegisteredCommand[]): Promise<void> {
    console.log(`Registered commands: ${commands.map((command) => command.builder.name).join(", ")}`);
    createOrUpdateCommandStats(this._commandStatuses, commands, { registered: true });
    return Promise.resolve();
  }

  constructor(app: DiscordApplication, configValues: Map<string, string>, path = "/setup") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    super(path, async (request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> => {
      const setupResult = {
        result: "Setup complete",
        commandStatuses: this._commandStatuses,
        success: undefined
      };
      await this.listAvailableCommands();

      let registeredCommands: RegisteredCommand[];
      try {
        const commands = commandList(env.DB, configValues);
        registeredCommands = await app.commands.register(...commands);
      } catch (error) {
        setupResult.result = "Error registering commands: " + error;
        console.error("Error registering commands: ", error);
        return new Response(JSON.stringify({ ...setupResult, success: false }), {
          headers: {
            "content-type": "application/json;charset=UTF-8"
          }
        });
      }

      await this.listRegisteredCommands(registeredCommands);
      await this.listPostCommands();

      console.log("Inserting initial value in to database...");

      const preparedStatement = env.DB.prepare(
        "INSERT INTO kvstore (key, value) VALUES (?, ?) \
        ON CONFLICT(key) DO UPDATE SET value=excluded.value;"
      );
      return preparedStatement
        .bind("setup", JSON.stringify(setupResult))
        .run()
        .then((result) => {
          (setupResult as any).success = result.success;
          if (result.success) {
            console.log("Setup result saved to DB");
          } else {
            console.error("Failed to save setup result to DB");
          }
          return new Response(JSON.stringify(setupResult), {
            headers: {
              "content-type": "application/json;charset=UTF-8"
            }
          });
        });

      // return Promise.resolve(new Response(JSON.stringify(setupResult), {
      //   headers: {
      //     "content-type": "application/json;charset=UTF-8"
      //   }
      // }));
    });
    this._app = app;
  }
}
