export const periods = [
    { value: "week", label: "Siste uken" },
    { value: "month", label: "Siste måneden" },
    { value: "3months", label: "Siste 3 månedene" },
    { value: "6months", label: "Siste 6 månedene" },
    { value: "year", label: "Siste år" },
    { value: "thisYear", label: "Dette året" },
];

export function getPeriodDates(period: string) {
    const today = new Date();
    const from = new Date(today);

    switch(period) {
        case "week":
            from.setDate(from.getDate() - 6);
            break;

        case "month":
            from.setMonth(from.getMonth() - 1);
            break;

        case "3months":
            from.setMonth(from.getMonth() - 3);
            break;

        case "6months":
            from.setMonth(from.getMonth() - 6);
            break;

        case "year":
            from.setFullYear(from.getFullYear() - 1);
            break;

        case "thisYear":
            from.setMonth(0);
            from.setDate(1);
            break;
    }

    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    const days =
        Math.floor(
            (today.getTime() - from.getTime()) / millisecondsPerDay
        ) + 1;

    return {
        from: from.toISOString().split("T")[0],
        to: today.toISOString().split("T")[0],
        days,
    }
}