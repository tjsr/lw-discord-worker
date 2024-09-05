import { BuildingCommand, LWConfigCommand, PingCommand } from "../commands";
import { Command, ISlashCommand } from "@discord-interactions/core";

import { HeroCommand } from "./hero";
import { RSSCommand } from "./rss";
import { VsCommand } from "./vs";
import { defaultBuildings } from "../types/elements";
import { interactionsBuildingTypeOption } from "../commandOptions";

export { BuildingCommand } from "./building";
export { PingCommand } from "./Ping.js";
export { LWConfigCommand } from "./lwconfig";

const sanityCheckCommands = (commands: (Command | ISlashCommand)[]) => {
  const commandNames = commands.map((command) => command.builder.name);
  const uniqueCommandNames = new Set(commandNames);
  if (commandNames.length !== uniqueCommandNames.size) {
    throw new Error("Duplicate command names detected. Command names must be unique.");
  }
};

const diCommandList = (db: D1Database, configValues: Map<string, string>): (Command | ISlashCommand)[] => {
  const commandList: (Command | ISlashCommand)[] = [
    new BuildingCommand(db, defaultBuildings, interactionsBuildingTypeOption),
    new PingCommand(),
    new LWConfigCommand(configValues),
    new VsCommand(db),
    new RSSCommand(db),
    new HeroCommand(db)
  ];
  sanityCheckCommands(commandList);
  return commandList;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars

export const commandList = diCommandList;

