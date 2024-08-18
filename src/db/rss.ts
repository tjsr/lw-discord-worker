import { KeyVal, getKeyval, setKeyval } from "./keyval";
import { RssCollectionData, RssCrateType, UserRss } from "../types";

export const saveUserRss = async (
  db: D1Database,
  userId: string,
  rssType: string,
  rssAmount: number,
  rssCrate?: RssCrateType
): Promise<UserRss> => {
  const userRssKey = `rss.${userId}.rss`;
  const keyval: KeyVal | null = await getKeyval(userRssKey, db);
  const userRss: UserRss = keyval ? JSON.parse(keyval.value) : {};
  if (!userRss[rssType]) {
    userRss[rssType] = {} as RssCollectionData;
  }
  if (rssCrate) {
    userRss[rssType][rssCrate] = rssAmount;
  } else {
    userRss[rssType]["rss"] = rssAmount;
  }

  return setKeyval(userRssKey, userRss, userId, db)
    .then(() => userRss)
    .catch((err) => {
      console.error("Failed to save user rss", err);
      throw err;
    });
};
