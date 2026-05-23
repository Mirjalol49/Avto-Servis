export const masterAvatarColors = [
  "bg-red-100 text-red-700",
  "bg-orange-100 text-orange-700",
  "bg-yellow-100 text-yellow-700",
  "bg-green-100 text-green-700",
  "bg-cyan-100 text-cyan-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-pink-100 text-pink-700",
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
