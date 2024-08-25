import { DiscordExecutionContext, Env, Handler } from "../types";

export default class Endpoint {
  private _handler: Handler;
  private _path: string | RegExp;
  private _name: string;
  private _requiresSync: boolean;

  constructor(path: string | RegExp, handler: Handler) {
    this._path = path;
    this._handler = handler;
    this._name = this.constructor.name;
    this._requiresSync = false;
  }

  protected setRequiresSync(value = true) {
    this._requiresSync = value;
  }

  public async handle(request: Request, env: Env, ctx: DiscordExecutionContext): Promise<Response> {
    return this._handler(request, env, ctx);
  }

  public static getPath(request: Request) {
    return new URL(request.url).pathname;
  }

  public isRoute(request: Request): boolean {
    const pathname = Endpoint.getPath(request);
    const matchesPath = this._path instanceof RegExp ? this._path.test(pathname) : pathname === this._path;
    return matchesPath;
  }

  public getClassName(): string {
    return this._name;
  }

  public get requiresSync(): boolean {
    return this._requiresSync;
  }
}
