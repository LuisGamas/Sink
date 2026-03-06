import { LinkSchema } from '#shared/schemas/link'
import { z } from 'zod'

defineRouteMeta({
  openAPI: {
    description: 'Delete multiple short links at once',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['slugs'],
            properties: {
              slugs: {
                type: 'array',
                items: { type: 'string' },
                description: 'The slugs of the links to delete',
              },
            },
          },
        },
      },
    },
  },
})

const DeleteBatchSchema = z.object({
  slugs: z.array(LinkSchema.shape.slug.removeDefault().min(1)).max(100),
})

export default eventHandler(async (event) => {
  const { previewMode } = useRuntimeConfig(event).public
  if (previewMode) {
    throw createError({
      status: 403,
      statusText: 'Preview mode cannot delete links.',
    })
  }

  const { slugs } = await readValidatedBody(event, DeleteBatchSchema.parse)

  // Parallel deletion in KV
  const results = await Promise.allSettled(
    slugs.map(slug => deleteLink(event, slug)),
  )

  const failures = results.filter(r => r.status === 'rejected')

  if (failures.length > 0) {
    throw createError({
      status: 207, // Multi-Status
      statusText: `Partial success: ${slugs.length - failures.length} deleted, ${failures.length} failed.`,
    })
  }

  return { success: true, deleted: slugs.length }
})
