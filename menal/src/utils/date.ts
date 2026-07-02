export function getDate(date: Date = new Date()) {

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDateWriting(date: Date = new Date()) {
  return new Intl.DateTimeFormat("nb-NO", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}