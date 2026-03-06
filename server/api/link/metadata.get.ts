export default eventHandler(async (event) => {
  const { cloudflare } = event.context
  const { DB } = cloudflare.env

  if (!DB) {
    return { folders: [], tags: [] }
  }

  try {
    const foldersResult = await DB.prepare('SELECT DISTINCT folder FROM links WHERE folder IS NOT NULL').all()
    const tagsResult = await DB.prepare('SELECT tags FROM links WHERE tags IS NOT NULL').all()

    const folders = foldersResult.results.map((r: any) => r.folder)

    const tagsSet = new Set<string>()
    tagsResult.results.forEach((r: any) => {
      try {
        const tags = JSON.parse(r.tags)
        if (Array.isArray(tags)) {
          tags.forEach(t => tagsSet.add(t))
        }
      }
      catch {}
    })

    return {
      folders: folders.sort(),
      tags: Array.from(tagsSet).sort(),
    }
  }
  catch (e) {
    console.error('Failed to fetch metadata:', e)
    return { folders: [], tags: [] }
  }
})
