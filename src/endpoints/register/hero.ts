import { CommandGroup, DiscordApplication } from "@discord-interactions/core";

import AbstractRegister from "./abstractRegister";
import { HeroCommand } from "../../commands/hero";

export default class RegisterHero extends AbstractRegister {
  constructor(app: DiscordApplication, db: D1Database, configValues: Map<string, string>, path = /^\/register\/hero$/) {
    super(app, db, configValues, path);
  }

  protected getCommand(): CommandGroup {
    return new HeroCommand(this._db);
  }
}
