import type { BadgeTone } from "@/components/ui/badge";
import type { RequestPriority, RequestStatus } from "@/types";

export const STATUS_TONE: Record<RequestStatus, BadgeTone> = {
  Pending: "amber",
  Assigned: "blue",
  "In Progress": "violet",
  Completed: "green",
};

export const PRIORITY_TONE: Record<RequestPriority, BadgeTone> = {
  Low: "gray",
  Medium: "amber",
  High: "red",
  Critical: "red",
};

export const STATUS_ORDER: RequestStatus[] = ["Pending", "Assigned", "In Progress", "Completed"];

export function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return (
    date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " +
    date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  );
}
