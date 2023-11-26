'use strict';

const { app, BrowserWindow, dialog, ipcMain, Menu, nativeImage, shell } = require('electron');
const filenamify = require('filenamify').default;
const { got, TimeoutError, HTTPError, CancelError } = require('got');
const path = require('path');
const fs = require('fs');

import AppIcon from '../assets/img/icon.png';


const DEV = process.env.NODE_ENV === 'development';

const API_REGULAR_SFW = 'https://api.waifu.im/search?is_nsfw=false&gif=false';
const API_REGULAR_NSFW = 'https://api.waifu.im/search?is_nsfw=true&gif=false';
const API_NEKO_SFW = 'https://api.waifu.pics/sfw/neko';
const API_NEKO_NSFW = 'https://api.waifu.pics/nsfw/neko';
const API_REQUEST_TIMEOUT = 30000;
const IMAGE_REQUEST_TIMEOUT = 300000;
const REQUEST_OPTIONS = {
    retry: { limit: 0 }
};
const API_REQUEST_OPTIONS = {
    ...REQUEST_OPTIONS,
    timeout: { request: API_REQUEST_TIMEOUT }
};
const IMAGE_REQUEST_OPTIONS = {
    ...REQUEST_OPTIONS,
    timeout: { request: IMAGE_REQUEST_TIMEOUT },
    responseType: 'buffer'
};

let apiPromise;
let imagePromise;
let cachedImageFilename;
let cachedImageBuffer;


// Initialization

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 900,
        height: 600,
        useContentSize: true,
        autoHideMenuBar: true,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    if (process.platform === 'linux') {
        const icon = nativeImage.createFromPath(path.join(__dirname, AppIcon));
        mainWindow.setIcon(icon);
    }

    if (DEV) {
        mainWindow.loadURL('http://localhost:8080');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, 'index.html'));
        const menu = Menu.buildFromTemplate([
            {
                label: 'App',
                submenu: [{ role: 'quit' }]
            },
            {
                label: 'Edit',
                submenu: [
                    { role: 'undo' },
                    { role: 'redo' },
                    { type: 'separator' },
                    { role: 'cut' },
                    { role: 'copy' },
                    { role: 'paste' },
                    { type: 'separator' },
                    { role: 'selectAll' }
                ]
            },
            {
                label: 'Debug',
                submenu: [{ role: 'toggledevtools' }]
            }
        ]);
        mainWindow.setMenu(menu);
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


// IPC listeners

ipcMain.handle('get-version', (event) => app.getVersion());

ipcMain.on('quit', (event) => app.quit());

ipcMain.handle('request-image', async (event, neko, nsfw) => {
    let apiUrl;
    if (neko) {
        apiUrl = nsfw ? API_NEKO_NSFW : API_NEKO_SFW;
    } else {
        apiUrl = nsfw ? API_REGULAR_NSFW : API_REGULAR_SFW;
    }

    let result = {
        imageBuffer: null,
        imageType: null,
        imageSourceUrl: null,
        error: null,
        cancelled: false
    };

    console.log(`Requesting image from API '${apiUrl}', neko: ${neko}, nsfw: ${nsfw}`);
    const apiResponsePromise = got.get(apiUrl, API_REQUEST_OPTIONS)
        .then((response) => {
            try {
                const jsonData = JSON.parse(response.body);
                if (neko) {
                    return {
                        imageUrl: new URL(jsonData.url),
                        imageSourceUrl: null
                    };
                } else {
                    return {
                        imageUrl: new URL(jsonData.images[0].url),
                        imageSourceUrl: jsonData.images[0].source ? new URL(jsonData.images[0].source) : null
                    };
                }
            } catch (error) {
                console.error(`Invalid API response: ${error}`);
                result.error = `Invalid API response: ${error}`;
            }
        })
        .catch((error) => {
            console.error(`API request error: ${error}`);
            if (error instanceof CancelError) {
                result.error = 'Image request cancelled';
                result.cancelled = true;
            } else if (error instanceof TimeoutError) {
                result.error = 'API request timeout';
            } else if (error instanceof HTTPError) {
                result.error = `API HTTP error: ${error.message}`;
            } else {
                result.error = error.toString();
            }
        });
    apiPromise = apiResponsePromise;
    const apiResponse = await apiResponsePromise;

    if (result.error || result.cancelled) {
        return result;
    }

    console.log(`Fetching image '${apiResponse.imageUrl.href}'`);
    const imageResponsePromise = got.get(apiResponse.imageUrl.href, IMAGE_REQUEST_OPTIONS)
        .then((response) => {
            if (!response.headers['content-type']) {
                result.error = 'Unknown image type';
                return;
            }
            if (response.body.length === 0) {
                result.error = 'Image data buffer length is 0';
                return;
            }
            return {
                imageBuffer: response.body,
                imageType: response.headers['content-type']
            };
        })
        .catch((error) => {
            console.error(`Image request error: ${error}`);
            if (error instanceof CancelError) {
                result.error = 'Image request cancelled';
                result.cancelled = true;
            } else if (error instanceof TimeoutError) {
                result.error = 'Image request timeout';
            } else if (error instanceof HTTPError) {
                result.error = `Image request HTTP error: ${error.message}`;
            } else {
                result.error = error.toString();
            }
        });
    imagePromise = imageResponsePromise;
    const imageResponse = await imageResponsePromise;

    if (result.error || result.cancelled) {
        return result;
    }

    const imageFilename = filenamify(apiResponse.imageUrl.pathname.slice(1), { replacement: '_' });
    console.log(`Fetched image '${imageFilename}', size: ${imageResponse.imageBuffer.length}`);

    cachedImageFilename = imageFilename;
    cachedImageBuffer = imageResponse.imageBuffer;

    result.imageBuffer = imageResponse.imageBuffer;
    result.imageType = imageResponse.imageType;
    result.imageSourceUrl = apiResponse.imageSourceUrl?.href;
    return result;
});

ipcMain.handle('cancel-image-request', (event) => {
    console.log('Cancelling image request');
    apiPromise?.cancel();
    imagePromise?.cancel();
    cachedImageFilename = null;
    cachedImageBuffer = null;
});

ipcMain.handle('save-image', (event) => {
    if (!cachedImageFilename || !cachedImageBuffer) {
        console.error('Cannot save non-fetched image');
        return {
            error: 'Cannot save non-fetched image',
            cancelled: false
        }
    }

    const window = BrowserWindow.fromWebContents(event.sender);
    const fileExtension = cachedImageFilename.split('.').pop();
    const result = dialog.showSaveDialogSync(window, {
        defaultPath: cachedImageFilename,
        filters: [{ name: cachedImageFilename, extensions: [fileExtension] }]
    });

    if (!result) {
        return {
            error: null,
            cancelled: true
        };
    }

    console.log(`Saving image '${result}'`);
    try {
        fs.writeFileSync(result, cachedImageBuffer);
    } catch (error) {
        return {
            error: error.toString(),
            cancelled: false
        };
    }

    return {
        cancelled: false,
        error: null
    };
});

ipcMain.on('open-url', (event, url) => shell.openExternal(url));
