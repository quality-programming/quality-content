#!/bin/bash

set -e

SPEC_FILE="bruh.spec"

echo "Build started"
pyinstaller --distpath pyinstaller-dist --workpath pyinstaller-build -y --clean "$SPEC_FILE"
echo "Build finished"

echo "Creating distribution"
rm -rf dist/
mkdir -p dist/
mv pyinstaller-dist/* dist/

echo "Finished"
