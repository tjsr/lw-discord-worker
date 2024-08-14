import Endpoint from ".";

export default class FileEndpoint extends Endpoint {
  constructor() {
    super(/\/[^\/]+\.[^\/]+$/, async (): Promise<Response> => {
      return Promise.resolve(new Response(undefined, { status: 404 }));
    });
  }
}
