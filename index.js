// https://stackoverflow.com/a/84699
if (!window.chrome) {
  document.body.innerText = "Please use Google Chrome";
}

let isRecording = false;
let start;

const settingsUploadButton = document.getElementById("settings-uploader");
const imageUploadButton = document.getElementById("image-uploader");
const imageUpload = document.getElementById("image-upload");
const clearImageUploadButton = document.getElementById("clear-file");
const templateSelect = document.getElementById("template");
const img = document.createElement("img");
const downloadButton = document.getElementById("download-image");

const canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");
let canvas2 = document.getElementById("canvas2");
let ctx2 = canvas2.getContext("2d");

const templates = {
  punkFire: {
    width: 600,
    height: 300,
    isRunning: true,
    shouldRedrawText: true,
    refillOpacity: 0.25808636748518204,
    quality: 0.66,
    background: "#000000",
    foreground: "#ff0000",
    fontSize: 0.6099999999999999,
    degradeDuration: 2,
    degradation: 0,
    brightness: 44,
    saturation: 300,
    contrast: 400,
    invert: 0,
    hueRotate: 28,
    xOffset: 0,
    yOffset: 0,
    shouldBurst: false,
    shouldFlame: true
  },
  pinkFire: {
    width: 600,
    height: 300,
    isRunning: true,
    shouldRedrawText: true,
    refillOpacity: 0.16054191363251483,
    quality: 0.4,
    background: "#c622c0",
    foreground: "#0065ff",
    fontSize: 0.5,
    degradeDuration: 2,
    degradation: 0,
    brightness: 88,
    saturation: 220,
    contrast: 196,
    invert: 20,
    hueRotate: 27,
    xOffset: 0,
    yOffset: 0,
    shouldBurst: false,
    shouldFlame: true
  },
  pinkInk: {
    shouldRedrawText: false,
    refillOpacity: 0.135,
    quality: 0,
    background: "#ffffff",
    foreground: "#b75cff",
    fontSize: 0.5,
    degradeDuration: 33.5,
    degradation: 6.3,
    brightness: 111,
    saturation: 145,
    contrast: 90,
    invert: 0,
    hueRotate: 0,
    xOffset: 0,
    yOffset: 0,
    shouldBurst: false,
    shouldFlame: false
  },
  redBlackComputerChip: {
    shouldRedrawText: false,
    refillOpacity: 0.135,
    quality: 0.15,
    background: "#ffffff",
    foreground: "#4a4151",
    fontSize: 0.5,
    degradeDuration: 30,
    degradation: 0.9,
    brightness: 114,
    saturation: 121,
    contrast: 145,
    invert: 0,
    hueRotate: 23,
    xOffset: 0,
    yOffset: 0,
    shouldBurst: false,
    shouldFlame: false
  },
  basicCrush: {
    shouldRedrawText: false,
    refillOpacity: 0.135,
    quality: 1,
    background: "#ffffff",
    foreground: "#aa8dc1",
    fontSize: 0.5,
    degradeDuration: 5,
    degradation: 1,
    brightness: 100,
    saturation: 100,
    contrast: 100,
    invert: 0,
    hueRotate: 0,
    xOffset: 0,
    yOffset: 0,
    shouldBurst: false,
    shouldFlame: false
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
    shouldBurst: false,
    shouldFlame: false
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
    shouldBurst: false,
    shouldFlame: false
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
    shouldBurst: true,
    shouldFlame: false
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
    shouldBurst: true,
    shouldFlame: false
  }
};

const WeirdText = function() {
  this.fullWidth = true;
  this.width = 600;
  this.height = 300;
  this.isRunning = true;

  this.brightness2 = 100;
  this.saturation2 = 100;
  this.contrast2 = 100;
  this.invert2 = 0;
  this.hueRotate2 = 0;

  Object.assign(this, templates[templateSelect.value]);

  // Not for dat.gui:
  this.message = "Hello";

  this.drawBackground = function(opts = { isRefilling: false }) {
    const fillOpacityInHex = () =>
      Math.min(255, Math.round(Math.abs(255 * weirdText.refillOpacity)))
        .toString(16)
        .padStart(2, "0");

    ctx.fillStyle =
      weirdText.background + (opts.isRefilling ? fillOpacityInHex() : "ff");
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
      if (opts.isRefilling) ctx.globalAlpha = this.refillOpacity;
      ctx.drawImage(imageUpload, x, y, width, height);
      ctx.globalAlpha = 1;
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
  };

  this.reset = obj => {
    Object.assign(this, obj);
    canvas2.width = canvas.width = this.width;
    canvas2.height = canvas.height = this.height;
    ctx = canvas.getContext("2d");
    ctx2 = canvas2.getContext("2d");

    start = undefined;

    if (!this.shouldRedrawText) {
      this.drawBackground();
      this.drawText();
      img.src = canvas.toDataURL("image/jpeg", this.quality);
    }

    const settingsBlob = new Blob([JSON.stringify(this, null, 2)], {
      type: "application/json"
    });
    document.getElementById("download-settings").href = URL.createObjectURL(
      settingsBlob
    );
    if (this.fullWidth) {
      !canvas2.classList.contains("gif-preview--full") &&
        canvas2.classList.add("gif-preview--full");
    } else {
      canvas2.classList.contains("gif-preview--full") &&
        canvas2.classList.remove("gif-preview--full");
    }
  };
};

