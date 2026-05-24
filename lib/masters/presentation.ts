export const masterAvatarColors = [
  "border border-rose-300/25 bg-rose-400/10 text-rose-100",
  "border border-orange-300/25 bg-orange-400/10 text-orange-100",
  "border border-amber-300/25 bg-amber-400/10 text-amber-100",
  "border border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
  "border border-cyan-300/25 bg-cyan-400/10 text-cyan-100",
  "border border-blue-300/25 bg-blue-400/10 text-blue-100",
  "border border-violet-300/25 bg-violet-400/10 text-violet-100",
  "border border-fuchsia-300/25 bg-fuchsia-400/10 text-fuchsia-100",
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
