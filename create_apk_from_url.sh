#!/bin/bash

# --- Script Configuration ---
# This script creates a native Android APK that wraps a live website,
# generates all app icons from a single source image, and allows for
# configurable full-screen behavior.

# --- App Details (CHANGE THESE VALUES) ---
PROJECT_DIR="DigiSamahārtaWebViewApp"
APP_NAME="DigiSamahārta"
APP_ID="com.digisamaharta.app" # This should be a unique ID for your app
LIVE_URL="https://digisamaharta.vercel.app/"

# --- Customization (CHANGE THESE PATHS AND SETTINGS) ---
# Provide the absolute path to your app icon (1024x1024px PNG is recommended for best results)
APP_ICON_PATH="/Users/adityaverma/Documents/GitHub/expenza-ai-insights/public/favicon.png"

# Set to 'true' for a completely full-screen experience (hides status bar).
# Set to 'false' to show the status bar and pad the web content below it (standard app behavior).
FULL_SCREEN_MODE=false

# --- Script Internals (No need to edit below this line) ---

# Exit immediately if a command exits with a non-zero status.
set -e

# Color Definitions for Logging
COLOR_RESET='\033[0m'
COLOR_RED='\033[0;31m'
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[0;33m'
COLOR_CYAN='\033[0;36m'

# Logging Functions
log_info() { echo -e "${COLOR_CYAN}INFO: $1${COLOR_RESET}"; }
log_success() { echo -e "${COLOR_GREEN}SUCCESS: $1${COLOR_RESET}"; }
log_warn() { echo -e "${COLOR_YELLOW}WARN: $1${COLOR_RESET}"; }
log_error() {
    echo -e "${COLOR_RED}ERROR: $1${COLOR_RESET}" >&2
    exit 1
}

# --- Main Script Logic ---

# 1. Prerequisite Checks
log_info "Step 1/8: Checking for required tools and files..."
if ! command -v bun &> /dev/null && ! command -v bun &> /dev/null; then
    log_error "Neither 'bun' nor 'bun' is installed. Please install one to continue."
fi
if [ -z "$ANDROID_HOME" ] || [ ! -d "$ANDROID_HOME" ]; then
    log_error "Android SDK not found. Please set the ANDROID_HOME environment variable.\nExample: export ANDROID_HOME=\"/Users/\$USER/Library/Android/sdk\""
fi
if [ ! -f "$APP_ICON_PATH" ]; then
    log_error "App icon not found at the specified path: $APP_ICON_PATH"
fi
log_success "All prerequisites met."

# 2. Project Directory Setup
if [ -d "$PROJECT_DIR" ]; then
    log_warn "Project directory '$PROJECT_DIR' already exists."
    read -p "Do you want to delete it and start fresh? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Removing existing directory..."
        rm -rf "$PROJECT_DIR"
    else
        echo "Aborted."
        exit 0
    fi
fi

# 3. Project Initialization
log_info "Step 2/8: Creating project directory and installing dependencies..."
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

if command -v bun &> /dev/null; then
    bun init -y > /dev/null 2>&1
    bun add @capacitor/core @capacitor/cli @capacitor/android @capacitor/status-bar > /dev/null 2>&1
    bun add -d capacitor-assets > /dev/null 2>&1
else
    bun init -y > /dev/null 2>&1
    bun install @capacitor/core @capacitor/cli @capacitor/android @capacitor/status-bar > /dev/null 2>&1
    bun install -D capacitor-assets > /dev/null 2>&1
fi
log_success "Project initialized and dependencies installed."

# 4. Capacitor Configuration
log_info "Step 3/8: Configuring Capacitor..."
mkdir -p www
echo "<h1>Loading...</h1>" > www/index.html

# Determine StatusBar configuration based on the FULL_SCREEN_MODE variable
STATUS_BAR_CONFIG=""
if [ "$FULL_SCREEN_MODE" = true ]; then
    STATUS_BAR_CONFIG="    StatusBar: { visible: false },"
else
    # 'overlay: false' is the key to automatically pad for the status bar.
    # 'style' can be 'light', 'dark', or 'default'.
    STATUS_BAR_CONFIG="    StatusBar: { overlay: false, style: 'light' },"
fi

# Create capacitor.config.ts with the server URL and dynamic plugin config
cat > capacitor.config.ts <<EOL
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: '$APP_ID',
  appName: '$APP_NAME',
  webDir: 'www',
  server: {
    url: '$LIVE_URL',
    cleartext: true,
  },
  plugins: {
$STATUS_BAR_CONFIG
  },
};

export default config;
EOL
log_success "Capacitor configured successfully."

# 5. Add Android Platform
log_info "Step 4/8: Adding the native Android platform..."
npx cap add android > /dev/null 2>&1

# 6. Generate App Icon
log_info "Step 5/8: Generating app icons from source image..."
# Use capacitor-assets to create all necessary icon sizes for Android
npx capacitor-assets generate --icon-path "$APP_ICON_PATH" --android > /dev/null 2>&1
log_success "App icons generated."

# 7. Sync and Configure Build
log_info "Step 6/8: Syncing configuration with Android project..."
npx cap sync > /dev/null 2>&1

log_info "Step 7/8: Configuring Gradle for build..."
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
if ! grep -q "org.gradle.java.home" "android/gradle.properties"; then
    echo "org.gradle.java.home=$(/usr/libexec/java_home -v 21)" >> android/gradle.properties
fi
log_success "Gradle configured."

# 8. Build the APK
log_info "Step 8/8: Cleaning and building the debug APK. This may take several minutes..."
cd android
./gradlew clean > /dev/null 2>&1
./gradlew assembleDebug # Show build output as it can be long

# --- Final Success Message ---
FINAL_PROJECT_PATH=$(pwd)
echo ""
log_success "##################################"
log_success "### APK Generation Complete! ###"
log_success "##################################"
echo ""
echo -e "${COLOR_YELLOW}A new project was created in: ${COLOR_RESET}${FINAL_PROJECT_PATH}"
echo -e "${COLOR_YELLOW}Your APK file is located at: ${COLOR_RESET}${FINAL_PROJECT_PATH}/app/build/outputs/apk/debug/app-debug.apk"
echo ""