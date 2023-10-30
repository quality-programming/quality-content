## Info

- Project name: Quality Memes
- Created: 2020-04-24
- Language: Python
- Platform: Windows (x64)
- Author: [alexitx][alexitx]


## Description

> [!WARNING]
> 🔊 Contains loud audio

App with a video player containing 5 edited variations of popular meme videos.


## Credits

- [Coffin Dance][coffin-dance]
- [GTA IV piano car][gta-iv-piano-car]
- [Putin driving a truck][putin-driving-truck]
- [Russian gopnik tank with hard bass][russian-gopnik-tank-hard-bass]
- [Russian tanks driving][russian-tanks-drifting]
- [Mii Channel remix][mii-channel-remix]
- Renai Circulation (Bakemonogatari)


## Building

Requirements:
- [Python][python-download] 3.11 with tkinter
- [libVLC][vlc-download] 3.0.18
- [Git Bash][git-bash-download]

Newer versions of the dependencies might work, but are not tested.

1. Clone the repository and enter the project directory

    ```sh
    git clone https://github.com/quality-programming/quality-content
    cd quality-memes
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
[coffin-dance]: https://www.youtube.com/watch?v=j9V78UbdzWI
[gta-iv-piano-car]: https://www.youtube.com/watch?v=BeSdSrCKp-8
[putin-driving-truck]: https://www.youtube.com/watch?v=NYyVilzS9KQ
[russian-gopnik-tank-hard-bass]:https://www.youtube.com/watch?v=IIqr94NDeTE
[russian-tanks-drifting]: https://www.youtube.com/watch?v=qPMMxtG5m7Y
[mii-channel-remix]: https://www.youtube.com/watch?v=7NY2t4nZ6ZE
[python-download]: https://www.python.org/downloads
[vlc-download]: https://download.videolan.org/pub/videolan/vlc/3.0.18/win64
[git-bash-download]: https://git-scm.com/downloads
[license]: https://github.com/quality-programming/quality-content/blob/master/quality-memes/LICENSE
