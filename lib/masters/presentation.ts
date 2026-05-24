export const masterAvatarColors = [
  "border border-slate-300/20 bg-slate-300/10 text-slate-100",
  "border border-stone-300/20 bg-stone-300/10 text-stone-100",
  "border border-amber-300/20 bg-amber-300/10 text-amber-100",
  "border border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
  "border border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
  "border border-sky-300/20 bg-sky-300/10 text-sky-100",
  "border border-indigo-200/20 bg-indigo-200/10 text-indigo-100",
  "border border-zinc-300/20 bg-zinc-300/10 text-zinc-100",
] as const;

export function getMasterInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export function getMasterAvatarColor(id: string) {
  let hash = 0;

  for (const character of id) {
    hash = (hash + character.charCodeAt(0)) % masterAvatarColors.length;
  }

  return masterAvatarColors[hash];
}
