'use strict';

import 'toastify-js/src/toastify.css';
import '../assets/styles/renderer.scss';

import Toastify from 'toastify-js';


const FADE_DURATION_SHORT = 200;
const FADE_DURATION_LONG = 500;
const NOTIFICATION_DURATION = 5000;
const ABORT_NOTIFICATION_DELAY = 10000;
const IMAGE_REQUEST_TIMEOUT = 30000;
const PARAMS_CHANGE_DELAY = 1000;

const welcomePage = document.getElementById('welcome-page');
const continueButton = document.getElementById('continue');
const quitButton = document.getElementById('quit');
const mainPage = document.getElementById('main-page');

const controls = document.getElementById('controls');
const controlsExpander = document.getElementById('controls-expander');
const seedInput = document.getElementById('seed');
const creativityInput = document.getElementById('creativity');
const creativityValue = document.getElementById('creativity-value');
const saveButton = document.getElementById('save');

const imagePlaceholder = document.getElementById('image-placeholder');
const imageWrapper = document.getElementById('image-wrapper');
const loadingOverlay = document.getElementById('loading-overlay');
const borderOverlay = document.getElementById('border-overlay');

let initialized = false;


// Controls overlay

function hasSeed() {
    return seedInput.value !== '';
}

function getImageParameters() {
    const fmtSeed = seedInput.value.padStart(5, '0');
    const fmtCreativity = Number(creativityInput.value).toFixed(1);

    return {
        seed: fmtSeed,
        creativity: fmtCreativity
    };
}

function setImageParams(seed, creativity) {
    const seedInt = Number(seed);
    const fmtCreativity = Number(creativity).toFixed(1);

    seedInput.value = seedInt;
    _seedInputLastValue = seedInt;
    creativityInput.value = fmtCreativity;
    creativityValue.textContent = fmtCreativity;
}

let _paramsChangeTimeout;
function onParamsChange() {
    if (!hasSeed()) {
        return;
    }

    clearParamsChangeTimeout();
    _paramsChangeTimeout = setTimeout(
        () => generateImage(false),
        PARAMS_CHANGE_DELAY
    );
}

function clearParamsChangeTimeout() {
    clearTimeout(_paramsChangeTimeout);
}

function enableSaveButton() {
    saveButton.disabled = false;
}

function disableSaveButton() {
    saveButton.disabled = true;
}

function enableControls() {
    seedInput.disabled = false;
    creativityInput.disabled = false;
    saveButton.disabled = false;
}

function disableControls() {
    seedInput.disabled = true;
    creativityInput.disabled = true;
    saveButton.disabled = true;
}


// Image

function setLoading() {
    if (!initialized) {
        fadeOut(imagePlaceholder, FADE_DURATION_SHORT);
    }
    fadeIn(loadingOverlay, FADE_DURATION_SHORT, false);
    disableSaveButton();
}

function setNotLoading() {
    if (!initialized) {
        fadeIn(imagePlaceholder, FADE_DURATION_SHORT);
        if (imageWrapper.lastElementChild) {
            fadeOut(borderOverlay, FADE_DURATION_SHORT);
        }
    }
    fadeOut(loadingOverlay, FADE_DURATION_SHORT, false);
    enableSaveButton();
}

function displayImage(src) {
    const lastImage = imageWrapper.lastElementChild;

    const image = new Image();
    image.src = src;
    imageWrapper.appendChild(image);

    fadeImage(
        image,
        FADE_DURATION_LONG,
        () => {
            if (lastImage) {
                URL.revokeObjectURL(lastImage.src);
                lastImage.remove();
            }
        }
    );
}

