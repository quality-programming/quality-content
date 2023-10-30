## Info

- Project name: Height Calculator
- Created: 2021-03-26
- Language: Python
- Platform: Windows, Linux (untested), macOS (untested)
- Author: [alexitx][alexitx]


## Description

Recreation of the "[height calculator][height-calculator-meme]" meme.


## Building

Requirements:
- [Python][python-download] 3.11 with tkinter
- [Git Bash][git-bash-download]

Newer versions of the dependencies might work, but are not tested.

1. Clone the repository and enter the project directory

    ```sh
    git clone https://github.com/quality-programming/quality-content
    cd height-calculator
    ```

2. Create a virtual environment

    ```sh
    python -m virtualenv venv
    . venv/Scripts/activate
    ```

3. Install Python dependencies

    ```sh
    python -m pip install -r requirements-dev.txt
    ```

4. Build

    ```sh
    ./scripts/build.sh
    ```

Executable with all required libraries and assets can be found in `dist`


## License

All trademarks, brands and media belong to their respective owners.

The code is licensed under the MIT license. See [LICENSE][license] for more information.


[alexitx]: https://github.com/alexitx
[height-calculator-meme]: https://user-images.githubusercontent.com/56477695/132377540-67c5b50a-48ee-4834-a9f3-fb8cf3027268.jpg
[python-download]: https://www.python.org/downloads
[vlc-download]: https://download.videolan.org/pub/videolan/vlc/3.0.18/win64
[git-bash-download]: https://git-scm.com/downloads
[license]: https://github.com/quality-programming/quality-content/blob/master/height-calculator/LICENSE
