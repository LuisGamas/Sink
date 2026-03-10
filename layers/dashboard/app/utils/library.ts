export const LIBRARY_COLORS = [
  { name: 'primary', class: 'bg-primary', border: 'border-primary/50 bg-primary/10 text-primary' },
  { name: 'slate', class: 'bg-slate-500', border: 'border-slate-500/50 bg-slate-500/10 text-slate-600 dark:text-slate-400' },
  { name: 'red', class: 'bg-red-500', border: 'border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400' },
  { name: 'orange', class: 'bg-orange-500', border: 'border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  { name: 'amber', class: 'bg-amber-500', border: 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { name: 'yellow', class: 'bg-yellow-500', border: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
  { name: 'lime', class: 'bg-lime-500', border: 'border-lime-500/50 bg-lime-500/10 text-lime-600 dark:text-lime-400' },
  { name: 'green', class: 'bg-green-500', border: 'border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400' },
  { name: 'emerald', class: 'bg-emerald-500', border: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { name: 'teal', class: 'bg-teal-500', border: 'border-teal-500/50 bg-teal-500/10 text-teal-600 dark:text-teal-400' },
  { name: 'cyan', class: 'bg-cyan-500', border: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' },
  { name: 'sky', class: 'bg-sky-500', border: 'border-sky-500/50 bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  { name: 'blue', class: 'bg-blue-500', border: 'border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { name: 'indigo', class: 'bg-indigo-500', border: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
  { name: 'violet', class: 'bg-violet-500', border: 'border-violet-500/50 bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  { name: 'purple', class: 'bg-purple-500', border: 'border-purple-500/50 bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  { name: 'fuchsia', class: 'bg-fuchsia-500', border: 'border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400' },
  { name: 'pink', class: 'bg-pink-500', border: 'border-pink-500/50 bg-pink-500/10 text-pink-600 dark:text-pink-400' },
  { name: 'rose', class: 'bg-rose-500', border: 'border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  { name: 'zinc', class: 'bg-zinc-500', border: 'border-zinc-500/50 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400' },
]

export function getLibraryColorClasses(colorName?: string) {
  const color = LIBRARY_COLORS.find(c => c.name === colorName)
  return color ? color.border : LIBRARY_COLORS[1].border // Default to slate
}
