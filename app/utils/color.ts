export function getFolderColor(name: string) {
  const colors = [
    'border-slate-500/50 bg-slate-500/10 text-slate-600 dark:text-slate-400',
    'border-zinc-500/50 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400',
    'border-gray-500/50 bg-gray-500/10 text-gray-600 dark:text-gray-400',
    'border-stone-500/50 bg-stone-500/10 text-stone-600 dark:text-stone-400',
    'border-neutral-500/50 bg-neutral-500/10 text-neutral-600 dark:text-neutral-400',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function getTagColor(name: string) {
  const colors = [
    'border-primary/50 bg-primary/10 text-primary',
    'border-indigo-500/50 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    'border-violet-500/50 bg-violet-500/10 text-violet-600 dark:text-violet-400',
    'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    'border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400',
    'border-cyan-500/50 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
