/*
  For more information on a dual range slider:
  https://medium.com/@predragdavidovic10/native-dual-range-slider-html-css-javascript-91e778134816
*/
// import { Control } from "ol/control.js";

import {
  dateToDateInputString,
  lerpDateInputMinMax,
  normalizeDateInputValue,
} from "./date-range-functionality.js";

/**
 * Call thisControl.onAddedToMap() after adding this control to the map.
 * This applies the initial filter on the target layer.
 */
export class DateRangeControl extends ol.control.Control {
  fromDateInput;
  toDateInput;
  fromSlider;
  toSlider;

  layername;
  baseStyle;

  /**
   * options:
   * * element (inherited) HTMLElement | undefined
   *   * The element is the control's container element. This only needs to be specified if you're developing a custom control.
   *   * By default this is overridden with the element with id "date-range-container"
   * * render (inherited) function | undefined
   *   * Function called when the control should be re-rendered. This is called in a requestAnimationFrame callback.
   * * target (inherited) HTMLElement | string | undefined
   *   * Specify a target if you want the control to be rendered outside of the map's viewport.
   * * layername
   * * baseStyle
   */
  constructor(options) {
    options = options || {};
    if (!options.element) {
      const dateRangeContainer = document.getElementById(
        "date-range-container"
      );
      options.element = dateRangeContainer;
    }

    super(options);

    this.layername = options.layername;
    this.baseStyle = options.baseStyle;

    this.initializeSliderBehaviour();
  }

  initializeSliderBehaviour() {
    const fromSlider = document.querySelector("#range-slider-min");
    const toSlider = document.querySelector("#range-slider-max");
    const fromInput = document.querySelector("#min-date-input");
    const toInput = document.querySelector("#max-date-input");

    this.fromSlider = fromSlider;
    this.toSlider = toSlider;
    this.fromDateInput = fromInput;
    this.toDateInput = toInput;

    // Both sliders can move by moving the handle or by updating the number input.
    fromSlider.oninput = () => {
      this.controlFromSlider();
      this.updateFilteredFeatures();
    };
    fromInput.oninput = () => {
      this.controlFromInput();
      this.updateFilteredFeatures();
    };

    toSlider.oninput = () => {
      this.controlToSlider();
      this.updateFilteredFeatures();
    };
    toInput.oninput = () => {
      this.controlToInput();
      this.updateFilteredFeatures();
    };

    // Set initial positions of slider buttons:
    this.controlFromInput();
    this.controlToInput();
    this.repaintSlider();
  }

  onAddedToMap() {
    this.updateFilteredFeatures();
  }

  /**
   * Call this after adding features with a time property possibly outside the current min-max.
   */
  recalculateMinMax() {
    const targetLayer = this.getTargetLayer();
    const source = targetLayer.getSource();
    const features = source.getFeatures();

    const startDates = features.map((f) => {
      const time = f.get("time");

      if (time && time.interval && time.interval[0])
        return new Date(time.interval[0]);
      else return null;
    });

    const endDates = features.map((f) => {
      const time = f.get("time");

      if (time && time.interval && time.interval[1])
        return new Date(time.interval[1]);
      else return null;
    });

    // Compare dates using math.min since it handles nullish values nicely.
    let earliestDate = new Date(Math.min(...startDates));
    let latestDate = new Date(Math.max(...endDates));

    // Set a default if no features had a start / end time.
    earliestDate = earliestDate || new Date("1700-01-01T00:00:00Z");
    latestDate = latestDate || new Date("2300-01-01T00:00:00Z");

    // Apply the new min-max on the input Elements
    // Format: "2003-01-01"
    this.fromDateInput.min = dateToDateInputString(earliestDate);
    this.fromDateInput.max = dateToDateInputString(latestDate);
    this.toDateInput.min = dateToDateInputString(earliestDate);
    this.toDateInput.max = dateToDateInputString(latestDate);
    // No need to update the slider input elements, their min-max is always 0-1;

    // Also reset the current date-range to min-max so it shows all features.
    this.fromDateInput.value = this.fromDateInput.min;
    this.toDateInput.value = this.toDateInput.max;

    // Reset initial positions of slider buttons:
    this.controlFromInput();
    this.controlToInput();
    this.repaintSlider();
    // Apply the new min-max filter on the features.
    this.updateFilteredFeatures();
  }

