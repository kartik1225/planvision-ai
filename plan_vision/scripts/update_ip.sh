#!/bin/bash

# Get the local IP address (works on macOS)
IP_ADDRESS=$(ipconfig getifaddr en0)

# If en0 is not active (e.g., using Wi-Fi on a different interface or ethernet), try en1
if [ -z "$IP_ADDRESS" ]; then
    IP_ADDRESS=$(ipconfig getifaddr en1)
fi

# Fallback if no IP found
if [ -z "$IP_ADDRESS" ]; then
    echo "Could not detect IP address. Defaulting to localhost."
    IP_ADDRESS="localhost"
fi

echo "Detected IP: $IP_ADDRESS"

# Path to Config.swift
# Resolve relative to the script location to ensure it works from Xcode
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CONFIG_FILE="$SCRIPT_DIR/../plan_vision/src/core/Config.swift"

# Check if file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: Config.swift not found at $CONFIG_FILE"
    exit 1
fi

# Update the host in Config.swift
# We use sed to replace the line containing 'static let host ='
# The -i '' is for in-place editing on macOS without a backup file
sed -i '' "s/static let host = \".*\"/static let host = \"$IP_ADDRESS\"/" "$CONFIG_FILE"

echo "Updated Config.swift with host: $IP_ADDRESS"
