import type { LinkSchema } from '#shared/schemas/link'
import type { H3Event } from 'h3'
import type { z } from 'zod'
import { parseURL, stringifyParsedURL } from 'ufo'

type Link = z.infer<typeof LinkSchema>

export function withoutQuery(url: string): string {
  const parsed = parseURL(url)
  return stringifyParsedURL({ ...parsed, search: '' })
}

export function normalizeSlug(event: H3Event, slug: string): string {
  const { caseSensitive } = useRuntimeConfig(event)
  return caseSensitive ? slug : slug.toLowerCase()
}

export function buildShortLink(event: H3Event, slug: string): string {
  return `${getRequestProtocol(event)}://${getRequestHost(event)}/${slug}`
}

export async function putLink(event: H3Event, link: Link): Promise<void> {
  const { cloudflare } = event.context
  const { KV, DB } = cloudflare.env
  const expiration = getExpiration(event, link.expiration)

  const linkToStore = { ...link }
  if (linkToStore.password) {
    linkToStore.password = await hashPassword(linkToStore.password)
  }

  // Dual-write to D1 if available
  if (DB) {
    try {
      await DB.prepare(
        `INSERT OR REPLACE INTO links (
          id, url, slug, comment, created_at, updated_at, expiration, starts_at,
          title, description, image, apple, google, cloaking, redirect_with_query,
          password, unsafe, tags, folder
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?
        )`,
      ).bind(
        linkToStore.id,
        linkToStore.url,
        linkToStore.slug,
        linkToStore.comment || null,
        linkToStore.createdAt,
        linkToStore.updatedAt,
        linkToStore.expiration || null,
        linkToStore.startsAt || null,
        linkToStore.title || null,
        linkToStore.description || null,
        linkToStore.image || null,
        linkToStore.apple || null,
        linkToStore.google || null,
        linkToStore.cloaking ? 1 : 0,
        linkToStore.redirectWithQuery ? 1 : 0,
        linkToStore.password || null,
        linkToStore.unsafe ? 1 : 0,
        linkToStore.tags ? JSON.stringify(linkToStore.tags) : null,
        linkToStore.folder || null,
      ).run()
    }
    catch (e) {
      console.error('Failed to sync link to D1:', e)
    }
  }

  await KV.put(`link:${linkToStore.slug}`, JSON.stringify(linkToStore), {
    expiration,
    metadata: {
      expiration,
      url: withoutQuery(linkToStore.url),
      comment: linkToStore.comment,
      tags: linkToStore.tags,
      folder: linkToStore.folder,
      startsAt: linkToStore.startsAt,
    },
  })
}

export async function getLink(event: H3Event, slug: string, cacheTtl?: number): Promise<Link | null> {
  const { cloudflare } = event.context
  const { KV } = cloudflare.env
  return await KV.get(`link:${slug}`, { type: 'json', cacheTtl }) as Link | null
}

export async function getLinkWithMetadata(event: H3Event, slug: string): Promise<{ link: Link | null, metadata: Record<string, unknown> | null }> {
  const { cloudflare } = event.context
  const { KV } = cloudflare.env
  const { metadata, value: link } = await KV.getWithMetadata(`link:${slug}`, { type: 'json' })
  return { link: link as Link | null, metadata: metadata as Record<string, unknown> | null }
}

export async function deleteLink(event: H3Event, slug: string): Promise<void> {
  const { cloudflare } = event.context
  const { KV, DB } = cloudflare.env

  if (DB) {
    try {
      await DB.prepare('DELETE FROM links WHERE slug = ?').bind(slug).run()
    }
    catch (e) {
      console.error('Failed to delete link from D1:', e)
    }
  }

  await KV.delete(`link:${slug}`)
}

export async function linkExists(event: H3Event, slug: string): Promise<boolean> {
  const link = await getLink(event, slug)
  return link !== null
}

interface ListLinksOptions {
  limit: number
  cursor?: string
  folder?: string
  tag?: string
}

interface ListLinksResult {
  links: (Link | null)[]
  list_complete: boolean
  cursor?: string
}

export function mapRowToLink(row: any): Link {
  return {
    id: row.id,
    url: row.url,
    slug: row.slug,
    comment: row.comment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiration: row.expiration,
    startsAt: row.starts_at,
    title: row.title,
    description: row.description,
    image: row.image,
    apple: row.apple,
    google: row.google,
    cloaking: Boolean(row.cloaking),
    redirectWithQuery: Boolean(row.redirect_with_query),
    password: row.password,
    unsafe: Boolean(row.unsafe),
    tags: row.tags ? JSON.parse(row.tags) : undefined,
    folder: row.folder,
  }
}

export async function listLinks(event: H3Event, options: ListLinksOptions): Promise<ListLinksResult> {
  const { cloudflare } = event.context
  const { KV, DB } = cloudflare.env

  if (DB) {
    try {
      const limit = options.limit
      const offset = options.cursor ? Number.parseInt(options.cursor) : 0

      let query = 'SELECT * FROM links'
      const params: any[] = []
      const whereClauses: string[] = []

      if (options.folder) {
        whereClauses.push('folder = ?')
        params.push(options.folder)
      }

      if (options.tag) {
        whereClauses.push('tags LIKE ?')
        params.push(`%"${options.tag}"%`)
      }

      if (whereClauses.length) {
        query += ` WHERE ${whereClauses.join(' AND ')}`
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
      params.push(limit, offset)

      const { results } = await DB.prepare(query).bind(...params).all()

      const links = results.map(mapRowToLink)

      return {
        links,
        list_complete: links.length < limit,
        cursor: (offset + limit).toString(),
      }
    }
    catch (e) {
      console.error('Failed to list links from D1, falling back to KV:', e)
    }
  }

  const list = await KV.list({
    prefix: 'link:',
    limit: options.limit,
    cursor: options.cursor || undefined,
  })

  let links = await Promise.all(
    (list.keys || []).map(async (key: { name: string }) => {
      const { metadata, value: link } = await KV.getWithMetadata(key.name, { type: 'json' }) as { metadata: Record<string, unknown> | null, value: Link | null }
      if (link) {
        return {
          ...(metadata ?? {}),
          ...link,
        } as Link
      }
      return link
    }),
  )

  // KV Manual filtering
  if (options.folder || options.tag) {
    links = links.filter((link) => {
      if (!link)
        return false
      if (options.folder && link.folder !== options.folder)
        return false
      if (options.tag && (!link.tags || !link.tags.includes(options.tag)))
        return false
      return true
    })
  }

  return {
    links,
    list_complete: list.list_complete,
    cursor: 'cursor' in list ? list.cursor : undefined,
  }
}
