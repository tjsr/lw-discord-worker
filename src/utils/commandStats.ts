import { CommandStatus } from "../types";
import { RESTGetAPIApplicationCommandsResult } from "discord-api-types/v10";
import {
  RegisteredCommand,
} from "@discord-interactions/core";

export const createOrUpdateCommandStats = async <T extends RESTGetAPIApplicationCommandsResult>(
  statuses: CommandStatus[],
  commands: T | RegisteredCommand[],
  updateIfFound: Partial<CommandStatus>
) => {
  commands.forEach((command) => {
    const name = command.builder ? command.builder.name : command.name;
    const commandType = command.builder ? command.builder.type : command.type;

    const foundStatus: CommandStatus | undefined = statuses.find(
      (status) => status.id === command.id || status.name == name
    );
    let status: CommandStatus;
    if (!foundStatus) {
      // console.log(`Command ${command.name} (${command.id}) not found, creating status`);
      status = {
        id: command.id,
        name: name,
        type: commandType,
        availableAtSetup: false,
        registered: false,
        availablePost: false
      };
      statuses.push(status);
    } else {
      // console.log(`Command ${name} (${command.id})`);
      if (foundStatus.id == "0" && command.id != "0") {
        // console.log(`Updating status from ${foundStatus.id}`);
        foundStatus.id = command.id;
      }
      status = foundStatus;
    }
    Object.keys(updateIfFound).forEach((key) => {
      status[key] = updateIfFound[key];
    });
  });
};

export const printCommandStatuses = (log: (message: string) => void, statuses: CommandStatus[]) => {
  statuses.forEach((status) => {
    log(
      `Command ${status.name} (${status.id}) - Type: ${status.type} - ` +
      `Available at setup: ${status.availableAtSetup} - Registered: ${status.registered} - Available post: ${status.availablePost}`
    );
  });
};
