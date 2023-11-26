## Info

- Project name: Waifu Acquirer 69000
- Created: 2022-12-18
- Language: JavaScript
- Platform: Windows (x64), Linux (x64), macOS (untested)
- Author: [alexitx][alexitx]


## Description

App that offers viewing randomly selected anime illustrations. Different modes can be chosen which control the type of
content present in the images. Note that even when not requesting NFSW art, it may still be present. You can find more
information at the API websites listed below.


## Credits

- [waifu.im][waifu.im] - Web API for anime illustrations
- [waifu.pics][waifu.pics] - Web API for anime illustrations


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
    cd waifu-acquirer-69000
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
[waifu.im]: https://www.waifu.im
[waifu.pics]: https://waifu.pics
[node-download]: https://nodejs.org/en/download
[git-bash-download]: https://git-scm.com/downloads
[license]: https://github.com/quality-programming/quality-content/blob/master/waifu-acquirer-69000/LICENSE
