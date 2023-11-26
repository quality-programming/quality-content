## Info

- Project name: Frrrrrr
- Created: 2023-01-27
- Language: JavaScript
- Platform: Windows (x64), Linux (x64), macOS (untested)
- Author: [alexitx][alexitx]


## Description

App with a video player featuring the "frrrrrr skibidi dop dop yes yes" meme.


## Credits

- [Fiki - Chupki v krusta][chupki-v-krusta]
- [Yasin Cengiz belly dance 1][yasin-cengiz-dance-1]
- [Yasin Cengiz belly dance 2][yasin-cengiz-dance-2]


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
    cd frrrrrr
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
[chupki-v-krusta]: https://www.youtube.com/watch?v=s3d6_VdWCoU
[yasin-cengiz-dance-1]: https://www.youtube.com/watch?v=Jc-bfYFt350
[yasin-cengiz-dance-2]: https://www.youtube.com/watch?v=HaD_wLWw_v4
[node-download]: https://nodejs.org/en/download
[git-bash-download]: https://git-scm.com/downloads
[license]: https://github.com/quality-programming/quality-content/blob/master/frrrrrr/LICENSE
