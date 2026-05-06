export const getStartDate = (period: string) => {
  const now = new Date();
  switch (period) {
    case "today":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case "last_7_days":
      return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    case "last_30_days":
      return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    case "last_year":
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    default:
      return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }
};

export const getPreviousPeriodRange = (
  period: string,
): { start: Date; end: Date } => {
  const now = new Date();
  let currentStart: Date;
  let durationMs: number;

  switch (period) {
    case "today":
      currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      durationMs = 24 * 60 * 60 * 1000;
      break;
    case "last_7_days":
      currentStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      durationMs = 7 * 24 * 60 * 60 * 1000;
      break;
    case "last_30_days":
      currentStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      durationMs = 30 * 24 * 60 * 60 * 1000;
      break;
    case "last_year":
      currentStart = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate(),
      );
      durationMs = 365 * 24 * 60 * 60 * 1000;
      break;
    default:
      currentStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      durationMs = 30 * 24 * 60 * 60 * 1000;
  }

  const previousEnd = new Date(currentStart.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - durationMs);

  return { start: previousStart, end: previousEnd };
};
