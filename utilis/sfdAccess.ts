import AccessCode from "@/utilis/models/AccessCode";

// Has this user unlocked this edition? Admins can read everything.
export async function hasEditionAccess(user: any, editionId: any) {
  if (user.role === "admin") return true;

  const code = await AccessCode.exists({
    usedBy: user._id,
    editionId,
    status: "used",
  });
  return !!code;
}

// All edition IDs this user has unlocked
export async function getUnlockedEditionIds(user: any): Promise<string[]> {
  const ids = await AccessCode.find({
    usedBy: user._id,
    status: "used",
  }).distinct("editionId");
  return ids.map((id: any) => id.toString());
}

// "YYYY-MM-DD" from the phone, or today in Lagos as a fallback
export function getDateString(date?: string | null) {
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });
}

// Start and end of a day, for matching reading dates
export function getDayRange(dateString: string) {
  const start = new Date(`${dateString}T00:00:00.000Z`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}