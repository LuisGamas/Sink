import { describe, expect, it } from 'vitest'
import { withoutQuery } from '../../server/utils/link-store'

describe('server utils: withoutQuery', () => {
  it('should remove query parameters from a URL', () => {
    const url = 'https://example.com/page?query=123'
    expect(withoutQuery(url)).toBe('https://example.com/page')
  })

  it('should handle URLs without query parameters', () => {
    const url = 'https://example.com/page'
    expect(withoutQuery(url)).toBe('https://example.com/page')
  })

  it('should remove multiple query parameters', () => {
    const url = 'https://example.com/page?a=1&b=2#hash'
    expect(withoutQuery(url)).toBe('https://example.com/page#hash')
  })
})
