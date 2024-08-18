import { CommandGroup } from "@discord-interactions/core";
import { CommandGroupBuilder } from "@discord-interactions/builders";

export class VsCommand extends CommandGroup {
  private _db: D1Database;
  constructor(db: D1Database) {
    super(new CommandGroupBuilder("vs", "VS data calculatiions."), {});
    this._db = db;
  }
}
