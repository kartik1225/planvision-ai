#!/bin/bash

# ------------------------------
# PNG Compression Script
# ------------------------------

# Input and output folders
INPUT_FOLDER="input"
OUTPUT_FOLDER="output"

# Create output folder if not exists
mkdir -p "$OUTPUT_FOLDER"

# Loop through all PNG files
for file in "$INPUT_FOLDER"/*.png; do
    # Extract filename
    filename=$(basename "$file")

    echo "Compressing: $filename"

    # ImageMagick compression command
    convert "$file" -strip -quality 85 "$OUTPUT_FOLDER/$filename"
done

echo "------------------------------"
echo "PNG Compression Completed!"
echo "Compressed files saved in: $OUTPUT_FOLDER"

