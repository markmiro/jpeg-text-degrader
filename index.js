// https://stackoverflow.com/a/84699
if (!window.chrome) {
  document.body.innerText = "Please use Google Chrome";
}

let isRecording = false;
let start;

const imageUploadButton = document.querySelector('input[type="file"]');
const imageUpload = document.getElementById("image-upload");
const clearImageUploadButton = document.getElementById("clear-file");
const canvas = document.getElementById("canvas");
const templateSelect = document.getElementById("template");
const img = document.getElementById("jpeg-text");
const downloadButton = document.getElementById("download-image");
let ctx = canvas.getContext("2d");

const templates = {
  pinkInk: {
    shouldRedrawText: false,
    refillOpacity: 0.135,
    quality: 0,
    background: "#ffffff",
    foreground: "#b75cff",
    fontSize: 0.5,
    degradeDuration: 33.5,
    degradation: 0.063,
    brightness: 111,
    saturation: 145,
    contrast: 90,
    invert: 0,
    hueRotate: 0,
    xOffset: 0,
    yOffset: 0,
    shouldBurst: false
  },
  redBlackComputerChip: {
    shouldRedrawText: false,
    refillOpacity: 0.135,
    quality: 0.15,
    background: "#ffffff",
    foreground: "#4a4151",
    fontSize: 0.5,
    degradeDuration: 30,
    degradation: 0.009,
    brightness: 114,
    saturation: 121,
    contrast: 145,
    invert: 0,
    hueRotate: 23,
    xOffset: 0,
    yOffset: 0,
    shouldBurst: false
  },
  basicCrush: {
    shouldRedrawText: false,
    refillOpacity: 0.135,
    quality: 1,
    background: "#ffffff",
    foreground: "#aa8dc1",
    fontSize: 0.5,
    degradeDuration: 5,
    degradation: 0.01,
    brightness: 100,
    saturation: 100,
    contrast: 100,
    invert: 0,
    hueRotate: 0,
    xOffset: 0,
    yOffset: 0,
    shouldBurst: false
  },
  marbledRainbow: {
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
    shouldBurst: false
  },
  burntLawn: {
    shouldRedrawText: true,
    refillOpacity: 0.135,
    quality: 0.9,
    background: "#317c2a",
    foreground: "#d13a9e",
    fontSize: 0.5,
    degradeDuration: 0,
    degradation: 0,
    brightness: 74,
    saturation: 180,
    contrast: 104,
    invert: 0,
    hueRotate: 11,
    xOffset: 0,
    yOffset: 0,
    shouldBurst: false
  },
  chromaticWater: {
    shouldRedrawText: true,
    refillOpacity: 0.135,
    quality: 0.9,
    background: "#ffffff",
    foreground: "#29ad85",
    fontSize: 0.5,
    degradeDuration: 0,
    degradation: 0,
    brightness: 84,
    saturation: 175,
    contrast: 242,
    invert: 5,
    hueRotate: 50,
    xOffset: 0,
    yOffset: 0,
    shouldBurst: true
  },
  tieDye: {
    shouldRedrawText: true,
    refillOpacity: 0.135,
    quality: 0.7,
    background: "#888888",
    foreground: "#00ff0a",
    fontSize: 0.5,
    degradeDuration: 0,
    degradation: 0,
    brightness: 108,
    saturation: 143,
    contrast: 186,
    invert: 24,
    hueRotate: 23,
    xOffset: 0,
    yOffset: 0,
    shouldBurst: true
  }
};

