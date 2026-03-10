import { z } from 'zod'

const UpdateMetadataSchema = z.object({
  type: z.enum(['folder', 'tag']),
  name: z.string().min(1),
  oldName: z.string().optional(), // If provided, we are renaming
  color: z.string().min(1),
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

  const body = await readValidatedBody(event, UpdateMetadataSchema.parse)
  const table = body.type === 'folder' ? 'folders_metadata' : 'tags_metadata'
  const now = Math.floor(Date.now() / 1000)

  try {
    // If it's a rename, we need to do several things in a transaction-like way
    if (body.oldName && body.oldName !== body.name) {
      // 1. Check if the new name already exists in metadata
      const existing = await DB.prepare(`SELECT name FROM ${table} WHERE name = ?`).bind(body.name).first()
      if (existing) {
        throw createError({
          statusCode: 400,
          statusMessage: `${body.type === 'folder' ? 'Folder' : 'Tag'} name already exists`,
        })
      }

      // 2. Update the links table first
      if (body.type === 'folder') {
        await DB.prepare('UPDATE links SET folder = ? WHERE folder = ?').bind(body.name, body.oldName).run()
      }
      else {
        // Tags are stored as JSON strings like ["tag1", "tag2"]
        // We use REPLACE to update the tag within the JSON string safely by including quotes
        const oldTag = `"${body.oldName}"`
        const newTag = `"${body.name}"`
        await DB.prepare(`
          UPDATE links 
          SET tags = REPLACE(tags, ?, ?) 
          WHERE tags LIKE ?
        `).bind(oldTag, newTag, `%${oldTag}%`).run()
      }

      // 3. Delete the old metadata record
      await DB.prepare(`DELETE FROM ${table} WHERE name = ?`).bind(body.oldName).run()
    }

    // 4. Upsert the new metadata/color
    await DB.prepare(`
      INSERT INTO ${table} (name, color, created_at, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(name) DO UPDATE SET
        color = excluded.color,
        updated_at = excluded.updated_at
    `).bind(body.name, body.color, now, now).run()

    return { success: true }
  }
  catch (e: any) {
    console.error('Failed to update metadata:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error',
    })
  }
})
