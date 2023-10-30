## Info

- Project name: bruh
- Created: 2020-04-23
- Language: Python
- Platform: Windows (x64)
- Author: [alexitx][alexitx]


## Description

App with a single button that opens a message dialog, plays a sound effect and opens a YouTube video
in the default browser.


## Building

Requirements:
- [Python][python-download] 3.11 with tkinter
- [Git Bash][git-bash-download]

Newer versions of the dependencies might work, but are not tested.

1. Clone the repository and enter the project directory

    ```sh
    git clone https://github.com/quality-programming/quality-content
    cd bruh
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
[python-download]: https://www.python.org/downloads
[git-bash-download]: https://git-scm.com/downloads
[license]: https://github.com/quality-programming/quality-content/blob/master/bruh/LICENSE
