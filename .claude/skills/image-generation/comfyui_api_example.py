import websocket
import uuid
import json
import urllib.request
import os
import argparse

def queue_prompt(prompt, server_address="127.0.0.1:8188", client_id=None):
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
    url = f"http://{server_address}/view?filename={image_data['filename']}&type={image_data['type']}"
    with urllib.request.urlopen(url) as response:
        with open(filename, 'wb') as f:
            f.write(response.read())

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
        if prompt_id in history:
            for node_id in history[prompt_id]['outputs']:
                node_output = history[prompt_id]['outputs'][node_id]
                if 'images' in node_output:
                    for image in node_output['images']:
                        download_image(server_address, image['filename'], image)
                        print(f"Downloaded: {image['filename']}")
        else:
            print("No history found for this prompt ID.")
    finally:
        ws.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run ComfyUI workflow with optional overrides.")
    parser.add_argument("--prompt", type=str, help="Override the text prompt")
    parser.add_argument("--width", type=int, help="Override the image width")
    parser.add_argument("--height", type=int, help="Override the image height")
    parser.add_argument("--json", type=str, default="image_qwen_Image_2512.json", help="Path to the workflow JSON file")
    parser.add_argument("--server", type=str, default="127.0.0.1:8188", help="ComfyUI server address")
    
    args = parser.parse_args()

    if os.path.exists(args.json):
        try:
            with open(args.json, "r", encoding="utf-8") as f:
                workflow_json = json.load(f)
            
            # Apply overrides
            for node_id, node_data in workflow_json.items():
                if "inputs" in node_data:
                    inputs = node_data["inputs"]
                    if args.prompt and "text" in inputs:
                        inputs["text"] = args.prompt
                    if args.width and "width" in inputs:
                        inputs["width"] = args.width
                    if args.height and "height" in inputs:
                        inputs["height"] = args.height

            run_workflow(workflow_json, server_address=args.server)
        except Exception as e:
            print(f"An error occurred: {e}")
    else:
        print(f"Error: {args.json} not found.")

