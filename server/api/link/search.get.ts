import { QuerySchema } from '#shared/schemas/query'

defineRouteMeta({
  openAPI: {
    description: 'Search all links (returns slug, url, comment for each link)',
    security: [{ bearerAuth: [] }],
  },
})

defineRouteMeta({
  openAPI: {
    description: 'Search links by slug or url with pagination',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'query', in: 'query', schema: { type: 'string' }, description: 'Search term for slug or url' },
      { name: 'limit', in: 'query', schema: { type: 'integer' }, description: 'Maximum links to return' },
      { name: 'cursor', in: 'query', schema: { type: 'string' }, description: 'Pagination cursor' },
    ],
  },
})

interface Link {
  slug: string
  url: string
  comment?: string
}

interface LinkMetadata {
  url?: string
  comment?: string
  expiration?: number
}

export default eventHandler(async (event) => {
  const { cloudflare } = event.context
  const { KV } = cloudflare.env
  const { query: searchQuery, limit, cursor: initialCursor } = await getValidatedQuery(event, QuerySchema.parse)

  // Custom "query" param support if not explicitly using slug/url params
  const { query } = getQuery(event) as { query?: string }
  const finalSearchTerm = (searchQuery || query || '').toLowerCase()

  const list: Link[] = []
  let nextCursor = initialCursor
  const MAX_SCAN = 1000 // Limit safety to prevent infinite loops during scans

  try {
    let scanned = 0
    while (scanned < MAX_SCAN) {
      const result = await KV.list({
        prefix: `link:`,
        limit: 1000,
        cursor: nextCursor,
      }) as { keys: Array<{ name: string, metadata?: LinkMetadata }>, list_complete: boolean, cursor?: string }

      nextCursor = result.cursor
      scanned += result.keys.length

      if (Array.isArray(result.keys)) {
        for (const key of result.keys) {
          const slug = key.name.replace('link:', '')
          const url = key.metadata?.url || ''

          if (!finalSearchTerm || slug.toLowerCase().includes(finalSearchTerm) || url.toLowerCase().includes(finalSearchTerm)) {
            list.push({
              slug,
              url,
              comment: key.metadata?.comment,
            })
          }

          if (list.length >= limit) {
            return {
              links: list,
              cursor: nextCursor,
              list_complete: result.list_complete && list.length < limit,
            }
          }
        }
      }

      if (!result.keys || result.list_complete) {
        break
      }
    }

    return {
      links: list,
      cursor: nextCursor,
      list_complete: true,
    }
  }
  catch (err) {
    console.error('Error searching link list:', err)
    throw createError({
      status: 500,
      statusText: 'Failed to search link list',
    })
  }
})
