'use strict';

import '../assets/styles/renderer.scss';

import VineBoom from '../assets/media/vine-boom.ogg';


const ANIMATION_DURATION = 500;
const INFO_OVERLAY_SHOW_DELAY = 200;

const AWARD_NAMES = [
    'Best Indie Game',
    'Best Action Game',
    'Best Racing Game',
    'Best Role Playing Game',
    'Deez Nuts'
];

const welcomePage = document.getElementById('welcome-page');
const imageBackground = document.getElementById('image-background');
const continueButton = document.getElementById('continue');

const imageWrapper = document.getElementById('image-wrapper');
const infoOverlay = document.getElementById('info-overlay');
const infoAwardName = document.getElementById('award-name');
const nextButton = document.getElementById('next');

const vineBoom = new Audio(VineBoom);


let currentAward = 0;
let lastAward = 5;

// Main page

function showNextAward() {
    currentAward++;
    const isLastAward = currentAward >= lastAward - 1;

    if (isLastAward) {
        fadeOut(nextButton, ANIMATION_DURATION, true, () => nextButton.classList.add('hidden'));
    }

    hideInfoOverlay(() => {
        infoAwardName.textContent = AWARD_NAMES[currentAward];

        const translation = currentAward * 100;
        imageWrapper.style.transform = `translateY(-${translation}%)`;

        setTimeout(() => {
            showInfoOverlay(() => {
                if (!isLastAward) {
                    nextButton.addEventListener('click', showNextAward, { once: true });
                }
            });

            if (isLastAward) {
                deezNuts();
            }
        }, INFO_OVERLAY_SHOW_DELAY);
    });
}

function showInfoOverlay(callback) {
    infoOverlay.style.cssText = null;

    animate(
        infoOverlay,
        [{ transform: 'translateX(-100%)' }, { transform: 'translateX(0)' }],
        {
            id: 'info-overlay-slide',
            duration: ANIMATION_DURATION,
            easing: 'ease'
        },
        (event) => {
            if (callback && callback instanceof Function) {
                callback(event);
            }
        }
    );
}

function hideInfoOverlay(callback) {
    animate(
        infoOverlay,
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-100%)' }],
        {
            id: 'info-overlay-slide',
            duration: ANIMATION_DURATION,
            easing: 'ease'
        },
        (event) => {
            infoOverlay.style.cssText = 'transform: translateX(-100%) !important';

            if (callback && callback instanceof Function) {
                callback(event);
            }
        }
    );
}


// Utils

function animate(element, keyframes, options, callback) {
    const animation = element.animate(keyframes, options);
    animation.addEventListener('finish', (event) => callback(event), { once: true });
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
        [{ opacity: 1 }, { opacity: 0 }],
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

            if (callback && callback instanceof Function) {
                callback(event);
            }
        }
    );
}

function fadeBlur(element, duration, callback) {
    element.getAnimations()
        .filter((animation) => animation.id === 'fade-blur')
        .forEach((animation) => animation.cancel());

    animate(
        element,
        [{ filter: 'blur(0)' }, { filter: 'blur(50px)' }],
        {
            id: 'fade-blur',
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

function deezNuts() {
    api.invincibleMainWindow();
    vineBoom.addEventListener('ended', api.playVideo);
    vineBoom.addEventListener('error', api.playVideo);
    vineBoom.play().catch(api.playVideo);
}


// Listeners

// Welcome page

continueButton.addEventListener(
    'click',
    () => {
        fadeBlur(imageBackground, 1000);
        setTimeout(
            () => {
                fadeOut(welcomePage, 1000, false, () => {
                    welcomePage.classList.add('hidden');
                });
            },
            500
        );
    },
    { once: true }
);


// Main page

nextButton.addEventListener('click', showNextAward, { once: true });


// Loaded

window.addEventListener('load', () => {
    infoAwardName.textContent = AWARD_NAMES[0];
});
