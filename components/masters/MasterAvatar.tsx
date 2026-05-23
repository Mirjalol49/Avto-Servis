import { getMasterAvatarColor, getMasterInitials } from "@/lib/masters/presentation";
import { cn } from "@/lib/utils";

type MasterAvatarProps = {
  id: string;
  name: string;
  size?: "sm" | "lg";
};

export function MasterAvatar({ id, name, size = "lg" }: MasterAvatarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        getMasterAvatarColor(id),
        size === "lg" ? "size-16 text-xl" : "size-10 text-sm"
      )}
    >
      {getMasterInitials(name)}
    </div>
  );
}
