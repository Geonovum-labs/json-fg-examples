/*
  For more information on a dual range slider:
  https://medium.com/@predragdavidovic10/native-dual-range-slider-html-css-javascript-91e778134816
*/

export function initializeSliderBehaviour({
  sliderColor,
  rangeColor,
  onFromSliderChange,
  onToSliderChange,
}) {
  const fromSlider = document.querySelector("#range-slider-min");
  const toSlider = document.querySelector("#range-slider-max");
  const fromInput = document.querySelector("#date-range-from-input");
  const toInput = document.querySelector("#date-range-to-input");
  setToggleAccessible(toSlider);

  // Both sliders can move by moving the handle or by updating the number input.
  fromSlider.oninput = () => {
    controlFromSlider(
      fromSlider,
      toSlider,
      fromInput,
      toInput,
      sliderColor,
      rangeColor
    );
    onFromSliderChange(fromInput.value);
  };
  fromInput.oninput = () => {
    controlFromInput(
      fromInput,
      toInput,
      fromSlider,
      toSlider,
      sliderColor,
      rangeColor
    );
    onFromSliderChange(fromInput.value);
  };

  toSlider.oninput = () => {
    controlToSlider(
      fromSlider,
      toSlider,
      fromInput,
      toInput,
      sliderColor,
      rangeColor
    );
    onToSliderChange(toInput.value);
  };
  toInput.oninput = () => {
    controlToInput(
      fromInput,
      toInput,
      fromSlider,
      toSlider,
      sliderColor,
      rangeColor
    );
    onToSliderChange(toInput.value);
  };

  // Set initial positions of slider buttons:
  controlFromInput(
    fromInput,
    toInput,
    fromSlider,
    toSlider,
    sliderColor,
    rangeColor
  );
  controlToInput(
    fromInput,
    toInput,
    fromSlider,
    toSlider,
    sliderColor,
    rangeColor
  );
  fillSlider(fromSlider, toSlider, sliderColor, rangeColor, toSlider);
}

/** Calculates a number between 0 and 1 representing the position of the date slider between min and max. */
function normalizeDateInputValue(dateInput) {
  // min and max are strings with format 2018-01-01
  const minDate = new Date(dateInput.getAttribute("min"));
  const maxDate = new Date(dateInput.getAttribute("max"));
  const currentDate = new Date(dateInput.value);

  return (currentDate - minDate) / (maxDate - minDate);
}

function controlFromInput(
  fromInput,
  toInput,
  fromSlider,
  toSlider,
  sliderColor,
  rangeColor
) {
  if (fromInput.value > toInput.value) {
    fromSlider.value = normalizeDateInputValue(toInput);
    fromInput.value = toInput.value;
  } else {
    fromSlider.value = normalizeDateInputValue(fromInput);
  }
  fillSlider(fromSlider, toSlider, sliderColor, rangeColor, toSlider);
}

function controlToInput(
  fromInput,
  toInput,
  fromSlider,
  toSlider,
  sliderColor,
  rangeColor
) {
  if (fromInput.value <= toInput.value) {
    toSlider.value = normalizeDateInputValue(toInput);
    toInput.value = toInput.value;
  } else {
    toInput.value = fromInput.value;
  }
  fillSlider(fromSlider, toSlider, sliderColor, rangeColor, toSlider);
  setToggleAccessible(toInput);
}

/**
 * Linear interpolate between two numbers.
 * t (time) from 0 to 1 for results within range.
 */
const lerp = (x, y, t) => x * (1 - t) + y * t;

/**
 * @param {number} t Should range between 0 and 1
 * @param {HTMLInputElement} dateInput
 */
function lerpDates(minDate, maxDate, t) {
  return new Date(lerp(minDate, maxDate, t));
}

/**
 * @param {number} number Should range between 0 and 1 for dates within min-max range of Date input.
 * @param {HTMLInputElement} dateInput
 */
function lerpDateInputMinMax(number, dateInput) {
  // min and max are strings with format 2018-01-01
  const minDate = new Date(dateInput.getAttribute("min"));
  const maxDate = new Date(dateInput.getAttribute("max"));

  return lerpDates(minDate, maxDate, number);
}

/** HTML input elements of type Date require strings of format: "yyyy-MM-dd" */
function dateToDateInputString(date) {
  // Month + 1 because, unlike days, months are 0 indexed.
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function controlFromSlider(
  fromSlider,
  toSlider,
  fromInput,
  toInput,
  sliderColor,
  rangeColor
) {
  if (fromSlider.value > toSlider.value) {
    const toDate = lerpDateInputMinMax(toSlider.value, toInput);

    fromSlider.value = toSlider.value;
    fromInput.value = dateToDateInputString(toDate);
  } else {
    const fromDate = lerpDateInputMinMax(fromSlider.value, fromInput);
    fromInput.value = dateToDateInputString(fromDate);
  }

  fillSlider(fromSlider, toSlider, sliderColor, rangeColor, toSlider);
}

function controlToSlider(
  fromSlider,
  toSlider,
  fromInput,
  toInput,
  sliderColor,
  rangeColor
) {
  if (fromSlider.value <= toSlider.value) {
    const toDate = lerpDateInputMinMax(toSlider.value, toInput);

    toInput.value = dateToDateInputString(toDate);
  } else {
    const fromDate = lerpDateInputMinMax(fromSlider.value, fromInput);

    toSlider.value = fromSlider.value;
    toInput.value = dateToDateInputString(fromDate);
  }

  fillSlider(fromSlider, toSlider, sliderColor, rangeColor, toSlider);
  setToggleAccessible(toSlider);
}

function fillSlider(from, to, sliderColor, rangeColor, controlSlider) {
  const rangeDistance = to.max - to.min;
  const fromPosition = from.value - to.min;
  const toPosition = to.value - to.min;
  controlSlider.style.background = `linear-gradient(
    to right,
    ${sliderColor} 0%,
    ${sliderColor} ${(fromPosition / rangeDistance) * 100}%,
    ${rangeColor} ${(fromPosition / rangeDistance) * 100}%,
    ${rangeColor} ${(toPosition / rangeDistance) * 100}%, 
    ${sliderColor} ${(toPosition / rangeDistance) * 100}%, 
    ${sliderColor} 100%)`;
}

function setToggleAccessible(currentTarget) {
  const toSlider = document.querySelector("#range-slider-max");
  if (Number(currentTarget.value) <= 0) {
    toSlider.style.zIndex = 2;
  } else {
    toSlider.style.zIndex = 0;
  }
}
