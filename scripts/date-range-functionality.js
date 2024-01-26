/*
  Based on this Medium article with small edits:
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
  const fromInput = document.querySelector("#fromInput");
  const toInput = document.querySelector("#toInput");
  fillSlider(fromSlider, toSlider, sliderColor, rangeColor, toSlider);
  setToggleAccessible(toSlider);

  // Both sliders can move by moving the handle or by updating the number input.
  fromSlider.oninput = () => {
    controlFromSlider(fromSlider, toSlider, fromInput, sliderColor, rangeColor);
    onFromSliderChange(fromInput.value);
  };
  fromInput.oninput = () => {
    controlFromInput(
      fromSlider,
      fromInput,
      toInput,
      toSlider,
      sliderColor,
      rangeColor
    );
    onFromSliderChange(fromInput.value);
  };

  toSlider.oninput = () => {
    controlToSlider(fromSlider, toSlider, toInput, sliderColor, rangeColor);
    onToSliderChange(toInput.value);
  };
  toInput.oninput = () => {
    controlToInput(
      toSlider,
      fromInput,
      toInput,
      toSlider,
      sliderColor,
      rangeColor
    );
    onToSliderChange(toInput.value);
  };
}

function controlFromInput(
  fromSlider,
  fromInput,
  toInput,
  controlSlider,
  sliderColor,
  rangeColor
) {
  const [from, to] = getParsed(fromInput, toInput);
  fillSlider(fromInput, toInput, sliderColor, rangeColor, controlSlider);
  if (from > to) {
    fromSlider.value = to;
    fromInput.value = to;
  } else {
    fromSlider.value = from;
  }
}

function controlToInput(
  toSlider,
  fromInput,
  toInput,
  controlSlider,
  sliderColor,
  rangeColor
) {
  const [from, to] = getParsed(fromInput, toInput);
  fillSlider(fromInput, toInput, sliderColor, rangeColor, controlSlider);
  setToggleAccessible(toInput);
  if (from <= to) {
    toSlider.value = to;
    toInput.value = to;
  } else {
    toInput.value = from;
  }
}

function controlFromSlider(
  fromSlider,
  toSlider,
  fromInput,
  sliderColor,
  rangeColor
) {
  const [from, to] = getParsed(fromSlider, toSlider);
  fillSlider(fromSlider, toSlider, sliderColor, rangeColor, toSlider);
  if (from > to) {
    fromSlider.value = to;
    fromInput.value = to;
  } else {
    fromInput.value = from;
  }
}

function controlToSlider(
  fromSlider,
  toSlider,
  toInput,
  sliderColor,
  rangeColor
) {
  const [from, to] = getParsed(fromSlider, toSlider);
  fillSlider(fromSlider, toSlider, sliderColor, rangeColor, toSlider);
  setToggleAccessible(toSlider);
  if (from <= to) {
    toSlider.value = to;
    toInput.value = to;
  } else {
    toInput.value = from;
    toSlider.value = from;
  }
}

function getParsed(currentFrom, currentTo) {
  const from = parseInt(currentFrom.value, 10);
  const to = parseInt(currentTo.value, 10);
  return [from, to];
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
