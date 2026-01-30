from PIL import Image, ImageDraw

def remove_background_floodfill(input_path, output_path, tolerance=30):
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    
    # Get the background color from the top-left corner
    bg_color = img.getpixel((0, 0))
    
    # Check if top-left is actually white-ish
    if max(bg_color[:3]) < 200:
        print("Warning: Top-left pixel is not white. Flood fill might fail or remove wrong color.")
        # Try finding a white pixel at other corners
        corners = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
        for x, y in corners:
            pixel = img.getpixel((x, y))
            if min(pixel[:3]) > 200:
                bg_color = pixel
                print(f"Found white background at ({x}, {y})")
                break
    
    # Create a mask image for flood filling
    # 0 = background, 1 = foreground
    # We will flood fill the background with 0
    
    # Actually, PIL's floodfill fills a region with a color.
    # We can flood fill the main image directly with transparent color (0,0,0,0)
    # but we need to be careful about tolerance.
    
    # Since ImageDraw.floodfill doesn't support tolerance easily in all versions or complex gradients,
    # let's write a simple manual BFS flood fill with tolerance.
    
    pixels = img.load()
    queue = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    visited = set(queue)
    
    # Helper to check if color is close to white/background
    def is_bg(p):
        r, g, b, a = p
        # Assuming background is white-ish
        return r > 255 - tolerance and g > 255 - tolerance and b > 255 - tolerance

    # If the corners aren't white, we might need a better seed. 
    # But based on user request "remove white background", we assume it is white.
    
    processed_img = img.copy()
    proc_pixels = processed_img.load()
    
    # We'll use a mask to track what to remove
    mask = Image.new('L', (width, height), 0)
    mask_pixels = mask.load()
    
    # Add all edge pixels that are white to queue to ensure we get all surrounding background
    for x in range(width):
        for y in [0, height-1]:
            if is_bg(pixels[x,y]):
                 queue.append((x,y))
                 visited.add((x,y))
                 
    for y in range(height):
        for x in [0, width-1]:
             if is_bg(pixels[x,y]):
                 queue.append((x,y))
                 visited.add((x,y))

    while queue:
        x, y = queue.pop(0)
        
        # Mark as transparent
        proc_pixels[x, y] = (255, 255, 255, 0)
        mask_pixels[x, y] = 255 # Processed
        
        # Check neighbors
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < width and 0 <= ny < height:
                if (nx, ny) not in visited:
                    if is_bg(pixels[nx, ny]):
                        visited.add((nx, ny))
                        queue.append((nx, ny))
                        
    processed_img.save(output_path, "PNG")
    print(f"Saved smart transparent image to {output_path}")

if __name__ == "__main__":
    remove_background_floodfill("LOGO.jpg", "LOGO.png", tolerance=50)
