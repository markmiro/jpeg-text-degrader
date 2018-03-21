let start;

const imageUploadButton = document.querySelector('input[type="file"]');
const imageUpload = document.getElementById("image-upload");
const clearImageUploadButton = document.getElementById("clear-file");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const WeirdText = function() {
  this.quality = 1;
  this.background = "#ff0000";
  this.foreground = "#ffffff";
  this.fontSize = 100;
  this.degradeDuration = 4;
  this.degradation = 1;
  this.brightness = 100;
  this.saturation = 100;
  this.contrast = 100;
  this.invert = 0;
  this.hueRotate = 0;
  this.xOffset = 0;
  this.yOffset = 0;

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
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    const lines = this.message.split("\n");
    const targetSize = Math.min(
      this.fontSize,
      getTargetSize(canvas, ctx, lines)
    );
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
    document.getElementById("jpeg-text").src = url;
  };

  this.render = obj => {
    Object.assign(this, obj);
    this.drawBackground();
    this.drawText();
    start = undefined;
  };
  this.drawBackground();
};

// ---

const weirdText = new WeirdText();
const gui = new dat.GUI();
gui
  .addColor(weirdText, "background")
  .onChange(v => weirdText.render({ background: v }));
gui
  .addColor(weirdText, "foreground")
  .onChange(v => weirdText.render({ foreground: v }));
gui
  .add(weirdText, "fontSize", 10, 200, 1)
  .onChange(v => weirdText.render({ fontSize: v }));
gui
  .add(weirdText, "quality", 0, 1, 0.01)
  .onChange(v => weirdText.render({ quality: v }));
gui
  .add(weirdText, "degradeDuration", 2, 100, 0.5)
  .onChange(v => weirdText.render({ degradeDuration: v }));
gui
  .add(weirdText, "degradation", 0, 1)
  .onChange(v => weirdText.render({ degradation: v }));
gui
  .add(weirdText, "brightness", 0, 200)
  .onChange(v => weirdText.render({ brightness: v }));
gui
  .add(weirdText, "saturation", 0, 200, 1)
  .onChange(v => weirdText.render({ saturation: v }));
gui
  .add(weirdText, "invert", 0, 100, 1)
  .onChange(v => weirdText.render({ invert: v }));
gui
  .add(weirdText, "contrast", 0, 400, 1)
  .onChange(v => weirdText.render({ contrast: v }));
gui
  .add(weirdText, "hueRotate", 0, 360, 1)
  .onChange(v => weirdText.render({ hueRotate: v }));

// Prevent pressing "h" hidding dat.gui
document.getElementById("input").addEventListener("keydown", e => {
  e.stopPropagation();
});
document.getElementById("input").addEventListener("input", e => {
  weirdText.message = e.target.value;
  weirdText.drawBackground();
  weirdText.drawText();
  start = undefined;
});

function cosUpDown(t) {
  return 1 - (Math.cos(Math.PI * 2 * t) / 2 + 0.5);
}

function sinEase(t) {
  return Math.sin(t * Math.PI / 2) * 0.5 + 0.5;
}

function degradeStep(timestamp) {
  if (!start) start = timestamp;
  const progress = (timestamp - start) / (1000 * weirdText.degradeDuration);
  const quality = Math.max(1 - progress * weirdText.degradation, 0.1);
  // console.log(quality);
  const img = document.getElementById("jpeg-text");
  // ctx.filter = "none";
  // ctx.rotate(0.1);
  // ctx.globalCompositeOperation = "overlay";
  // ctx.setTransform(1.05, Math.sin(timestamp / 1000) / 250, 0, 1.05, -20, -10);
  ctx.drawImage(img, 0, 0);
  // ctx.setTransform(1, 0, 0, 1, 0, 0);
  // ctx.fillStyle = weirdText.background + "05";
  // ctx.fillRect(0, 0, canvas.width, canvas.height);
  // weirdText.drawBackground();
  // weirdText.xOffset = Math.cos(timestamp / 2000) * 30;
  // weirdText.yOffset = Math.sin(timestamp / 2000) * 20;
  // ctx.filter = `brightness(${weirdText.brightness}%) saturate(${
  //   weirdText.saturation
  // }%) invert(${weirdText.invert}%) contrast(${
  //   weirdText.contrast
  // }%) hue-rotate(${weirdText.hueRotate}deg)`;
  weirdText.drawText();

  const url = canvas.toDataURL("image/jpeg", quality);
  document.getElementById("jpeg-text").src = url;
  ctx.drawImage(img, 0, 0);

  window.requestAnimationFrame(degradeStep);
}
window.requestAnimationFrame(degradeStep);

imageUploadButton.addEventListener("change", e => {
  const files = e.target.files;
  if (files && files[0]) {
    imageUpload.src = URL.createObjectURL(files[0]); // set src to file url
    imageUpload.onload = () => {
      // canvas.setAttribute("width", imageUpload.naturalWidth);
      // canvas.setAttribute("height", imageUpload.naturalHeight);
      weirdText.render();
    };
  }
});
clearImageUploadButton.addEventListener("click", e => {
  imageUpload.src = "";
  weirdText.render();
});
