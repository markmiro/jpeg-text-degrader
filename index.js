var start;
var animation = null;
function drawText(
  text,
  quality,
  background,
  foreground,
  inputX = 0,
  inputY = 0,
  brightness
) {
  const testFontSize = 20;
  const baseQuality = quality;
  const fontFamily = "sans-serif";

  function getTargetSize(canvas, ctx, lines) {
    ctx.font = `${testFontSize}px ${fontFamily}`;
    function getSize(text) {
      const measurements = ctx.measureText(text);
      const targetSizeBasedOnWidth =
        testFontSize / measurements.width * canvas.width;
      const targetSize = Math.min(targetSizeBasedOnWidth, canvas.height);
      // console.log(text, targetSize);
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

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  // Filters
  ctx.filter = `brightness(${brightness})`;

  // Background
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw text
  ctx.fillStyle = foreground;
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  const lines = text.split("\n");
  const targetSize = getTargetSize(canvas, ctx, lines) * 0.75;
  ctx.font = `${targetSize}px ${fontFamily}`;
  const yOffsetForCentering = canvas.height / 2 - lines.length * targetSize / 2;
  lines.forEach((line, i) => {
    const yBasedOnLine = targetSize * i;
    const x = canvas.width / 2 + inputX;
    const y = yBasedOnLine + yOffsetForCentering + inputY;
    ctx.fillText(line, x, y);
  });

  // Convert text to JPEG
  const proportionalQuality = Math.max(
    1 - targetSize / baseQuality / 1000,
    0.1
  );
  const url = canvas.toDataURL("image/jpeg", proportionalQuality);
  document.getElementById("jpeg-text").src = url;
  start = 0;
}

const WeirdText = function() {
  this.quality = 0.1;
  this.background = "#ffffff";
  this.foreground = "#0000ff";
  this.enableDegrading = false;
  this.brightness = 1;
  this.render = obj => {
    Object.assign(this, obj);
    drawText(
      document.getElementById("input").value,
      this.quality,
      this.background,
      this.foreground,
      0,
      0,
      this.brightness
    );
  };
  this.render({});
};

const weirdText = new WeirdText();
const gui = new dat.GUI();
gui
  .addColor(weirdText, "background")
  .onChange(v => weirdText.render({ background: v }));
gui
  .addColor(weirdText, "foreground")
  .onChange(v => weirdText.render({ foreground: v }));
gui.add(weirdText, "quality").onChange(v => weirdText.render({ quality: v }));
gui.add(weirdText, "enableDegrading").onChange(v => {
  weirdText.enableDegrading = v;
  if (v) {
    window.requestAnimationFrame(step);
  }
});
gui
  .add(weirdText, "brightness", 0, 30)
  .onChange(v => weirdText.render({ brightness: v }));

document.getElementById("input").addEventListener("keydown", e => {
  e.stopPropagation();
});
document.getElementById("input").addEventListener("input", e => {
  const message = e.target.value;
  drawText(
    message,
    weirdText.quality,
    weirdText.background,
    weirdText.foreground
  );
});

function degrade(quality) {
  const img = document.getElementById("jpeg-text");
  const canvas = document.getElementById("canvas").cloneNode();
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0); // Or at whatever offset you like

  const url = canvas.toDataURL("image/jpeg", quality);
  document.getElementById("jpeg-text").src = url;
}

function step(timestamp) {
  if (!start) start = timestamp;
  var progress = timestamp - start;
  if (!weirdText.enableDegrading) return;
  setTimeout(() => {
    degrade(1 / (progress / 500));
    window.requestAnimationFrame(step);
  }, 100);
}
