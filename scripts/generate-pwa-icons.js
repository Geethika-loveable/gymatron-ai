
// This is just a helper script to generate PWA icons from a source image
// Run with: node scripts/generate-pwa-icons.js
// Requires sharp: npm install --save-dev sharp

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source image path
const sourceImage = path.join(__dirname, '../public/gyma-icon.jpg');

// Output directory
const outputDir = path.join(__dirname, '../public/pwa-icons');

// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Icon sizes for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Function to generate icons
async function generateIcons() {
  try {
    // Regular icons
    for (const size of sizes) {
      await sharp(sourceImage)
        .resize(size, size)
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
      console.log(`Generated icon-${size}x${size}.png`);
    }
    
    // Special Apple touch icon
    await sharp(sourceImage)
      .resize(152, 152)
      .toFile(path.join(outputDir, 'apple-touch-icon-152x152.png'));
    console.log('Generated apple-touch-icon-152x152.png');
    
    // Maskable icon (with padding for safe zone)
    await sharp(sourceImage)
      .resize(512, 512)
      .extend({
        top: 51,
        bottom: 51,
        left: 51,
        right: 51,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .resize(512, 512)
      .toFile(path.join(outputDir, 'maskable-icon-512x512.png'));
    console.log('Generated maskable-icon-512x512.png');
      
    console.log('All PWA icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
