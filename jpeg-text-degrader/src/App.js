import React, { Component } from "react";

let isRecording = false;
let start;

const template = {
  message: "Hello",

  fullWidth: true,
  width: 600,
  height: 300,
  isRunning: true,

  brightness2: 100,
  saturation2: 100,
  contrast2: 100,
  invert2: 0,
  hueRotate2: 0

  // TODO: add backgrund image object to the settings so we can save it and stuff
};

const settings = {
  ...template,
  shouldRedrawText: true,
  refillOpacity: 0.135,
  quality: 0.7,
  background: "#ffffff",
  foreground: "#00ff0a",
  fontSize: 0.5,
  degradeDuration: 0,
  degradation: 0,
  brightness: 84,
  saturation: 188,
  contrast: 138,
  invert: 6,
  hueRotate: 30,
  xOffset: 0,
  yOffset: 0,
  shouldBurst: false,
  shouldFlame: false
};

function drawBackground(
  opts = {
    isRefilling: false,
    settings: {},
    canvas: null,
    ctx: null,
    $image: {}
  }
) {
  const { isRefilling, settings, canvas, ctx, $image } = opts;
  const fillOpacityInHex = () =>
    Math.min(255, Math.round(Math.abs(255 * settings.refillOpacity)))
      .toString(16)
      .padStart(2, "0");

  ctx.fillStyle =
    settings.background + (isRefilling ? fillOpacityInHex() : "ff");
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if ($image && $image.src) {
    function toFill(targetW, targetH, w, h) {
      const shouldFillEnds = targetW / targetH > w / h;

      if (shouldFillEnds) {
        const newHeight = targetW * h / w;
        const centerY = targetH / 2 - newHeight / 2;
        return { width: targetW, height: newHeight, x: 0, y: centerY };
      } else {
        const newWidth = targetH * w / h;
        const centerX = targetW / 2 - newWidth / 2;
        return { width: newWidth, height: targetH, x: centerX, y: 0 };
      }
    }
    const { width, height, x, y } = toFill(
      canvas.width,
      canvas.height,
      $image.naturalWidth,
      $image.naturalHeight
    );
    if (isRefilling) ctx.globalAlpha = this.refillOpacity;
    ctx.drawImage($image, x, y, width, height);
    ctx.globalAlpha = 1;
  }
}

function drawText({ canvas, ctx, settings }) {
  const testFontSize = 20;
  const baseQuality = settings.quality;
  const fontFamily = "sans-serif";

  function getTargetSize(canvas, ctx, lines) {
    ctx.font = `${testFontSize}px ${fontFamily}`;
    function getSize(text) {
      const measurements = ctx.measureText(text);
      const targetSizeBasedOnWidth =
        testFontSize / measurements.width * canvas.width;
      const targetSize = Math.min(targetSizeBasedOnWidth, canvas.height);
      // console.log(settings.text, targetSize);
      return targetSize;
    }
    const targetSize = lines.reduce(
      (acc, line) => Math.min(getSize(line), acc),
      Infinity
    );
    const targetSizeBasedOnTotalHeight = canvas.height / lines.length;
    // console.log('targetSizeBasedOnTotalHeight', targetSizeBasedOnTotalHeight);
    return Math.min(targetSize, targetSizeBasedOnTotalHeight);
  }

  // Draw text
  ctx.fillStyle = settings.foreground;
  ctx.textBaseline = "hanging";
  ctx.textAlign = "center";
  const lines = settings.message.split("\n");
  const targetSize = getTargetSize(canvas, ctx, lines) * settings.fontSize;
  ctx.font = `${targetSize}px ${fontFamily}`;
  const yOffsetForCentering = canvas.height / 2 - lines.length * targetSize / 2;
  lines.forEach((line, i) => {
    const yBasedOnLine = targetSize * i;
    const x = canvas.width / 2;
    const y = yBasedOnLine + yOffsetForCentering;
    ctx.fillText(line, x + settings.xOffset, y + settings.yOffset);
  });
}

class App extends Component {
  constructor(props) {
    super(props);
    this.$canvas = React.createRef();
    this.$canvas2 = React.createRef();
    this.$img = React.createRef();
    this.state = settings;
  }

  componentDidMount() {
    const ctx = this.$canvas.current.getContext("2d");
    const ctx2 = this.$canvas2.current.getContext("2d");
    function step() {
      drawBackground({
        settings: this.state,
        canvas: this.$canvas.current,
        ctx
      });
      drawText({
        settings: this.state,
        canvas: this.$canvas.current,
        ctx
      });
      if (this.state.isRunning) {
        window.requestAnimationFrame(step);
      }
    }
    step = step.bind(this);
    window.requestAnimationFrame(step);
  }

  componentDidUpdate(nextProps, nextState) {
    const settings = this.state;
    const $canvas = this.$canvas.current;
    const $canvas2 = this.$canvas2.current;
    const $image = this.$img.current;
    let ctx = this.$canvas.current.getContext("2d");
    let ctx2 = this.$canvas2.current.getContext("2d");
    $canvas2.width = $canvas.width = settings.width;
    $canvas2.height = $canvas.height = settings.height;
    ctx = $canvas.getContext("2d");
    ctx2 = $canvas2.getContext("2d");

    start = undefined;

    if (!settings.shouldRedrawText) {
      drawBackground({ settings, $canvas, ctx });
      drawText({ settings, $canvas, ctx });
      $image.src = $canvas.toDataURL("image/jpeg", settings.quality);
    }

    const settingsBlob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json"
    });
  }

  render() {
    return (
      <div>
        <div style={{ border: "3px solid green" }}>
          <textarea
            value={this.state.message}
            onChange={e => this.setState({ message: e.target.value })}
          />
          <select>
            <option>Marbled Rainbow</option>
          </select>
          <a href="#" className="button">
            Save Creation
          </a>
          <button style={{ position: "relative" }}>
            Open Creation
            <input id="image-uploader" type="file" accept="image/*" />
          </button>
          <label>
            <input type="checkbox" defaultChecked />
            Is Running
          </label>
          <canvas
            ref={this.$canvas}
            width={settings.width}
            height={settings.height}
            style={{ border: "3px solid red", display: "block" }}
          />
          <canvas
            ref={this.$canvas2}
            width={settings.width}
            height={settings.height}
            style={{ border: "3px solid red", display: "block" }}
          />
          <img
            ref={this.$img}
            style={{ border: "3px solid white", display: "block" }}
          />
          <button>Download JPEG</button>
          <select>
            <option>GIF</option>
            <option>WEBM</option>
          </select>
          <select>
            <option>Record</option>
            <option>Restart + Record</option>
          </select>
          <button>Start Recording</button>
          <button>Finish Recording</button>
          <div style={{ border: "3px solid yellow" }}>
            <h1>Recorded</h1>
            <button>Stop Processing</button>
            <img src="" />
            <a href="#" className="button">
              Download GIF
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
