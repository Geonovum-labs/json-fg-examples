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

    this.fromDateInput = document.getElementById("date-range-from-input");
    this.toDateInput = document.getElementById("date-range-to-input");
    this.layername = options.layername;
    this.baseStyle = options.baseStyle;

    this.initializeSliderBehaviour({
      onFromSliderChange: this.onFromSliderChange.bind(this),
      onToSliderChange: this.onToSliderChange.bind(this),
    });
  }

  initializeSliderBehaviour({ onFromSliderChange, onToSliderChange }) {
    const fromSlider = document.querySelector("#range-slider-min");
    const toSlider = document.querySelector("#range-slider-max");
    const fromInput = document.querySelector("#date-range-from-input");
    const toInput = document.querySelector("#date-range-to-input");

    // Both sliders can move by moving the handle or by updating the number input.
    fromSlider.oninput = () => {
      this.controlFromSlider(fromSlider, toSlider, fromInput, toInput);
      onFromSliderChange(fromInput.value);
    };
    fromInput.oninput = () => {
      this.controlFromInput(fromInput, toInput, fromSlider, toSlider);
      onFromSliderChange(fromInput.value);
    };

    toSlider.oninput = () => {
      this.controlToSlider(fromSlider, toSlider, fromInput, toInput);
      onToSliderChange(toInput.value);
    };
    toInput.oninput = () => {
      this.controlToInput(fromInput, toInput, fromSlider, toSlider);
      onToSliderChange(toInput.value);
    };

    // Set initial positions of slider buttons:
    this.controlFromInput(fromInput, toInput, fromSlider, toSlider);
    this.controlToInput(fromInput, toInput, fromSlider, toSlider);
    this.repaintSlider(fromSlider, toSlider, toSlider);
  }

  onAddedToMap() {
    const targetLayer = this.getTargetLayer();
    targetLayer.setStyle(
      getWithinRangeStylefunction(
        this.baseStyle,
        new Date("1900-01-01"),
        new Date("2100-01-01")
      )
    );

    this.updateFilteredFeatures();
  }

  controlFromInput(fromInput, toInput, fromSlider, toSlider) {
    if (fromInput.value > toInput.value) {
      fromSlider.value = normalizeDateInputValue(toInput);
      fromInput.value = toInput.value;
    } else {
      fromSlider.value = normalizeDateInputValue(fromInput);
    }
    this.repaintSlider(fromSlider, toSlider, toSlider);
  }

  controlToInput(fromInput, toInput, fromSlider, toSlider) {
    if (fromInput.value <= toInput.value) {
      toSlider.value = normalizeDateInputValue(toInput);
      toInput.value = toInput.value;
    } else {
      toInput.value = fromInput.value;
    }
    this.repaintSlider(fromSlider, toSlider, toSlider);
  }

  controlFromSlider(fromSlider, toSlider, fromInput, toInput) {
    if (fromSlider.value > toSlider.value) {
      const toDate = lerpDateInputMinMax(toSlider.value, toInput);

      fromSlider.value = toSlider.value;
      fromInput.value = dateToDateInputString(toDate);
    } else {
      const fromDate = lerpDateInputMinMax(fromSlider.value, fromInput);
      fromInput.value = dateToDateInputString(fromDate);
    }

    this.repaintSlider(fromSlider, toSlider, toSlider);
  }

  controlToSlider(fromSlider, toSlider, fromInput, toInput) {
    if (fromSlider.value <= toSlider.value) {
      const toDate = lerpDateInputMinMax(toSlider.value, toInput);

      toInput.value = dateToDateInputString(toDate);
    } else {
      const fromDate = lerpDateInputMinMax(fromSlider.value, fromInput);

      toSlider.value = fromSlider.value;
      toInput.value = dateToDateInputString(fromDate);
    }

    this.repaintSlider(fromSlider, toSlider, toSlider);
  }

  repaintSlider(from, to, controlSlider) {
    const rangeDistance = to.max - to.min;
    const fromPosition = from.value - to.min;
    const toPosition = to.value - to.min;

    const sliderBgColor = "var(--slider-color)";
    const rangeColor = "var(--line-color)";

    controlSlider.style.background = `linear-gradient(
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

  onFromSliderChange(newValue) {
    this.updateFilteredFeatures();
  }

  onToSliderChange(newValue) {
    this.updateFilteredFeatures();
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
