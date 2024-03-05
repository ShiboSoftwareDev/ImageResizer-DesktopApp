const path = require("path");
const fs = require("fs");
const os = require("os");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const resizeImg = require("resize-img");

const isMac = process.platform === "darwin";
const isDev = process.env.NODE_ENV !== "production";
let mainWindow;

async function handleOsHomedir() {
  return os.homedir();
}

async function handlePathJoin(event, value) {
  const newVal = JSON.parse([value]);
  return path.join(...newVal);
}

async function resizeImage({ imgPath, width, height, dest }) {
  try {
    const newImg = await resizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height,
    });

    const filename = path.basename(imgPath);

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    fs.writeFileSync(path.join(dest, filename), newImg);

    mainWindow.webContents.send("imgApi-done");

    shell.openPath(dest);
  } catch (error) {
    console.log(error);
  }
}

ipcMain.handle("os-homedir", handleOsHomedir);
ipcMain.handle("path-join", handlePathJoin);

ipcMain.on("imgApi-resize", (e, options) => {
  options.dest = path.join(os.homedir(), "Image Resizer");
  resizeImage(options);
});

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: isDev ? 1000 : 500,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));

  const mainMenu = Menu.buildFromTemplate(menu);
  mainWindow.setMenu(mainMenu);
  if (isDev) mainWindow.webContents.openDevTools();
}

function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    title: "Image Resizer",
    width: 300,
    height: 300,
  });

  aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
  aboutWindow.setMenu(null);
}

app.whenReady().then(() => {
  createMainWindow();

  mainWindow.on("closed", () => (mainWindow = null));

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  {
    role: "fileMenu",
  },
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
];

app.on("window-all-closed", () => {
  if (!isMac) app.quit();
});
