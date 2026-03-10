import { z } from 'zod'

const DeleteMetadataSchema = z.object({
  type: z.enum(['folder', 'tag']),
  name: z.string().min(1),
})

export default eventHandler(async (event) => {
  const { cloudflare } = event.context
  const { DB } = cloudflare.env

  if (!DB) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Database not found',
    })
  }

  const body = await readValidatedBody(event, DeleteMetadataSchema.parse)
  const table = body.type === 'folder' ? 'folders_metadata' : 'tags_metadata'

  try {
    // 1. Remove from all links
    if (body.type === 'folder') {
      await DB.prepare('UPDATE links SET folder = NULL WHERE folder = ?').bind(body.name).run()
    }
    else {
      // For tags, we need to remove the specific tag from the JSON array
      // This is a bit tricky in SQLite, so we'll do a safe REPLACE
      const tagWithQuotes = `"${body.name}"`
      // Handle cases: ["tag"] -> [] or ["tag", "other"] -> ["other"] or ["other", "tag"] -> ["other"]
      await DB.prepare(`
        UPDATE links 
        SET tags = CASE 
          WHEN tags = ? THEN '[]'
          WHEN tags LIKE ? THEN REPLACE(tags, ?, '') 
          WHEN tags LIKE ? THEN REPLACE(tags, ?, '')
          ELSE tags 
        END
        WHERE tags LIKE ?
      `).bind(
        `[${tagWithQuotes}]`,
        `${tagWithQuotes},`,
        `${tagWithQuotes},`,
        `,${tagWithQuotes}`,
        `,${tagWithQuotes}`,
        `%${tagWithQuotes}%`,
      ).run()
    }

    // 2. Delete the metadata record (color customization)
    await DB.prepare(`DELETE FROM ${table} WHERE name = ?`).bind(body.name).run()

    return { success: true }
  }
  catch (e) {
    console.error('Failed to delete metadata:', e)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }
})
