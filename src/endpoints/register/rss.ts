import { CommandGroup, DiscordApplication } from "@discord-interactions/core";

import AbstractRegister from "./abstractRegister";
import { RSSCommand } from "../../commands/rss";

export default class RegisterRss extends AbstractRegister {
  constructor(app: DiscordApplication, db: D1Database, configValues: Map<string, string>, path = /^\/register\/rss$/) {
    super(app, db, configValues, path);
  }

  protected getCommand(): CommandGroup {
    return new RSSCommand(this._db);
  }
}
