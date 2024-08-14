/* eslint-disable @typescript-eslint/no-explicit-any */
import { GenericCache } from "@discord-interactions/core";

export const getCache = (type: 'map' | 'redis' | 'kv', cache: any): GenericCache => {
  switch (type) {
    case 'map':
      return getMapCache(cache);
    case 'redis':
      return redisCache(cache);
    case 'kv':
      return kvCache(cache);
    default:
      throw new Error(`Invalid cache type: ${type}`);
  }
};

const getMapCache = (mapCache: Map<string, string>): GenericCache => {
  return {
    get: (key: string) => {
      return Promise.resolve(mapCache.get(key) ?? null);
    },
    set: (key: string, ttl: number, value: string) => {
      mapCache.set(key, value);
      return Promise.resolve(value);
    }
  };
}

const redisCache = (redisClient: any): GenericCache => {
  return {
    get: (key: string) => {
      return redisClient.get(key);
    },
    set: (key: string, ttl: number, value: string) => {
      return redisClient.setEx(key, ttl, value);
    }
  };
}

const kvCache = (kv: any): GenericCache => {
  return {
    get: (key: string) => {
      return kv.get(key);
    },
    set: (key: string, ttl: number, value: string) => {
      return kv.put(key, value, { expirationTtl: ttl });
    }
  };
};
