## Info

- Project name: Ultimate Pro Quality
- Created: 2020-12-20
- Language: Python
- Platform: Windows (x86-64)
- Author: [alexitx][alexitx]


## Description

> [!WARNING]
> 🔊 Contains loud audio

App with a multi-monitor video player containing 6 deep fried edits of popular Bulgarian songs.


## Credits

- [Galin x Madjuna x Adam - Za vsichki bivshi][za-vsichki-bivshi]
- [Ariana Grande - 7 Rings DJ Allen Balkan Remix][7-rings-balkan-remix]
- [ork. Deniz Grup 2017 - Kuchek][deniz-grup-kuchek]
- [Medi - Ne, mersi][ne-mersi]
- [Galin & Lidia - Nyama da mi mine][nyama-da-mi-mine]
- [Krisko & Galena - Kavala kuchek][kavala-kuchek]


## Building

Requirements:
- [Python][python-download] 3.11 with tkinter
- [libVLC][vlc-download] 3.0.18
- [Git Bash][git-bash-download]

Newer versions of the dependencies might work, but are not tested.

1. Clone the repository and enter the project directory

    ```sh
    git clone https://github.com/quality-programming/quality-content
    cd ultimate-pro-quality
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
[za-vsichki-bivshi]: https://www.youtube.com/watch?v=w09mz4vjXpI
[7-rings-balkan-remix]: https://www.youtube.com/watch?v=GGF5Tz9fSnc
[deniz-grup-kuchek]: https://www.youtube.com/watch?v=IFLHibAMqOQ
[ne-mersi]: https://www.youtube.com/watch?v=0NN0m3SauUg
[nyama-da-mi-mine]: https://www.youtube.com/watch?v=TNntOa7jT_k
[kavala-kuchek]: https://www.youtube.com/watch?v=V-12Xo4bhas
[python-download]: https://www.python.org/downloads
[vlc-download]: https://download.videolan.org/pub/videolan/vlc/3.0.18/win64
[git-bash-download]: https://git-scm.com/downloads
[license]: https://github.com/quality-programming/quality-content/blob/master/ultimate-pro-quality/LICENSE
