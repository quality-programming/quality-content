'use strict';

import '../assets/styles/player.scss';
import DeezNutsVideo from '../assets/media/deez-nuts.webm';


window.addEventListener('load', () => {
    const video = document.createElement('video');
    video.src = DeezNutsVideo;
    document.getElementById('app').appendChild(video);

    api.onPlay((event, mainPlayer) => {
        video.addEventListener('ended', () => {
            if (mainPlayer) {
                api.playbackEnd();
            }
        });
        video.addEventListener('error', () => {
            if (mainPlayer) {
                api.playbackEnd();
            }
        });

        video.muted = !mainPlayer;
        video.play().catch(() => {
            if (mainPlayer) {
                api.playbackEnd();
            }
        });
    });
});
