import { Building, LWConfig, Ping } from "../commands";
import { CommandStatus, Env } from "../types";
import { DiscordApplication, RegisteredCommand } from "@discord-interactions/core";

import Endpoint from ".";
import { createOrUpdateCommandStats } from "../utils/commandStats";

const configValues: Map<string, string> = new Map();
configValues.set("testValue", "some value here");

export default class CommandsEndpoint extends Endpoint {
  private _commandStatuses: CommandStatus[] = [];
  private _app: DiscordApplication;

  public get commandStatuses(): CommandStatus[] {
    return this._commandStatuses;
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

  constructor(app: DiscordApplication) {
    super(/^\/commands$/, async (_request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> => {
      await this.listAvailableCommands();

      const registeredCommands: RegisteredCommand[] = await app.commands.register(
        new Building(),
        new Ping(),
        new LWConfig(configValues)
      );
  
        await this.listRegisteredCommands(registeredCommands);
        await this.listPostCommands();

      
      return new Response(JSON.stringify(this._commandStatuses), {
        headers: {
          "content-type": "application/json;charset=UTF-8"
        }
      });
    });
    this._app = app;
  }
}
