import type { H3Event } from 'h3'
import { QuerySchema } from '#shared/schemas/query'
import { z } from 'zod'

const { select } = SqlBricks

const unitMap: { [x: string]: string } = {
  minute: '%Y-%m-%d %H:%M',
  hour: '%Y-%m-%d %H',
  day: '%Y-%m-%d',
}

const ViewsQuerySchema = QuerySchema.extend({
  unit: z.enum(['minute', 'hour', 'day']),
  clientTimezone: z.string()
    .regex(/^[A-Z_]+(?:\/[A-Z_-]+)*$/i)
    .max(64)
    .default('Etc/UTC'),
})

function query2sql(query: z.infer<typeof ViewsQuerySchema>, event: H3Event): string {
  const filter = query2filter(query)
  const { dataset } = useRuntimeConfig(event)
  const timezone = getSafeTimezone(query.clientTimezone)
  const sql = select(`formatDateTime(${toTZ('timestamp', timezone)}, '${unitMap[query.unit]}') as time, SUM(_sample_interval) as visits, ${weightedDistinct(logsMap.ip!)} as visitors`).from(`"${dataset}"`).where(filter).groupBy('time').orderBy('time')
  appendTimeFilter(sql, query)
  return sql.toString()
}

export default eventHandler(async (event) => {
  const query = await getValidatedQuery(event, ViewsQuerySchema.parse)
  const sql = query2sql(query, event)
  const result = await useWAE(event, sql)
  return {
    data: result?.data || [],
  }
})
