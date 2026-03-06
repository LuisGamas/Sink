export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return `sha256:${hashHex}`
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  // Backward compatibility: if the stored password doesn't have our prefix, it's plaintext
  if (!hashed.startsWith('sha256:')) {
    return plain === hashed
  }

  const currentHash = await hashPassword(plain)
  return currentHash === hashed
}
