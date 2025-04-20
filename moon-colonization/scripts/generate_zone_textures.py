from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import os

def create_heights_texture(size):
    # Create a new image with a dark gray background
    img = Image.new('RGB', (size, size), (40, 40, 40))
    draw = ImageDraw.Draw(img)
    
    # Generate mountainous patterns
    for _ in range(size // 5):  # More frequent peaks
        x = np.random.randint(0, size)
        y = np.random.randint(0, size)
        radius = np.random.randint(size // 20, size // 10)
        
        # Draw mountain peak
        draw.ellipse([x-radius, y-radius, x+radius, y+radius], 
                    fill=(60, 60, 60), outline=(30, 30, 30))
        # Add highlight
        draw.ellipse([x-radius//2, y-radius//2, x+radius//4, y+radius//4], 
                    fill=(80, 80, 80))
    
    # Add some noise for texture
    noise = np.random.randint(0, 20, (size, size, 3), dtype=np.uint8)
    noise_img = Image.fromarray(noise)
    img = Image.blend(img, noise_img, 0.1)
    
    # Apply slight blur for smoothness
    img = img.filter(ImageFilter.GaussianBlur(radius=1))
    
    return img

def create_lowlands_texture(size):
    # Create a new image with a medium gray background
    img = Image.new('RGB', (size, size), (60, 60, 60))
    draw = ImageDraw.Draw(img)
    
    # Generate valley-like patterns
    for _ in range(size // 10):
        x = np.random.randint(0, size)
        y = np.random.randint(0, size)
        radius = np.random.randint(size // 30, size // 15)
        
        # Draw valley
        draw.ellipse([x-radius, y-radius, x+radius, y+radius], 
                    fill=(50, 50, 50), outline=(40, 40, 40))
        # Add shadow
        draw.ellipse([x-radius//2, y-radius//2, x+radius//4, y+radius//4], 
                    fill=(45, 45, 45))
    
    # Add some noise for texture
    noise = np.random.randint(0, 15, (size, size, 3), dtype=np.uint8)
    noise_img = Image.fromarray(noise)
    img = Image.blend(img, noise_img, 0.1)
    
    # Apply slight blur for smoothness
    img = img.filter(ImageFilter.GaussianBlur(radius=1))
    
    return img

def create_plains_texture(size):
    # Create a new image with a light gray background
    img = Image.new('RGB', (size, size), (80, 80, 80))
    draw = ImageDraw.Draw(img)
    
    # Generate flat patterns with slight variations
    for _ in range(size // 20):  # Fewer features
        x = np.random.randint(0, size)
        y = np.random.randint(0, size)
        radius = np.random.randint(size // 40, size // 20)
        
        # Draw subtle feature
        draw.ellipse([x-radius, y-radius, x+radius, y+radius], 
                    fill=(75, 75, 75), outline=(70, 70, 70))
    
    # Add some noise for texture
    noise = np.random.randint(0, 10, (size, size, 3), dtype=np.uint8)
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
    
    zone_types = ['heights', 'lowlands', 'plains']
    
    for res_name, size in resolutions.items():
        for zone_type in zone_types:
            # Create directory if it doesn't exist
            dir_path = f'public/textures/moon/{res_name}'
            os.makedirs(dir_path, exist_ok=True)
            
            # Generate and save texture based on zone type
            if zone_type == 'heights':
                texture = create_heights_texture(size)
            elif zone_type == 'lowlands':
                texture = create_lowlands_texture(size)
            else:  # plains
                texture = create_plains_texture(size)
            
            texture.save(f'{dir_path}/{zone_type}.jpg', quality=95)

if __name__ == '__main__':
    main() 