function generateImage(random = true) {
    disableControls();
    setLoading();
    scheduleAbortNotification();

    const params = getImageParameters();
    const seed = random ? getRandomSeed() : params.seed;
    const creativity = random ? '1.0' : params.creativity;

    const url = formatImageUrl(seed, creativity);
    const options = {
        timeout: { request: IMAGE_REQUEST_TIMEOUT },
        retry: { limit: 0 },
        responseType: 'buffer'
    };
    const filename = formatImageFilename(seed, creativity);

    api.requestImage(url, options, filename).then(async (result) => {
        if (result.cancelled) {
            console.log('Image request cancelled');
            return;
        }

        if (result.success) {
            const blob = new Blob([result.data], { type: 'image/png' });
            const blobUrl = URL.createObjectURL(blob);
            displayImage(blobUrl);
            setNotLoading();
            initialized = true;
        } else {
            console.error(`Image fetch error: ${result.message}`);
            setNotLoading();
            notification(result.message);
        }

        setImageParams(seed, creativity);
        enableControls();
        clearAbortNotification();
    });
}

function cancelImageGeneration(callback) {
    api.cancelImageRequest().then((success) => {
        if (callback && typeof callback === 'function') {
            callback();
        }
    });
}

function saveImage() {
    disableControls();
    api.saveImage().then((result) => {
        if (!result.cancelled && !result.success) {
            notification(`Error: ${result.error}`);
        }
        enableControls();
    });
}


// Utils

function getRandomSeed() {
    // Random number between 0 and 99,999
    const seed = Math.floor(Math.random() * 100000);
    const fmtSeed = seed.toString().padStart(5, '0');
    return fmtSeed;
}

function formatImageUrl(seed, creativity) {
    return `https://thisanimedoesnotexist.ai/results/psi-${creativity}/seed${seed}.png`;
}

function formatImageFilename(seed, creativity) {
    return `${seed}-${creativity}.png`;
}

function animate(element, keyframes, options, callback) {
    const animation = element.animate(keyframes, options);
    animation.addEventListener(
        'finish',
        (event) => callback(event),
        { once: true }
    );
}

function fadeIn(element, duration, transparent_animation = true, callback) {
    if (!transparent_animation) {
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
            if (transparent_animation) {
                element.classList.remove('transparent');
            }

            if (callback && typeof callback === 'function') {
                callback(event);
            }
        }
    );
}

function fadeOut(element, duration, transparent_animation = true, callback) {
    if (transparent_animation) {
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
            if (!transparent_animation) {
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
            {
                opacity: 0,
                transform: 'scale(1.1)'
            },
            {
                opacity: 1,
                transform: 'scale(1)'
            }
        ],
        {
            id: 'fade-image',
            duration: duration,
            easing: 'ease',
            fill: 'forwards'
        },
        (event) => {
            if (callback && typeof callback === 'function') {
                callback(event);
            }
        }
    );
}

function notification(message, persistent = false, callback) {
    const toast = Toastify({
        text: message,
        duration: persistent ? -1 : NOTIFICATION_DURATION,
        close: !persistent,
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
        'Looks like this is taking a while, abort?',
        -1,
        () => {
            cancelImageGeneration(() => {
                enableControls();
                setNotLoading();
            });
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
    () => fadeOut(
        welcomePage,
        FADE_DURATION_LONG,
        true,
        () => fadeIn(mainPage, FADE_DURATION_LONG)
    ),
    { once: true }
);

quitButton.addEventListener(
    'click',
    () => api.quit(),
    { once: true }
);

// Image

imageWrapper.addEventListener('click', () => {
    clearParamsChangeTimeout();
    generateImage();
});

// Controls overlay

controlsExpander.addEventListener('click', () => {
    controls.classList.toggle('expanded');
});

let _seedInputLastValue = 0;
seedInput.addEventListener('input', () => {
    const value = Math.floor(Number(seedInput.value));
    if (value >= 0 && value <= 99999) {
        _seedInputLastValue = value;
    }
    seedInput.value = _seedInputLastValue;

    onParamsChange();
});

creativityInput.addEventListener('input', () => {
    const value = Number(creativityInput.value).toFixed(1);
    creativityValue.textContent = value;

    onParamsChange();
});

saveButton.addEventListener('click', () => {
    clearParamsChangeTimeout();
    saveImage();
});
