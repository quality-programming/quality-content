## Info

- Project name: Waifu Generator
- Created: 2022-12-08
- Language: JavaScript
- Platform: Windows (x64), Linux (x64), macOS (untested)
- Author: [alexitx][alexitx]


## Description

App that offers viewing random AI generated anime images and requesting an image with custom parameters. Internet
connection is required for downloading and displaying the images. The images might be blurry, distorted, or not be in
anime style at all. You can find more information on the API website listed below.


## Credits

- [thisanimedoesnotexist.ai][thisanimedoesnotexist.ai] - Web API for AI generated anime images


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
    cd waifu-generator
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

    Windows
    ```sh
    npm run dist:windows
    ```

    Linux
    ```sh
    npm run dist:linux
    ```

    macOS
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
[thisanimedoesnotexist.ai]: https://thisanimedoesnotexist.ai
[node-download]: https://nodejs.org/en/download
[git-bash-download]: https://git-scm.com/downloads
[license]: https://github.com/quality-programming/quality-content/blob/master/waifu-generator/LICENSE
