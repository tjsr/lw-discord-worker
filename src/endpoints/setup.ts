import { CommandStatus } from "../types";
import Endpoint from ".";

export default class Setup extends Endpoint  {
  private _commandStatuses: CommandStatus[] = [];
  public set commandStatuses (commandStatuses: CommandStatus[]) {
    this._commandStatuses = commandStatuses;
  }

  constructor(path = '/setup') {
    super(path, (): Promise<Response> => {
      const setupResult = {
        result: "Setup complete",
        commandStatuses: this._commandStatuses
      };

      return Promise.resolve(new Response(JSON.stringify(setupResult), {
        headers: {
          "content-type": "application/json;charset=UTF-8"
        }
      }));
    });
  }
}
