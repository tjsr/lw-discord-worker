import { KeyVal, getKeyval, setKeyval } from "./db/keyval";

import { Env } from "./types";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    console.log(`Got fetch handler request to ${request.url}`);
    

    const kvData: KeyVal|null = await getKeyval('setup', env.DB);

    // const kvData: KeyVal = await getKeyval('setup', env.DB);
    // const preparedStatement = env.DB.prepare("SELECT key, value, ttl, updated_by, last_updated FROM kvstore WHERE key = ?;");
    // return preparedStatement.bind("setup").first<KeyVal>().then((kvData) => {
    const headers = {
        "content-type": "application/json;charset=UTF-8"
    };
    const responseInit = {
      headers: headers
    };
    
    const response = kvData ? {
      ...kvData,
      value: JSON.parse(kvData.value),
    } : { message: "No results found" };

    const kvTest: KeyVal|null = await getKeyval('test-value', env.DB);
    const updateData = await setKeyval('test-value', { test: 'value' } as unknown as JSON, 'system', env.DB);
    console.log(JSON.stringify(updateData));
    response['original'] = kvTest;
    response['update'] = updateData;

    return new Response(
      JSON.stringify(response),
      responseInit
    );
    // });
  }
}
