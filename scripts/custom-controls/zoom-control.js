// import { Control } from "ol/control.js";

export class ZoomControl extends ol.control.Control {
  zoomButton;
  layername;

  /**
   * options:
   * layername - Name of the vectorlayer that this button zooms to.
   */
  constructor(options) {
    options = options || {};

    const dateRangeContainer = document.getElementsByClassName(
      "zoom-button-container"
    )[0];
    super({
      element: dateRangeContainer,
      target: options.target,
    });

    this.zoomButton = document.getElementById("zoom-button");
    this.layername = options.layername;

    this.initializeBehaviour();
  }

  initializeBehaviour() {
    if (this.zoomButton) {
      this.zoomButton.onclick = this.onZoomClicked.bind(this);
    }
  }

  zoomToLayer() {
    const layer = this.getMap()
      .getAllLayers()
      .filter((layer) => layer.get("name") === this.layername)[0];

    if (!layer) {
      console.log(
        `Failed to update filtered features, no layer found with name '${this.layername}'`
      );
      return;
    }

    const layerSource = layer.getSource();
    const extent = layerSource.getExtent();
    map.getView().fit(extent);
    // Zoom out a little
    map.getView().setZoom(map.getView().getZoom() - 0.4);
  }

  onZoomClicked() {
    this.zoomToLayer();
  }
}