const WeirdText = function() {
  this.width = 600;
  this.height = 300;
  this.isRunning = true;
  Object.assign(this, templates[templateSelect.value]);

  // Not for dat.gui:
  this.message = "Hello";

  this.drawBackground = function() {
    ctx.fillStyle = this.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (imageUpload.src) {
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
        imageUpload.naturalWidth,
        imageUpload.naturalHeight
      );
      ctx.drawImage(imageUpload, x, y, width, height);
    }
  };

  this.drawText = function() {
    const testFontSize = 20;
    const baseQuality = this.quality;
    const fontFamily = "sans-serif";

    function getTargetSize(canvas, ctx, lines) {
      ctx.font = `${testFontSize}px ${fontFamily}`;
      function getSize(text) {
        const measurements = ctx.measureText(text);
        const targetSizeBasedOnWidth =
          testFontSize / measurements.width * canvas.width;
        const targetSize = Math.min(targetSizeBasedOnWidth, canvas.height);
        // console.log(this.text, targetSize);
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

    // Filters
    ctx.filter = `brightness(${this.brightness}%) saturate(${
      this.saturation
    }%) invert(${this.invert}%) contrast(${this.contrast}%) hue-rotate(${
      this.hueRotate
    }deg)`;

    // Draw text
    ctx.fillStyle = this.foreground;
    ctx.textBaseline = "hanging";
    ctx.textAlign = "center";
    const lines = this.message.split("\n");
    const targetSize = getTargetSize(canvas, ctx, lines) * this.fontSize;
    ctx.font = `${targetSize}px ${fontFamily}`;
    const yOffsetForCentering =
      canvas.height / 2 - lines.length * targetSize / 2;
    lines.forEach((line, i) => {
      const yBasedOnLine = targetSize * i;
      const x = canvas.width / 2;
      const y = yBasedOnLine + yOffsetForCentering;
      ctx.fillText(line, x + this.xOffset, y + this.yOffset);
    });

    // Convert text to JPEG
    const proportionalQuality = Math.max(
      1 - targetSize / baseQuality / 1000,
      0.1
    );
    const url = canvas.toDataURL("image/jpeg", proportionalQuality);
    img.src = url;
  };

  this.render = obj => {
    Object.assign(this, obj);
    canvas.width = this.width;
    canvas.height = this.height;
    ctx = canvas.getContext("2d");
    this.drawBackground();
    this.drawText();
    start = undefined;
  };
  this.drawBackground();
};

// ---

const update = key => v => weirdText.render({ [key]: v });
const weirdText = new WeirdText();
const gui = new dat.GUI();
gui.close();
gui.add(weirdText, "isRunning").onChange(v => {
  weirdText.isRunning = v;
  if (weirdText.isRunning) {
    window.requestAnimationFrame(degradeStep);
  }
});
gui.add(weirdText, "width").onChange(update("width"));
gui.add(weirdText, "height").onChange(update("height"));
gui.add(weirdText, "shouldRedrawText").onChange(update("shouldRedrawText"));
gui.add(weirdText, "shouldBurst").onChange(update("shouldBurst"));
gui.add(weirdText, "refillOpacity", 0, 1).onChange(update("refillOpacity"));
gui.addColor(weirdText, "background").onChange(update("background"));
gui.addColor(weirdText, "foreground").onChange(update("foreground"));
gui.add(weirdText, "fontSize");
gui.add(weirdText, "quality", 0, 1, 0.01).onChange(update("quality"));
gui
  .add(weirdText, "degradeDuration", 2, 100, 0.5)
  .onChange(update("degradeDuration"));
gui.add(weirdText, "degradation", 0, 1).onChange(update("degradation"));
gui.add(weirdText, "brightness", 0).onChange(update("brightness"));
gui.add(weirdText, "saturation", 0).onChange(update("saturation"));
gui.add(weirdText, "invert", 0).onChange(update("invert"));
gui.add(weirdText, "contrast", 0).onChange(update("contrast"));
gui.add(weirdText, "hueRotate", 0).onChange(update("hueRotate"));

// Prevent pressing "h" hidding dat.gui
document.getElementById("input").addEventListener("keydown", e => {
  e.stopPropagation();
});
document.getElementById("input").addEventListener("input", e => {
  weirdText.message = e.target.value;
  if (!weirdText.shouldRedrawText) {
    weirdText.drawBackground();
  }
  weirdText.drawText();
  start = undefined;
});

let gif = null;
let recordedFrames = 0;
document
  .getElementById("restart-start-recording-button")
  .addEventListener("click", () => {
    document.getElementById("save-recording-button").disabled = false;
    recordedFrames = 0;
    gif = new GIF({
      workers: 3,
      workerScript: "gif.worker.js",
      quality: 5,
      width: canvas.width,
      height: canvas.height
    });
    gif.on("progress", progress => {
      document.getElementById("save-recording-progress").innerText =
        Math.round(progress * 100) + "%";
    });
    gif.on("finished", blob => {
      weirdText.isRunning = true;
      window.requestAnimationFrame(degradeStep);
      gif = null;
      document.getElementById("save-recording-progress").innerText = "";
      const src = URL.createObjectURL(blob);
      document.getElementById("download-gif-link").href = src;
      document.getElementById("clear-gif-button").disabled = false;
      document.getElementById("gif-preview").src = src;
    });
    weirdText.render({});
    isRecording = true;
  });
document
  .getElementById("save-recording-button")
  .addEventListener("click", () => {
    isRecording = false;
    weirdText.isRunning = false;
    gif.render();
    document.getElementById("save-recording-button").disabled = true;
  });
document.getElementById("clear-gif-button").addEventListener("click", () => {
  document.getElementById("download-gif-link").href = "";
  document.getElementById("clear-gif-button").disabled = true;
  document.getElementById("gif-preview").src = "";
});

function degradeStep(timestamp) {
  if (!start) start = timestamp;
  const progress = (timestamp - start) / (1000 * weirdText.degradeDuration);
  let quality =
    weirdText.degradation === 0
      ? weirdText.quality
      : Math.max(1 / progress * weirdText.degradation, 0);
  // console.log(quality);
  if (weirdText.shouldBurst) {
    const deltaX = -canvas.width / 10 / 4;
    const deltaY = -canvas.height / 10 / 4;
    ctx.setTransform(
      1.05,
      Math.sin(timestamp / 1000) / 200,
      0,
      1.05,
      deltaX,
      deltaY
    );
  }
  ctx.drawImage(img, 0, 0);
  if (isRecording && gif) {
    gif.addFrame(ctx, { copy: true, delay: 50 });
    recordedFrames++;
    document.getElementById("recorded-frames").innerText = recordedFrames;
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (weirdText.shouldRedrawText) {
    const fillOpacityInHex = Math.min(
      255,
      Math.round(Math.abs(255 * weirdText.refillOpacity))
    ).toString(16);
    ctx.fillStyle = weirdText.background + fillOpacityInHex;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.filter = `brightness(${weirdText.brightness}%) saturate(${
    weirdText.saturation
  }%) invert(${weirdText.invert}%) contrast(${
    weirdText.contrast
  }%) hue-rotate(${weirdText.hueRotate}deg)`;
  if (weirdText.shouldRedrawText) {
    weirdText.drawText();
  }

  const url = canvas.toDataURL("image/jpeg", quality);
  img.src = url;

  downloadButton.href = url;

  if (weirdText.isRunning) {
    window.requestAnimationFrame(degradeStep);
  }
}
weirdText.render();
window.requestAnimationFrame(degradeStep);

imageUploadButton.addEventListener("change", e => {
  const files = e.target.files;
  if (files && files[0]) {
    imageUpload.src = URL.createObjectURL(files[0]); // set src to file url
    imageUpload.onload = () => {
      weirdText.render();
    };
  }
});
clearImageUploadButton.addEventListener("click", e => {
  imageUpload.src = "";
  weirdText.render();
});

templateSelect.addEventListener("change", e => {
  const templateKey = e.target.value;
  const template = templates[templateKey];
  Object.assign(weirdText, template);
  for (var i in gui.__controllers) {
    gui.__controllers[i].updateDisplay();
  }
  weirdText.render();
});
