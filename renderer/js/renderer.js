const form = document.querySelector("#img-form");
const img = document.querySelector("#img");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");
const heightInput = document.querySelector("#height");
const widthInput = document.querySelector("#width");
const message = document.querySelector("#message");

async function loadImage(e) {
  const file = e.target.files[0];

  if (!isFileImage(file)) {
    alertError("Please Select an Image");
    return;
  }

  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  };

  form.style.display = "block";
  filename.innerText = file.name;
  outputPath.innerText = await window.path.join(
    JSON.stringify([await window.os.homedir(), "imageresizer"])
  );
}

imgApi.on("imgApi-done", () => {
  alertSuccess("Image resized successfully!");
});

function sendImage(e) {
  e.preventDefault();

  const width = widthInput.value;
  const height = heightInput.value;
  const imgPath = img.files[0].path;

  if (!img.files[0]) {
    alertError("Please upload an image");
    return;
  }

  if (width === "" || height === "") {
    alertError("Please fill in height and width");
    return;
  }

  imgApi.resize("imgApi-resize", {
    width,
    height,
    imgPath,
  });
}

function isFileImage(file) {
  const acceptedImageTypes = ["image/gif", "image/png", "image/jpeg"];
  return file && acceptedImageTypes.includes(file["type"]);
}

let sent = false;

function alertError(alert) {
  // need some work

  message.style.background = "red";
  message.style.display = "block";
  message.textContent = alert;

  if (sent !== true) {
    sent = true;
    setTimeout(() => {
      message.style.display = "none";
      sent = false;
    }, 3000);
  }
}

function alertSuccess(alert) {
  // need some work

  message.style.background = "green";
  message.style.display = "block";
  message.textContent = alert;

  if (sent !== true) {
    sent = true;
    setTimeout(() => {
      message.style.display = "none";
      sent = false;
    }, 3000);
  }
}

img.addEventListener("change", loadImage);
form.addEventListener("submit", sendImage);
