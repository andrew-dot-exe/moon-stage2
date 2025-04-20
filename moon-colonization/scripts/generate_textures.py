from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import os

def create_moon_texture(size, type='shaded'):
    # Create a new image with a dark gray background
    img = Image.new('RGB', (size, size), (40, 40, 40))
    draw = ImageDraw.Draw(img)
    
    # Generate crater-like patterns
    for _ in range(size // 10):  # Number of craters based on size
        # Random crater position
        x = np.random.randint(0, size)
        y = np.random.randint(0, size)
        
        # Random crater size
        radius = np.random.randint(size // 50, size // 20)
        
        # Draw crater
        if type == 'shaded':
            # Shaded relief style
            draw.ellipse([x-radius, y-radius, x+radius, y+radius], 
                        fill=(60, 60, 60), outline=(30, 30, 30))
            # Add highlight
            draw.ellipse([x-radius//2, y-radius//2, x+radius//4, y+radius//4], 
                        fill=(80, 80, 80))
        elif type == 'color':
            # Color style with brownish tones
            base_color = (100, 80, 60)
            draw.ellipse([x-radius, y-radius, x+radius, y+radius], 
                        fill=base_color, outline=(70, 50, 30))
            # Add highlight
            draw.ellipse([x-radius//2, y-radius//2, x+radius//4, y+radius//4], 
                        fill=(120, 100, 80))
        else:  # elevation
            # Grayscale elevation style
            elevation = np.random.randint(50, 200)
            draw.ellipse([x-radius, y-radius, x+radius, y+radius], 
                        fill=(elevation, elevation, elevation))
    
    # Add some noise for texture
    noise = np.random.randint(0, 20, (size, size, 3), dtype=np.uint8)
    noise_img = Image.fromarray(noise)
    img = Image.blend(img, noise_img, 0.1)
    
    # Apply slight blur for smoothness
    img = img.filter(ImageFilter.GaussianBlur(radius=1))
    
    return img

def main():
    # Create directories if they don't exist
    resolutions = {
        'low': 512,
        'medium': 1024,
        'high': 2048
    }
    
    types = ['shaded', 'color', 'elevation']
    
    for res_name, size in resolutions.items():
        for texture_type in types:
            # Create directory if it doesn't exist
            dir_path = f'public/textures/moon/{res_name}'
            os.makedirs(dir_path, exist_ok=True)
            
            # Generate and save texture
            texture = create_moon_texture(size, texture_type)
            texture.save(f'{dir_path}/{texture_type}.jpg', quality=95)

if __name__ == '__main__':
    main() 