  controlFromInput() {
    if (this.fromDateInput.value > this.toDateInput.value) {
      this.fromSlider.value = normalizeDateInputValue(this.toDateInput);
      this.fromDateInput.value = this.toDateInput.value;
    } else {
      this.fromSlider.value = normalizeDateInputValue(this.fromDateInput);
    }
    this.repaintSlider();
  }

  controlToInput() {
    if (this.fromDateInput.value <= this.toDateInput.value) {
      this.toSlider.value = normalizeDateInputValue(this.toDateInput);
      this.toDateInput.value = this.toDateInput.value;
    } else {
      this.toDateInput.value = this.fromDateInput.value;
    }
    this.repaintSlider();
  }

  controlFromSlider() {
    if (this.fromSlider.value > this.toSlider.value) {
      const toDate = lerpDateInputMinMax(this.toSlider.value, this.toDateInput);

      this.fromSlider.value = this.toSlider.value;
      this.fromDateInput.value = dateToDateInputString(toDate);
    } else {
      const fromDate = lerpDateInputMinMax(
        this.fromSlider.value,
        this.fromDateInput
      );
      this.fromDateInput.value = dateToDateInputString(fromDate);
    }

    this.repaintSlider();
  }

  controlToSlider() {
    if (this.fromSlider.value <= this.toSlider.value) {
      const toDate = lerpDateInputMinMax(this.toSlider.value, this.toDateInput);

      this.toDateInput.value = dateToDateInputString(toDate);
    } else {
      const fromDate = lerpDateInputMinMax(
        this.fromSlider.value,
        this.fromDateInput
      );

      this.toSlider.value = this.fromSlider.value;
      this.toDateInput.value = dateToDateInputString(fromDate);
    }

    this.repaintSlider();
  }

  repaintSlider() {
    const from = this.fromSlider;
    const to = this.toSlider;

    const rangeDistance = to.max - to.min;
    const fromPosition = from.value - to.min;
    const toPosition = to.value - to.min;

    const sliderBgColor = "var(--slider-color)";
    const rangeColor = "var(--line-color)";

    this.toSlider.style.background = `linear-gradient(
      to right,
      ${sliderBgColor} 0%,
      ${sliderBgColor} ${(fromPosition / rangeDistance) * 100}%,
      ${rangeColor} ${(fromPosition / rangeDistance) * 100}%,
      ${rangeColor} ${(toPosition / rangeDistance) * 100}%, 
      ${sliderBgColor} ${(toPosition / rangeDistance) * 100}%, 
      ${sliderBgColor} 100%)`;
  }

  updateFilteredFeatures() {
    const layer = this.getTargetLayer();

    if (!layer) {
      console.log(
        `Failed to update filtered features, no layer found with name '${this.layername}'`
      );
      return;
    }

    layer.setStyle(
      getWithinRangeStylefunction(
        this.baseStyle,
        new Date(this.fromDateInput.value),
        new Date(this.toDateInput.value)
      )
    );
  }

  getTargetLayer() {
    const layer = this.getMap()
      .getAllLayers()
      .filter((layer) => layer.get("name") === this.layername)[0];
    return layer;
  }
}

/**
 * Returns a style function based on the given baseStyle.
 * * If within range, features are styled with the baseStyle
 * * If outside range, features are invisible
 *
 * Features styled this way need a json-fg time property:
 * ```
 * time: {
 *  interval: [minDate: Date, maxDate: Date]
 * }
 * ```
 *
 * @param {ol.style.Style.styleFunction} baseStyle
 * @param {Date} minDate
 * @param {Date} maxDate
 * @returns {ol.style.Style.styleFunction} styleFunction
 */
function getWithinRangeStylefunction(baseStyle, minDate, maxDate) {
  const styleFunction = (feature) => {
    const timeProp = feature.get("time");
    // Use old style if interval failed.
    if (!timeProp) {
      console.log("Using old style");
      return baseStyle(feature);
    }

    // The interval time strings are interpreted as UTC when they have a format like: "2002-12-31T23:00:00Z".
    // Sometimes the interval values are ".." which I read as undefined in the custom Format.
    const featureFromDate = new Date(timeProp.interval[0] || minDate);
    const featureToDate = new Date(timeProp.interval[1] || maxDate);

    // Blue if date-range of feature overlaps with date-range of slider
    if (minDate <= featureToDate && maxDate >= featureFromDate) {
      return baseStyle(feature);
    }
    // Hidden when outside given dates
    else return new ol.style.Style(null);
  };

  return styleFunction;
}
