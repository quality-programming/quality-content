'use strict';

import 'toastify-js/src/toastify.css';
import '../assets/styles/renderer.scss';

import Toastify from 'toastify-js';


const FADE_DURATION_SHORT = 200;
const FADE_DURATION_LONG = 500;
const NOTIFICATION_DURATION = 5000;
const ABORT_NOTIFICATION_DELAY = 10000;

const welcomePage = document.getElementById('welcome-page');
const welcomePageSplash = document.getElementById('welcome-page-splash');
const continueButton = document.getElementById('continue');
const quitButton = document.getElementById('quit');

const aboutPage = document.getElementById('about-page');
const aboutShowButton = document.getElementById('about-show');
const aboutHideButton = document.getElementById('about-hide');
const versionText = document.getElementById('version');

const placeholderText = document.getElementById('placeholder-text');
const imageWrapper = document.getElementById('image-wrapper');
const loadingOverlay = document.getElementById('loading-overlay');

const menu = document.getElementById('menu');
const menuToggleButton = document.getElementById('menu-toggle');

const nekoEntry = document.getElementById('neko-entry');
const nsfwEntry = document.getElementById('nsfw-entry');

const generateImageButton = document.getElementById('generate-image');
const imageSourceButton = document.getElementById('image-source');
const saveImageButton = document.getElementById('save-image');

let initialized = false;

let nekoMode = false;
let nsfwMode = false;
let imageSourceUrl;


// Menu

function enableGenerateImageButton() {
    generateImageButton.disabled = false;
}

function disableGenerateImageButton() {
    generateImageButton.disabled = true;
}

function enableImageSourceButton() {
    if (imageSourceUrl) {
        imageSourceButton.disabled = false;
    }
}

function disableImageSourceButton() {
    imageSourceButton.disabled = true;
}

function setImageSourceUrl(url) {
    if (url) {
        imageSourceUrl = url;
        enableImageSourceButton();
    } else {
        imageSourceUrl = null;
        disableImageSourceButton();
    }
}

function enableSaveImageButton() {
    saveImageButton.disabled = false;
}

function disableSaveImageButton() {
    saveImageButton.disabled = true;
}

function enableControls() {
    enableGenerateImageButton();
    enableImageSourceButton();
    if (initialized) {
        enableSaveImageButton();
    }
}

function disableControls() {
    disableGenerateImageButton();
    disableImageSourceButton();
    disableSaveImageButton();
}


// Image

function setLoading() {
    if (!initialized) {
        fadeOut(placeholderText, FADE_DURATION_SHORT);
    }
    loadingOverlay.classList.remove('hidden');
    fadeIn(loadingOverlay, FADE_DURATION_SHORT, false);
    disableControls();
}

function setNotLoading() {
    if (!initialized) {
        fadeIn(placeholderText, FADE_DURATION_SHORT);
    }
    fadeOut(loadingOverlay, FADE_DURATION_SHORT, false, () => loadingOverlay.classList.add('hidden'));
    enableControls();
}

function displayImage(src, success, error) {
    const lastImage = imageWrapper.lastElementChild;

    const image = new Image();
    image.src = src;

    image.addEventListener(
        'load',
        () => {
            imageWrapper.appendChild(image);
            fadeImage(image, FADE_DURATION_LONG, () => {
                if (success && success instanceof Function) {
                    success();
                }
            });
            if (lastImage) {
                fadeOut(lastImage, FADE_DURATION_LONG, false, () => {
                    URL.revokeObjectURL(lastImage.src);
                    lastImage.remove();
                });
            }
        },
        { once: true }
    );

    image.addEventListener(
        'error',
        () => {
            URL.revokeObjectURL(image.src);
            image.remove();

            if (lastImage) {
                fadeOut(lastImage, FADE_DURATION_LONG, false, () => {
                    URL.revokeObjectURL(lastImage.src);
                    lastImage.remove();
                });
            }

            if (error && error instanceof Function) {
                error();
            }
        },
        { once: true }
    );
}

function requestImage() {
    setLoading();
    scheduleAbortNotification();

    api.requestImage(nekoMode, nsfwMode).then((result) => {
        if (result.cancelled) {
            return;
        }

        if (result.error) {
            console.error(`Image fetch error: ${result.error}`);
            setNotLoading();
            clearAbortNotification();
            notification(`Error: ${result.error}`);
            return;
        }

        const blob = new Blob([result.imageBuffer], { type: result.imageType });
        const blobUrl = URL.createObjectURL(blob);
        displayImage(
            blobUrl,
            () => {
                // Success
                initialized = true;
                setNotLoading();
                setImageSourceUrl(result.imageSourceUrl);
                clearAbortNotification();
            },
            () => {
                // Error
                console.error('Image element loading error');
                initialized = false;
                setNotLoading();
                clearAbortNotification();
                notification('Image element loading error');
            }
        );
    });
}

function cancelImageRequest(callback) {
    api.cancelImageRequest().then(() => {
        if (callback && callback instanceof Function) {
            callback();
        }
    });
}

function saveImage() {
    disableControls();
    api.saveImage().then((result) => {
        if (result.error && !result.cancelled) {
            console.error(`Image save error: ${result.error}`);
            notification(`Error: ${result.error}`);
        }
        enableControls();
    });
}

// Utils

function animate(element, keyframes, options, callback) {
    const animation = element.animate(keyframes, options);
    animation.addEventListener('finish', (event) => callback(event), { once: true });
}

