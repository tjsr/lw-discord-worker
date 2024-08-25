import { DiscordApplication } from "@discord-interactions/core";
import Router from "../utils/router";

export interface Env {
  CLIENT_ID: string;
  TOKEN: string;
  PUBLIC_KEY: string;
  DB: D1Database;
}

export interface DiscordExecutionContext extends ExecutionContext {
  discordApp: DiscordApplication;
  router: Router;
}

export type BuildingInfoMessageData = {
  currentBuilding: any;
  previousBuilding: any;
  currentLevel: number;
  previousLevel: number;
};

export type CommandStatus = {
  id: string;
  name: string;
  type: number;
  availableAtSetup: boolean;
  registered: boolean;
  availablePost?: boolean;
};

export type Handler = (request: Request, env: Env, ctx: DiscordExecutionContext) => Promise<Response>;
export interface TypeLookup {
  name: string;
  value: string;
}

export type RssCrateType = "R" | "SR" | "SSR" | "UR" | "rss";

export type RssCollectionData = {
  [key in RssCrateType]: number;
};

export interface UserRss {
  [key: string]: RssCollectionData;
}
