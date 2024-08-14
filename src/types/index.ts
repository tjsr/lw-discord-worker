export interface Env {
  CLIENT_ID: string;
  TOKEN: string;
  PUBLIC_KEY: string;
}

export type CommandStatus = {
  id: string;
  name: string;
  type: number;
  availableAtSetup: boolean;
  registered: boolean;
  availablePost?: boolean;
};

export type Handler = (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>;
