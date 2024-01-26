// import { Control } from "ol/control.js";

import { initializeSliderBehaviour } from "./date-range-functionality.js";

export class DateRangeControl extends ol.control.Control {
  constructor(opt_options) {
    const options = opt_options || {};

    const dateRangeContainer = document.getElementsByClassName(
      "date-range-container"
    )[0];
    super({
      element: dateRangeContainer,
      target: options.target,
    });

    initializeSliderBehaviour({
      sliderColor: "#eeeeee",
      rangeColor: "#25daa5",
      onFromSliderChange: this.onFromSliderChange,
      onToSliderChange: this.onToSliderChange,
    });
  }

  onFromSliderChange(newValue) {
    console.log("From slider updated: " + newValue);
  }

  onToSliderChange(newValue) {
    console.log("To slider updated: " + newValue);
  }

  // handleRotateNorth() {
  //   this.getMap().getView().setRotation(0);
  // }
}
