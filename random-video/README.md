## Info

- Project name: Random Video
- Created: 2020-04-25
- Language: Python
- Platform: Windows (x86-64)
- Author: [alexitx][alexitx]


## Description

> [!WARNING]
> 🔊 Contains loud audio

Video player that randomly loads a video from a pre-defined set and prevents closing until a configurable amount of time
has passed.


## Credits

- [Galena & Fiki - Lamborghini][lamborghini]
- [Vanya & Medi - Paranoya][paranoya]
- [Azis - Sagapo][sagapo]


## Building

Requirements:
- [Python][python-download] 3.11 with tkinter
- [libVLC][vlc-download] 3.0.18
- [Git Bash][git-bash-download]

Newer versions of the dependencies might work, but are not tested.

1. Clone the repository and enter the project directory

    ```sh
    git clone https://github.com/quality-programming/quality-content
    cd random-video
    ```

2. Create a virtual environment

    ```sh
    python -m virtualenv venv
    . venv/Scripts/activate
    ```

3. Install Python dependencies

    ```sh
    python -m pip install -r requirements.txt -r requirements-dev.txt
    ```

4. Install external dependencies (libVLC)

    Run the script to automatically download and extract libVLC:

    ```sh
    ./scripts/download-dependencies.sh
    ```

    or manually download the required libVLC version for Windows 64-bit from the [VideoLAN archive][vlc-download], extract
    the directory to the root of the project and rename it to `libvlc`.

5. Build

    ```sh
    ./scripts/build.sh
    ```

Executable with all required libraries and assets can be found in `dist`


## License

All trademarks, brands and media belong to their respective owners.

The code is licensed under the MIT license. See [LICENSE][license] for more information.


[alexitx]: https://github.com/alexitx
[lamborghini]: https://www.youtube.com/watch?v=RM96XQ7X6b0
[paranoya]: https://www.youtube.com/watch?v=HyE3wk1viXU
[sagapo]: https://www.youtube.com/watch?v=ZdJoflIcR10
[python-download]: https://www.python.org/downloads
[vlc-download]: https://download.videolan.org/pub/videolan/vlc/3.0.18/win64
[git-bash-download]: https://git-scm.com/downloads
[license]: https://github.com/quality-programming/quality-content/blob/master/random-video/LICENSE
