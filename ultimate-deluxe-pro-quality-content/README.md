## Info

- Project name: Ultimate Deluxe Pro Quality Content
- Created: 2021-03-30
- Language: Python
- Platform: Windows (x86-64)
- Author: [alexitx][alexitx]


## Description

> [!WARNING]
> 🔞🔊 Contains explicit content and loud audio

Non-interactive app with UI and cursor animations, sound effects and video. Once launched, the animations start and
can't be stopped until the app exits automatically.

Before running it, make sure to close any important work that you still have open, such as unsaved documents, photos,
etc. because

<details>
  <summary>(spoiler)</summary>

  the app will shut down your computer at the end as a troll, the same way you would do so manually.  ```py

</details>


## Credits

- [Aria - Helicopter][helicopter]


## Building

Requirements:
- [Python][python-download] 3.11 with tkinter
- [libVLC][vlc-download] 3.0.18
- [Git Bash][git-bash-download]

Newer versions of the dependencies might work, but are not tested.

1. Clone the repository and enter the project directory

    ```sh
    git clone https://github.com/quality-programming/quality-content
    cd ultimate-deluxe-pro-quality-content
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
[helicopter]: https://www.youtube.com/watch?v=03tsvYTojyo
[python-download]: https://www.python.org/downloads
[vlc-download]: https://download.videolan.org/pub/videolan/vlc/3.0.18/win64
[git-bash-download]: https://git-scm.com/downloads
[license]: https://github.com/quality-programming/quality-content/blob/master/ultimate-deluxe-pro-quality-content/LICENSE
