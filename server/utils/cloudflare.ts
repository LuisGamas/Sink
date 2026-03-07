import type { H3Event } from 'h3'

export function useWAE(event: H3Event, query: string) {
  const { cfAccountId, cfApiToken } = useRuntimeConfig(event)
  console.info('useWAE', query)

  if (!cfAccountId || cfAccountId === '123456') {
    console.warn('Invalid Cloudflare Account ID. Skipping analytics query.')
    return Promise.resolve({ data: [], meta: [] })
  }

  return $fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/analytics_engine/sql`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfApiToken}`,
    },
    body: query,
    retry: 1,
    retryDelay: 100, // ms
  }).catch((err) => {
    console.error('Cloudflare WAE Error:', err.data || err.message)
    return { data: [], meta: [] }
  })
}

/**
 * Weighted distinct count for sampled data
 * @param col - The column to count distinct values
 * @returns SQL expression for weighted distinct count
 */
export const weightedDistinct = (col: string) => `IF(COUNT() > 0, ROUND(COUNT(DISTINCT ${col}) * SUM(_sample_interval) / COUNT()), 0)`

/**
 * Convert timestamp to a specific timezone
 * @param col - The timestamp column
 * @param tz - The timezone string
 * @returns SQL expression for converting timestamp to timezone
 */
export const toTZ = (col: string, tz: string) => `toDateTime(toUnixTimestamp(${col}), '${tz}')`
