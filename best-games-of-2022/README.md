## Info

- Project name: Best Games of 2022
- Created: 2022-12-23
- Language: JavaScript
- Platform: Windows (x64), Linux (x64), macOS (untested)
- Author: [alexitx][alexitx]


## Description

Slideshow reveal of some of the highest ranked video games in 2022, but with a twist.


## Credits

- Stray cover art
- Bayonetta 3 cover art
- Gran Turismo 7 cover art
- Elden Ring cover art
- [Deez nuts hip hop remix][deez-nuts-remix]


## Building

Requirements:
- [Node.js][node-download] 20
- npm
- [Git Bash][git-bash-download] (Windows)

Newer versions of the dependencies might work, but are not tested.

Electron has been updated to v26. At the moment, v27 has issues with window title bars.

1. Clone the repository and enter the project directory

    ```sh
    git clone https://github.com/quality-programming/quality-content
    cd best-games-of-2022
    ```

2. Install dependencies

    ```sh
    npm install
    ```

3. Build

    ```sh
    npm run build
    ```

4. Build distribution

    Windows:
    ```sh
    npm run dist:windows
    ```

    Linux:
    ```sh
    npm run dist:linux
    ```

    macOS:
    ```sh
    npm run dist:macos
    ```

The final build for your platform can be found in:
- `dist/win-unpacked` - Windows
- `dist/linux-unpacked` - Linux
- `dist/mac` - macOS


## License

All trademarks, brands and media belong to their respective owners.

The code is licensed under the MIT license. See [LICENSE][license] for more information.


[alexitx]: https://github.com/alexitx
[deez-nuts-remix]: https://www.youtube.com/watch?v=tvbdz0ayASc
[node-download]: https://nodejs.org/en/download
[git-bash-download]: https://git-scm.com/downloads
[license]: https://github.com/quality-programming/quality-content/blob/master/best-games-of-2022/LICENSE
