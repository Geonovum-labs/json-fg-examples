/** Calculates a number between 0 and 1 representing the position of the date slider between min and max. */
export function normalizeDateInputValue(dateInput) {
  // min and max are strings with format 2018-01-01
  const minDate = new Date(dateInput.getAttribute("min"));
  const maxDate = new Date(dateInput.getAttribute("max"));
  const currentDate = new Date(dateInput.value);

  return (currentDate - minDate) / (maxDate - minDate);
}

/**
 * Linear interpolate between two numbers.
 * t (time) from 0 to 1 for results within range.
 */
const lerp = (x, y, t) => x * (1 - t) + y * t;

/**
 * Linear interpolate between two dates.
 * @param {number} t Should range between 0 and 1
 * @param {HTMLInputElement} dateInput
 */
export function lerpDates(minDate, maxDate, t) {
  return new Date(lerp(minDate, maxDate, t));
}

/**
 * @param {number} number Should range between 0 and 1 for dates within min-max range of Date input.
 * @param {HTMLInputElement} dateInput
 */
export function lerpDateInputMinMax(number, dateInput) {
  // min and max are strings with format 2018-01-01
  const minDate = new Date(dateInput.getAttribute("min"));
  const maxDate = new Date(dateInput.getAttribute("max"));

  return lerpDates(minDate, maxDate, number);
}

/** HTML input elements of type Date require strings of format: "yyyy-MM-dd" */
export function dateToDateInputString(date) {
  // Month + 1 because, unlike days, months are 0 indexed.
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
