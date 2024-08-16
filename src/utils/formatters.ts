
export const rssValue = (rss: number | string): string => {
  if (typeof rss === 'string') {
    return rss;
  }
  if (rss < 10000) {
    return rss.toString();
  }
  if (rss < 1000000) {
    return `${(rss / 1000).toFixed(1)}K`;
  }
  if (rss < 1000000000) {
    return `${(rss / 1000000).toFixed(1)}M`;
  }
  return `${(rss / 1000000000).toFixed(1)}G`;
};
