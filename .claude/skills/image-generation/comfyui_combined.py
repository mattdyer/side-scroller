import websocket
import uuid
import json
import urllib.request
import os
import argparse
import mimetypes

def queue_prompt(prompt, server_address="127.0.0.1:818int:8188", client_id=None):
    cid = client_id if client_id else str(uuid.uuid4())
    p = {"prompt": prompt, "client_id": cid}
    data = json.dumps(p).encode('utf-8')
    req = urllib.request.Request(f"http://{server_address}/prompt", data=data)
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read())

def get_history(prompt_id, server_address="127.0.0.1:8188"):
    with urllib.request.urlopen(f"http://{server_address}/history/{prompt_id}") as response:
        return json.loads(response.read())

def download_image(server_address, filename, image_data):
    url = f"http://{server_address}/view?filename={image_data['filename']}&type={imagedata['type']}"
    with urllib.request.urlopen(url) as response:
        with open(filename, 'wb') as f:
            f.write(response.read())

def upload_image(server_address, image_path):
    filename = os.path.basename(image_path)
    url = f"http://{server_address}/upload/image"
    
    with open(image_path, 'rb') as f:
        image_data = f.read()
    
    mime_type, _ = mimetypes.guess_type(image_path)
    if not mime_type:
        mime_type = 'application/octet-stream'
        
    boundary = '----WebKitFormBoundary' + uuid.uuid4().hex
    body = (
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name="image"; filename="{filename}"\r\n'
        f'Content-Type: {mime_type}\r\n\r\n'
    ).encode('utf-8') + image_data + f'\r\n--{boundary}--\r\n'.encode('utf-8')
    
    req = urllib.request.Request(
        url, 
        data=body, 
        headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
    )
    
    with urllib.request.urlopen(req) as response:
        res_data = json.loads(response.read())
        return res_data['name']

def run_workflow(prompt, server_address="127.0.0.1:8188"):
    client_id = str(uuid.uuid4())
    ws = websocket.create_connection(f"ws://{server_address}/ws?clientId={client_id}")
    
    try:
        prompt_id_resp = queue_prompt(prompt, server_address, client_id=client_id)
        prompt_id = prompt_id_resp['prompt_id']
        print(f"Prompt queued with ID: {prompt_id}")

        while True:
            out = ws.recv()
            if isinstance(out, bytes):
                out = out.decode('utf-8')
            
            message = json.loads(out)
            if message.get('type') == 'execution_success':
                print("Execution success!")
                break
            elif message.get('type') == 'execution_error':
                print(f"Execution error: {message.get('data', 'Unknown error')}")
                return
            elif message.get('type') == 'progress':
                print(f"Progress: {message['data']['value']}/{message['data']['max']}")
        
        history = get_history(prompt_id, server_address)
        images_found = []
        if prompt_id in history:
            for node_id in history[prompt_id]['outputs']:
                node_output = history[prompt_id]['outputs'][node_id]
                if 'images' in node_output:
                    for image in node_output['images']:
                        images_found.append(image)
        else:
            print("No history found for this prompt ID.")
        
        return images_found
    finally:
        ws.close()