// ---

const update = key => v => weirdText.reset({ [key]: v });
const weirdText = new WeirdText();
const gui = new dat.GUI();
gui.close();
gui.add(weirdText, "isRunning").onChange(v => {
  weirdText.isRunning = v;
  if (weirdText.isRunning) {
    window.requestAnimationFrame(degradeStep);
  }
});
gui.add(weirdText, "fullWidth").onChange(update("fullWidth"));
gui.add(weirdText, "width").onChange(update("width"));
gui.add(weirdText, "height").onChange(update("height"));
gui.add(weirdText, "shouldRedrawText").onChange(update("shouldRedrawText"));
gui.add(weirdText, "shouldBurst").onChange(update("shouldBurst"));
gui.add(weirdText, "refillOpacity", 0, 1).onChange(update("refillOpacity"));
gui.addColor(weirdText, "background").onChange(update("background"));
gui.addColor(weirdText, "foreground").onChange(update("foreground"));
gui.add(weirdText, "fontSize").onChange(update("fontSize"));
gui.add(weirdText, "quality", 0, 1, 0.01).onChange(update("quality"));
gui
  .add(weirdText, "degradeDuration", 2, 100, 0.5)
  .onChange(update("degradeDuration"));
gui.add(weirdText, "degradation", 0, 10, 0.01).onChange(update("degradation"));
gui.add(weirdText, "brightness", 0).onChange(update("brightness"));
gui.add(weirdText, "saturation", 0).onChange(update("saturation"));
gui.add(weirdText, "invert", 0).onChange(update("invert"));
gui.add(weirdText, "contrast", 0).onChange(update("contrast"));
gui.add(weirdText, "hueRotate", 0).onChange(update("hueRotate"));
gui.add(weirdText, "brightness2", 0).onChange(update("brightness2"));
gui.add(weirdText, "saturation2", 0).onChange(update("saturation2"));
gui.add(weirdText, "invert2", 0).onChange(update("invert2"));
gui.add(weirdText, "contrast2", 0).onChange(update("contrast2"));
gui.add(weirdText, "hueRotate2", 0).onChange(update("hueRotate2"));

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
    weirdText.reset({});
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
      : Math.max(1 / progress * (weirdText.degradation / 100), 0);
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
  } else if (weirdText.shouldFlame) {
    const scaleFactorY = 1.2;
    const deltaY = (canvas.height - canvas.height * scaleFactorY) / 2;
    ctx.setTransform(
      1.0,
      Math.sin(timestamp / 1000) / 100,
      0,
      scaleFactorY,
      0,
      deltaY
    );
  }
  ctx.drawImage(img, 0, 0);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (weirdText.shouldRedrawText) {
    weirdText.drawBackground({
      isRefilling: true
    });
    weirdText.drawText();
  }

  ctx.filter = `brightness(${weirdText.brightness}%) saturate(${
    weirdText.saturation
  }%) invert(${weirdText.invert}%) contrast(${
    weirdText.contrast
  }%) hue-rotate(${weirdText.hueRotate}deg)`;

  const url = canvas.toDataURL("image/jpeg", quality);
  img.src = url;

  ctx2.filter = `brightness(${weirdText.brightness2}%) saturate(${
    weirdText.saturation2
  }%) invert(${weirdText.invert2}%) contrast(${
    weirdText.contrast2
  }%) hue-rotate(${weirdText.hueRotate2}deg)`;
  ctx2.drawImage(canvas, 0, 0);

  if (isRecording && gif) {
    gif.addFrame(ctx2, { copy: true, delay: 50 });
    recordedFrames++;
    document.getElementById("recorded-frames").innerText = recordedFrames;
  }

  if (weirdText.isRunning) {
    window.requestAnimationFrame(degradeStep);
  }
}
weirdText.reset();
window.requestAnimationFrame(degradeStep);

imageUploadButton.addEventListener("change", e => {
  const files = e.target.files;
  if (files && files[0]) {
    imageUpload.src = URL.createObjectURL(files[0]); // set src to file url
    imageUpload.onload = () => {
      weirdText.reset();
    };
  }
});
clearImageUploadButton.addEventListener("click", e => {
  imageUpload.src = "";
  weirdText.reset();
});
settingsUploadButton.addEventListener("change", e => {
  const files = e.target.files;
  if (files && files[0]) {
    const reader = new FileReader();
    reader.onload = () => {
      const savedSettings = JSON.parse(reader.result);
      weirdText.reset(savedSettings);
    };
    reader.readAsText(files[0]);
  }
});

templateSelect.addEventListener("change", e => {
  const templateKey = e.target.value;
  const template = templates[templateKey];
  Object.assign(weirdText, template);
  for (var i in gui.__controllers) {
    gui.__controllers[i].updateDisplay();
  }
  weirdText.reset();
});

// https://stackoverflow.com/a/15832662
downloadButton.addEventListener("click", () => {
  const dataUrl = canvas2.toDataURL("image/jpeg", 1);
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = "degraded-text.jpeg";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});
