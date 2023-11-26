'use strict';

import '../assets/styles/player.scss';
import FrrrrrrVideo from '../assets/media/frrrrrr.webm';


window.addEventListener('load', () => {
    document.addEventListener('keydown', (event) => {
        if (event.key == 'Escape') {
            api.playbackEnd();
        }
    });

    const video = document.createElement('video');
    video.src = FrrrrrrVideo;
    video.loop = true;
    document.getElementById('app').appendChild(video);

    api.onPlay((event, mainPlayer) => {
        if (mainPlayer) {
            video.addEventListener('ended', () => api.playbackEnd());
            video.addEventListener('error', () => api.playbackEnd());
        }

        video.muted = !mainPlayer;
        video.play().catch(() => {
            if (mainPlayer) {
                api.playbackEnd();
            }
        });
    });
});
