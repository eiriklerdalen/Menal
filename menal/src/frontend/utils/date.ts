export function getDate(date: Date = new Date()) {

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDateWriting(date: Date = new Date(), includeYear: boolean) {
  return new Intl.DateTimeFormat("nb-NO", {
        day: "numeric",
        month: "long",
        ...(includeYear && { year: "numeric" }),
    }).format(date);
}

export function getWeekday(dayNumOfWeek: number) {
  switch (dayNumOfWeek) {
    case 0:
      return "Søndag";
    
    case 1:
      return "Mandag";

    case 2:
      return "Tirsdag";

    case 3:
      return "Onsdag";

    case 4:
      return "Torsdag";

    case 5:
      return "Fredag";

    case 6:
      return "Lørdag";
  }
}