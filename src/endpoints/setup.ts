import { CommandStatus, Env } from "../types";
import { DiscordApplication, RegisteredCommand } from "@discord-interactions/core";

import Endpoint from ".";
import { commandList } from "../commands";
import { createOrUpdateCommandStats } from "../utils/commandStats";

export abstract class AbstractSetupEndpoint extends Endpoint {
  protected _db: D1Database;
  protected _app: DiscordApplication;
  protected _configValues: Map<string, string>;

  protected abstract handler(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response>;
  protected _commandStatuses: CommandStatus[] = [];

  public set commandStatuses(commandStatuses: CommandStatus[]) {
    this._commandStatuses = commandStatuses;
  }

  public async listCommandsAndFlag(commandStatus: Partial<CommandStatus>): Promise<void> {
    const commands = await this._app.rest.getApplicationCommands(this._app.clientId);
    const timingStatus = commandStatus.availablePost
      ? "Commands available post-registration: "
      : "Commands available at pre-setup: ";

    console.debug(`${timingStatus} ${commands.map((command) => command.name).join(", ")}`);
    createOrUpdateCommandStats(this._commandStatuses, commands, commandStatus);
    return Promise.resolve();
  }

  public async listRegisteredCommands(commands: RegisteredCommand[]): Promise<void> {
    console.log(
      `Commands registered this call: ${commands
        .map((command) => {
          const syncText = command.lastSyncedAt ? ` [${command.lastSyncedAt}` : "";
          return `${command.builder.name}${syncText}`;
        })
        .join(", ")}`
    );
    createOrUpdateCommandStats(this._commandStatuses, commands, { registered: true });
    return Promise.resolve();
  }

  public async listPostCommands(): Promise<void> {
    return this.listCommandsAndFlag({ availablePost: true });
  }

  public async listAvailableCommands(): Promise<void> {
    return this.listCommandsAndFlag({ availableAtSetup: true });
  }

  constructor(
    app: DiscordApplication,
    db: D1Database,
    configValues: Map<string, string>,
    path: string | RegExp = "/setup"
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    super(path, async (request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> => {
      return this.handler(request, env, _ctx);
    });
    this._app = app;
    this._configValues = configValues;
    this._db = db;
  }
}

export default class Setup extends AbstractSetupEndpoint {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async handler(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const setupResult = {
      result: "Setup complete",
      commandStatuses: this._commandStatuses,
      success: undefined
    };
    await this.listAvailableCommands();

    let registeredCommands: RegisteredCommand[];
    try {
      const commands = commandList(env.DB, this._configValues);
      registeredCommands = await this._app.commands.register(...commands);
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
  }
}
