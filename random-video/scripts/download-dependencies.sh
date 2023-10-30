#!/bin/bash

set -e

LIBVLC_URL="https://download.videolan.org/pub/videolan/vlc/3.0.18/win64/vlc-3.0.18-win64.zip"
LIBVLC_CHECKSUM_URL="https://download.videolan.org/pub/videolan/vlc/3.0.18/win64/vlc-3.0.18-win64.zip.sha256"
LIBVLC_ARCHIVE="vlc-3.0.18-win64.zip"
LIBVLC_ARCHIVE_ROOT_DIR="vlc-3.0.18"
LIBVLC_DIR="libvlc"
LIBVLC_REMOVE_FILES=(
    "hrtfs/"
    "locale/"
    "lua"
    "msi/"
    "plugins/gui/"
    "skins/"
    "vlc-cache-gen.exe"
    "vlc.exe"
    "vlc.ico"
)

TEMP_DIR="temp"

mkdir -p "$TEMP_DIR"

function verify_libvlc_checksum {
    echo "Downloading libVLC checksum: $LIBVLC_CHECKSUM_URL"
    checksum_file="$(curl -sSLo - "$LIBVLC_CHECKSUM_URL")"

    cd "$TEMP_DIR"
    echo "$checksum_file" | sha256sum -c - >/dev/null
    checksum_result=$?
    cd ..

    return $checksum_result
}

should_download_libvlc=true

if [ -f "$TEMP_DIR/$LIBVLC_ARCHIVE" ]; then
    echo "libVLC is already downloaded, verifying integrity"
    if verify_libvlc_checksum; then
        echo "Valid checksum"
        should_download_libvlc=false
    else
        echo "Invalid checksum"
    fi
fi

if $should_download_libvlc; then
    echo "Downloading libVLC: $LIBVLC_URL"
    curl -sSLo "$TEMP_DIR/$LIBVLC_ARCHIVE" "$LIBVLC_URL"

    if verify_libvlc_checksum; then
        echo "Valid checksum"
    else
        echo "Invalid checksum"
        exit 1
    fi
fi

echo "Extracting to '$LIBVLC_ARCHIVE_ROOT_DIR'"
rm -rf "$LIBVLC_ARCHIVE_ROOT_DIR/" "$LIBVLC_DIR/"
unzip -q "$TEMP_DIR/$LIBVLC_ARCHIVE"

echo "Removing unnecessary files"
for path in ${LIBVLC_REMOVE_FILES[@]}; do
    echo "- $LIBVLC_ARCHIVE_ROOT_DIR/$path"
    rm -r "$LIBVLC_ARCHIVE_ROOT_DIR/$path"
done

echo "Renaming '$LIBVLC_ARCHIVE_ROOT_DIR' to '$LIBVLC_DIR'"
mv "$LIBVLC_ARCHIVE_ROOT_DIR/" "$LIBVLC_DIR/"
