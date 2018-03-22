let start;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const WeirdText = function() {
  this.quality = 1;
  this.background = "#ffffff";
  this.foreground = "#00ff0a";
  this.fontSize = 100;
  this.enableDegrading = true;
  this.degradeRate = 500;
  this.brightness = 84;
  this.saturation = 188;
  this.contrast = 138;
  this.invert = 6;
  this.hueRotate = 30;
  this.xOffset = 0;
  this.yOffset = 0;

  // Not for dat.gui:
  this.message = "Hello";

  this.drawBackground = function() {
    ctx.fillStyle = this.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
    // if (
    //   !this.enableDegrading ||
    //   obj.message ||
    //   obj.fontSize ||
    //   obj.foreground ||
    //   obj.background
    // ) {

    // }
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
gui.add(weirdText, "enableDegrading").onChange(v => {
  weirdText.enableDegrading = v;
});
gui
  .add(weirdText, "degradeRate", 0, 1000, 10)
  .onChange(v => weirdText.render({ degradeRate: v }));
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
  // weirdText.drawBackground();
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
  const secondsDuration = 10;
  if (!start) start = timestamp;
  const progress = (timestamp - start) / (1000 * secondsDuration);
  if (weirdText.enableDegrading && progress <= 1) {
  }
  // const quality = progress * 0.2 + 0.8;
  // console.log(quality);
  const img = document.getElementById("jpeg-text");
  // ctx.filter = "none";
  // ctx.rotate(0.1);
  // ctx.globalCompositeOperation = "overlay";
  // ctx.setTransform(1.05, Math.sin(timestamp / 1000) / 20, 0, 1.05, -20, -10);
  ctx.drawImage(img, 0, 0);
  // ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = weirdText.background + "22";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // weirdText.drawBackground();
  // weirdText.xOffset = Math.cos(timestamp / 1000) * 50;
  // weirdText.yOffset = Math.sin(timestamp / 1000) * 50;
  // ctx.filter = `brightness(${weirdText.brightness}%) saturate(${
  //   weirdText.saturation
  // }%) invert(${weirdText.invert}%) contrast(${
  //   weirdText.contrast
  // }%) hue-rotate(${weirdText.hueRotate}deg)`;
  weirdText.drawText();
  // ctx.drawImage(img, 1, 0);

  const url = canvas.toDataURL("image/jpeg", 0.7);
  document.getElementById("jpeg-text").src = url;

  window.requestAnimationFrame(degradeStep);
}
window.requestAnimationFrame(degradeStep);

// document
// .querySelector('input[type="file"]')
// .addEventListener("change", () => {
//   if (this.files && this.files[0]) {
//     const img = document.querySelector("img"); // $('img')[0]
//     img.src = URL.createObjectURL(this.files[0]); // set src to file url
//     img.onload = imageIsLoaded; // optional onload event listener
//   }
// });
