// import { Control } from "ol/control.js";

export class DateRangeControl extends ol.control.Control {
  constructor(opt_options) {
    const options = opt_options || {};

    // It worked as dynamically created div, but testing if it works as child div of map.
    // That is a little more in line with the declarative nature of this example project.
    // const element = document.createElement("div");
    // element.className = "date-range-control ol-unselectable ol-control";

    const element = document.getElementById("date-range-control");

    // const sliderMinEle = document.getElementById("range-slider-min");
    // const sliderMaxEle = document.getElementById("range-slider-max");
    // sliderEle.addEventListener("click", this.handleRotateNorth.bind(this), false);

    super({
      element: element,
      target: options.target,
    });
  }

  // handleRotateNorth() {
  //   this.getMap().getView().setRotation(0);
  // }
}
