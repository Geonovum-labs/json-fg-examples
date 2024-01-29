// import { Control } from "ol/control.js";

import { initializeSliderBehaviour } from "./date-range-functionality.js";
import { blueStyles, redStyles } from "./openlayers-styles.js";

export class DateRangeControl extends ol.control.Control {
  fromDateInput;
  toDateInput;

  layername;

  constructor(opt_options) {
    const options = opt_options || {};

    const dateRangeContainer = document.getElementsByClassName(
      "date-range-container"
    )[0];
    super({
      element: dateRangeContainer,
      target: options.target,
    });

    this.fromDateInput = document.getElementById("date-range-from-input");
    this.toDateInput = document.getElementById("date-range-to-input");
    this.layername = options.layername;

    initializeSliderBehaviour({
      sliderColor: "#eeeeee",
      rangeColor: "#25daa5",
      onFromSliderChange: this.onFromSliderChange.bind(this),
      onToSliderChange: this.onToSliderChange.bind(this),
    });
  }

  updateFilteredFeatures() {
    const layer = this.getMap()
      .getAllLayers()
      .filter((layer) => layer.get("name") === this.layername)[0];

    if (!layer) {
      console.log(
        `Failed to update filtered features, no layer found with name '${this.layername}'`
      );
      return;
    }

    layer.setStyle(
      getWithinRangeStylefunction(
        new Date(this.fromDateInput.value),
        new Date(this.toDateInput.value)
      )
    );
  }

  onFromSliderChange(newValue) {
    // console.log("From slider updated: " + newValue);
    this.updateFilteredFeatures();
  }

  onToSliderChange(newValue) {
    // console.log("To slider updated: " + newValue);
    this.updateFilteredFeatures();
  }
}

// function doRangesOverlap()

/**
 * Returns a red or blue style function to show only features between the given dates.
 *
 * @param {Date} sliderFromDate
 * @param {Date} sliderToDate
 */
export function getWithinRangeStylefunction(sliderFromDate, sliderToDate) {
  const styleFunction = (feature) => {
    const timeProp = feature.get("time");
    // Use old style if interval failed.
    if (!timeProp) {
      console.log("Using old style");
      return blueStyles[feature.getGeometry().getType()];
    }

    // The interval time strings are interpreted as UTC when they have a format like: "2002-12-31T23:00:00Z".
    // Sometimes the interval values are ".." which I read as undefined in the custom Format.
    const featureFromDate = new Date(timeProp.interval[0] || sliderFromDate);
    const featureToDate = new Date(timeProp.interval[1] || sliderToDate);

    // Blue if date-range of feature overlaps with date-range of slider
    if (sliderFromDate <= featureToDate && sliderToDate >= featureFromDate)
      return blueStyles[feature.getGeometry().getType()];
    // Red when outside given dates
    else return new ol.style.Style(null); // redStyles[feature.getGeometry().getType()];
  };

  return styleFunction;
}
