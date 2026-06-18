---
name: image-generation
description: USE FOR generating images with ComfyUI. This skill includes scripts for both image generation and background removal, allowing you to create and refine images in a streamlined workflow.
---

# ComfyUI Combined Script

The `comfyui_combined.py` script is a utility for automating complex ComfyUI workflows that involve both image generation and background removal in a single execution.

## Features

- **Integrated Workflow**: Combines image generation and background removal into one command.
- **Customizable Generation**: Override text prompts, image width, and height via command-line arguments.
- **Optional Background Removal**: Use the `--remove-bg` flag to automatically trigger the background removal process on the newly generated image.
- **Flexible Output Control**: Specify a custom name and path for your generated images using the `--output` argument.
- **Workflow Configuration**: Easily switch between different workflow JSON files for both generation (`--gen-json`) and background removal (`--bg-json`).
- **Server Targeting**: Specify the ComfyUI server address using the `--server` argument.

## Usage Examples

### Basic Image Generation
Generates an image using the default prompt and saves it as `sunset.png`:
```bash
source bin/activate && python comfyui_combined.py --prompt "A beautiful sunset over the mountains" --output sunset.png
```

### Generation with Background Removal
Generates an image and then automatically runs the background removal workflow, saving the result as `cat_nobg.png`:
```bash
source bin/activate && python comfyui_combined.py --prompt "A cute cat" --output cat.png --remove-bg
```

### Advanced Configuration
Overrides dimensions and uses a specific server address:
```bash
source bin/activate && python comfyui_combined.py --prompt "A futuristic city" --width 1024 --height 1024 --server 127.0.0.1:8188 --output city.png
```

## Arguments

| Argument | Description | Default |
| :---s | :--- | :--- |
| `--prompt` | Override the text prompt for generation | `None` |
| `--width` | Override the generated image width | `None` |
| `--height` | Override the generated image height | `None` |
| `--gen-json` | Path to the generation workflow JSON file | `image_qwen_Image_2512.json` |
| `--bg-json` | Path to the background removal workflow JSON file | `utility_birefnet_remove_background.json` |
| `--output` | Path and filename for the generated image | `None` (uses `temp_generated_image.png`) |
| `--remove-bg` | If present, runs background removal after generation | `False` |
| `--server` | ComfyUI server address | `127.0.0.1:8188` |
