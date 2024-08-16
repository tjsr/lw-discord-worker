export interface Env {
  CLIENT_ID: string;
  TOKEN: string;
  PUBLIC_KEY: string;
  DB: D1Database;
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

export type Handler = (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>;
