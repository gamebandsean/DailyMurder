const { Jimp } = require('jimp');
const path = require('path');

async function removeWhitePixels() {
  const imagePath = path.join(__dirname, '../assets/characters/Body2.png');
  const outputPath = path.join(__dirname, '../assets/characters/Body2.png');
  
  try {
    const image = await Jimp.read(imagePath);
    
    // Scan through all pixels
    const { width, height, data } = image.bitmap;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const red = data[idx + 0];
        const green = data[idx + 1];
        const blue = data[idx + 2];
        
        // Check if pixel is white or near-white (threshold of 250)
        if (red > 250 && green > 250 && blue > 250) {
          // Make it transparent
          data[idx + 3] = 0;
        }
      }
    }
    
    await image.write(outputPath);
    console.log('Successfully removed white pixels from Body2.png');
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

removeWhitePixels();
