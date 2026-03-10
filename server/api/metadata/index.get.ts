export default eventHandler(async (event) => {
  const { cloudflare } = event.context
  const { DB } = cloudflare.env

  if (!DB) {
    return { folders: [], tags: [] }
  }

  try {
    // 1. Fetch metadata (colors) - these are our "known" items
    let foldersMetadata = { results: [] }
    let tagsMetadata = { results: [] }
    try {
      foldersMetadata = await DB.prepare('SELECT name, color FROM folders_metadata').all()
      tagsMetadata = await DB.prepare('SELECT name, color FROM tags_metadata').all()
    }
    catch {
      console.warn('Metadata tables might be missing, please run migrations.')
    }

    // 2. Fetch all folders from links and their counts
    const foldersCounts = await DB.prepare(`
      SELECT folder as name, COUNT(*) as count 
      FROM links 
      WHERE folder IS NOT NULL 
      GROUP BY folder
    `).all()

    // 3. Fetch all tags from links and calculate counts
    const tagsRows = await DB.prepare('SELECT tags FROM links WHERE tags IS NOT NULL').all()
    const tagsMap = new Map<string, number>()
    tagsRows.results.forEach((r: any) => {
      try {
        const tags = JSON.parse(r.tags)
        if (Array.isArray(tags)) {
          tags.forEach((t) => {
            tagsMap.set(t, (tagsMap.get(t) || 0) + 1)
          })
        }
      }
      catch {}
    })

    // 4. Merge Everything
    const finalFoldersMap = new Map<string, { name: string, color: string, count: number }>()
    const finalTagsMap = new Map<string, { name: string, color: string, count: number }>()

    // Add items from metadata first (so even empty ones appear)
    foldersMetadata.results.forEach((r: any) => {
      finalFoldersMap.set(r.name, { name: r.name, color: r.color, count: 0 })
    })
    tagsMetadata.results.forEach((r: any) => {
      finalTagsMap.set(r.name, { name: r.name, color: r.color, count: 0 })
    })

    // Add/Update counts from actual links
    foldersCounts.results.forEach((r: any) => {
      const existing = finalFoldersMap.get(r.name)
      if (existing) {
        existing.count = r.count
      }
      else {
        finalFoldersMap.set(r.name, { name: r.name, color: 'slate', count: r.count })
      }
    })

    tagsMap.forEach((count, name) => {
      const existing = finalTagsMap.get(name)
      if (existing) {
        existing.count = count
      }
      else {
        finalTagsMap.set(name, { name, color: 'primary', count })
      }
    })

    return {
      folders: Array.from(finalFoldersMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
      tags: Array.from(finalTagsMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
    }
  }
  catch (e) {
    console.error('Failed to fetch metadata:', e)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }
})
