#!/bin/bash

set -e

SPEC_FILE="random-video.spec"
APP_NAME="Random Video"
INCLUDE_RESOURCES=(
    "assets/"
    "libvlc/"
    "config.json"
)
DATA_DIRECTORY="data"

echo "Build started"
pyinstaller --distpath pyinstaller-dist --workpath pyinstaller-build -y --clean "$SPEC_FILE"
echo "Build finished"

echo "Creating distribution"
rm -rf dist/
mkdir -p dist/
mv "pyinstaller-dist/$APP_NAME/" dist/

echo "Copying resources"
for path in ${INCLUDE_RESOURCES[@]}; do
    echo "- $path"
    cp -r "$path" "dist/$APP_NAME/$DATA_DIRECTORY/"
done

echo "Finished"