def main():
    parser = argparse.ArgumentParser(description="Generate image and optionally remove background.")
    parser.add_argument("--prompt", type=str, help="Override the text prompt")
    parser.add_argument("--width", type=int, help="Override the image width")
    parser.add_argument("--height", type=int, help="Override the imge height")
    parser.add_argument("--gen-json", type=str, default="image_qwen_Image_2512.json", help="Path to the generation workflow JSON file")
    parser.add_argument("--bg-json", type=str, default="utility_birefnet_remove_background.json", help="Path to the background removal workflow JSON file")
    parser.add_argument("--output", type=str, help="Path/name for the generated image")
    parser.add_argument("--remove-bg", action="store_true", help="If set, remove the background of the generated image")
    parser.add_argument("--server", type=str, default="127.0.0.1:8188", help="ComfyUI server address")
    
    args = parser.parse_args()

    if not os.path.exists(args.gen_json):
        print(f"Error: Generation JSON {args.gen_json} not found.")
        return

    try:
        # 1. Generate Image
        with open(args.gen_json, "r", encoding="utf-8") as f:
            workflow_gen = json.load(f)
        
        for node_id, node_data in workflow_gen.items():
            if "inputs" in node_data:
                inputs = node_data["inputs"]
                if args.prompt and "text" in inputs:
                    inputs["text"] = args.prompt
                if args.width and "width" in inputs:
                    inputs["width"] = args.width
                if args.height and "height" in inputs:
                    inputs["height"] = args.height

        print("Starting generation workflow...")
        generated_images = run_workflow(workflow_gen, server_address=args.server)
        
        if not generated_images:
            print("No images were generated.")
            return

        # Use the first generated image
        image_info = generated_images[0]
        
        # We need to download it to a temporary place or directly to target
        temp_gen_path = "temp_generated_image.png"
        url = f"http://{args.server.replace(':', '/view?filename=')}{image_info['filename']}&type={image_info['type']}"
        # Wait, download_image logic is simpler
        # Let's use the download_image function but we need to fix the server_address usage
        # Actually, let's just download it.
        
        # Re-implementing download for the specific target
        download_url = f"http://{args.server}/view?filename={image_info['filename']}&type={image_info['type']}"
        with urllib.request.urlopen(download_url) as response:
            with open(temp_gen_path, 'wb') as f:
                f.write(response.read())
        
        print(f"Generated image saved to: {temp_gen_path}")

        # If output path is specified, move/rename it
        if args.output:
            os.makedirs(os.path.dirname(args.output) if os.path.dirname(args.output) else ".", exist_ok=True)
            os.rename(temp_gen_path, args.output)
            current_image_path = args.output
            print(f"Image moved to: {current_image_path}")
        else:
            current_image_path = temp_gen_path

        # 2. Background Removal (Optional)
        if args.remove_bg:
            if not os.path.exists(args.bg_json):
                print(f"Error: Background removal JSON {args.bg_json} not found.")
                return

            print(f"Uploading {current_image_path} for background removal...")
            uploaded_name = upload_image(args.server, current_image_path)
            print(f"Uploaded successfully as: {uploaded_name}")

            with open(args.bg_json, "r", encoding="utf-8") as f:
                workflow_bg = json.load(f)
            
            updated = False
            for node_id, node_data in workflow_bg.items():
                if "inputs" in node_data and "image" in node_data["inputs"]:
                    # Note: matching logic from original script
                    if node_data["inputs"]["image"] == "dragon1.png" or node_data["inputs"]["image"] == uploaded_name:
                        node_data["inputs"]["image"] = uploaded_name
                        updated = True
            
            if not updated:
                print("Warning: Could not find node to replace in background removal workflow.")
            else:
                print("Running background removal workflow...")
                bg_images = run_workflow(workflow_bg, server_address=args.server)
                
        if bg_images:
            # Look for the actual image output, not the mask
            bg_image_info = None
            for image in bg_images:
                # Check if this node in the history is the one that produced the image (SaveImage)
                # Since run_workflow returns all images from all nodes in the history,
                # we need to check the filename or some other identifier.
                # Looking at utility_birefnet_remove_background.json, the SaveImage node is node "22".
                # But run_workflow doesn't know which node produced which image.
                # However, the background removal workflow's SaveImage node uses "nobackground" as a prefix.
                if "nobackground" in image['filename']:
                    bg_image_info = image
                    break
            
            if bg_image_info:
                bg_download_url = f"http://{args.server}/view?filename={bg_image_info['filename']}&type={bg_image_info['type']}"
                
                # Define where to save the BG removed image
                if args.output:
                    # If we have an output path, let's name the bg removal version uniquely
                    base, ext = os.path.splitext(args.output)
                    bg_output_path = f"{base}_nobg{ext}"
                else:
                    bg_output_path = "removed_bg_image.png"

                with urllib.request.urlopen(bg_download_url) as response:
                    with open(bg_output_path, 'wb') as f:
                        f.write(response.read())
                print(f"Background removed image saved to: {bg_output_path}")
            else:
                print("Could not find the background removed image in the workflow output.")

        else:
            print("Background removal skipped.")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
