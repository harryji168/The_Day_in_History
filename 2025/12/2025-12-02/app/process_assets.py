from PIL import Image
import os
import glob

def remove_white_background(input_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()

        new_data = []
        for item in datas:
            # Change all white (also shades of whites) to transparent
            # Threshold of 200/255 for RGB
            if item[0] > 220 and item[1] > 220 and item[2] > 220:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)

        img.putdata(new_data)
        img.save(input_path, "PNG")
        print(f"Processed: {input_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

# Process all PNGs in the directory
assets_dir = '/home/harry/The_Day_in_History/2025/12/2025-12-02/app/src/assets'
for filename in glob.glob(os.path.join(assets_dir, '*.png')):
     # Avoid processing the background image if we copy it there later (or just process everything, white bg removal shouldn't hurt non-white imgs much unless they have white parts)
     # Better yet, let's just process the character ones.
     if "3d" in filename: # My generated images had "3d" in the name
        remove_white_background(filename)