function fadeIn(element, duration, transparentAnimation = true, callback) {
    element.style.cssText = null;

    if (!transparentAnimation) {
        element.classList.remove('transparent');
    }

    element.getAnimations()
        .filter((animation) => animation.id === 'fade')
        .forEach((animation) => animation.cancel());

    animate(
        element,
        [{opacity: 0}, {opacity: 1}],
        {
            id: 'fade',
            duration: duration,
            easing: 'ease',
            fill: 'forwards'
        },
        (event) => {
            element.style.cssText = 'opacity: 1 !important';

            if (transparentAnimation) {
                element.classList.remove('transparent');
            }

            if (callback && typeof callback === 'function') {
                callback(event);
            }
        }
    );
}

function fadeOut(element, duration, transparentAnimation = true, callback) {
    element.style.cssText = null;

    if (transparentAnimation) {
        element.classList.add('transparent');
    }

    element.getAnimations()
        .filter((animation) => animation.id === 'fade')
        .forEach((animation) => animation.cancel());

    animate(
        element,
        [{opacity: 1}, {opacity: 0}],
        {
            id: 'fade',
            duration: duration,
            easing: 'ease',
            fill: 'forwards'
        },
        (event) => {
            element.style.cssText = 'opacity: 0 !important';

            if (!transparentAnimation) {
                element.classList.add('transparent');
            }

            if (callback && typeof callback === 'function') {
                callback(event);
            }
        }
    );
}

function fadeImage(element, duration, callback) {
    element.getAnimations()
        .filter((animation) => animation.id === 'fade-image')
        .forEach((animation) => animation.cancel());

    animate(
        element,
        [
            { opacity: 0, transform: 'scale(1.1)' },
            { opacity: 1, transform: 'scale(1)' }
        ],
        {
            id: 'fade-image',
            duration: duration,
            easing: 'ease',
            fill: 'forwards'
        },
        (event) => {
            element.style.cssText = 'opacity: 1 !important; transform: scale(1) !important;';

            if (callback && callback instanceof Function) {
                callback(event);
            }
        }
    );
}

function fadeSplash(element, duration, callback) {
    element.getAnimations()
        .filter((animation) => animation.id === 'fade-splash')
        .forEach((animation) => animation.cancel());

    animate(
        element,
        [
            { opacity: 0, transform: 'scale(1.5)' },
            { opacity: 1, transform: 'scale(1)' }
        ],
        {
            id: 'fade-splash',
            duration: duration,
            easing: 'ease',
            fill: 'forwards'
        },
        (event) => {
            if (callback && callback instanceof Function) {
                callback(event);
            }
        }
    );
}

function notification(message, persistent = false, callback) {
    const toast = Toastify({
        text: message,
        duration: persistent ? -1 : NOTIFICATION_DURATION,
        close: persistent ? false : true,
        position: 'left',
        onClick: callback,
        stopOnFocus: true
    });
    toast.showToast();
    return toast;
}

let _abortNotificationTimeout;
let _abortNotification;
function showAbortNotification() {
    _abortNotification = notification(
        'Large images might take a while to download. Click here if you want to abort.',
        true,
        () => {
            cancelImageRequest(setNotLoading);
            clearAbortNotification();
        }
    );
}

function clearAbortNotification() {
    clearTimeout(_abortNotificationTimeout);
    if (_abortNotification) {
        _abortNotification.hideToast();
    }
}

function scheduleAbortNotification() {
    _abortNotificationTimeout = setTimeout(showAbortNotification, ABORT_NOTIFICATION_DELAY);
}


// Listeners

// Welcome page

continueButton.addEventListener(
    'click',
    () => fadeOut(welcomePageSplash, 1000, false, () => {
        fadeOut(welcomePage, FADE_DURATION_LONG, false, () => {
            welcomePage.classList.add('hidden');
        });
    }),
    { once: true }
);

quitButton.addEventListener('click', api.quit, { once: true });


// About page

aboutHideButton.addEventListener('click', () => {
    fadeOut(aboutPage, FADE_DURATION_LONG, false, () => aboutPage.classList.add('hidden'));
});


// Menu

menuToggleButton.addEventListener('click', () => menu.classList.toggle('folded'));

aboutShowButton.addEventListener('click', () => {
    aboutPage.classList.remove('hidden');
    fadeIn(aboutPage, FADE_DURATION_LONG, false);
});

nekoEntry.addEventListener('click', () => {
    nekoMode = !nekoMode;
    nekoEntry.classList.toggle('checked');
});

nsfwEntry.addEventListener('click', () => {
    nsfwMode = !nsfwMode;
    nsfwEntry.classList.toggle('checked');
});

generateImageButton.addEventListener('click', () => {
    requestImage();
});

imageSourceButton.addEventListener('click', () => api.openUrl(imageSourceUrl));

saveImageButton.addEventListener('click', saveImage);


// On load

window.addEventListener('load', () => {
    // Handle external links
    Array.from(document.getElementsByTagName('a'))
        .filter((anchor) => anchor.href)
        .forEach((anchor) => {
            function _handler(event) {
                event.preventDefault();
                api.openUrl(anchor.href);
            }
            anchor.addEventListener('click', _handler);
            anchor.addEventListener('auxclick', _handler);
        });

    // About page version text
    api.getVersion().then((version) => versionText.textContent = `v${version}`);

    // Welcome page splash animation
    fadeSplash(welcomePageSplash, 1000);
});
