import type { SaveStatus } from "@/lib/useDebouncedSave";

export default function SaveStatusBadge({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;

  const label =
    status === "saving" ? "Đang lưu..." : status === "saved" ? "Đã lưu ✓" : "Lỗi lưu";
  const color =
    status === "saving"
      ? "text-amber-600"
      : status === "saved"
        ? "text-emerald-600"
        : "text-rose-600";

  return <span className={`text-xs ${color}`}>{label}</span>;
}
