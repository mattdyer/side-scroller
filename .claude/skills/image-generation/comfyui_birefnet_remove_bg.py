import websocket
import uuid
import json
import urllib.request
import os
import argparse
import mimetypes

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
        prompt_id_resp = queue_prompt(prompt, server_address=server_address, client_id=client_id)
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
            elif message:
                # Note: checking for progress is good for logging, 
                # but success/error are the main triggers to stop.
                if message.get('type') == 'progress':
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
    parser = argparse.ArgumentParser(description="Run background removal workflow.")
    parser.add_argument("image_path", type=str, help="Path to the input image")
    parser.add_argument("--json", type=str, default="utility_birefnet_remove_background.json", help="Path to the workflow JSON file")
    parser.add_argument("--server", type=str, default="127.0.0.1:8188", help="ComfyUI server address")
    
    args = parser.parse_args()

    if os.path.exists(args.image_path):
        if os.path.exists(args.json):
            try:
                print(f"Uploading {args.image_path}...")
                uploaded_name = upload_image(args.server, args.image_path)
                print(f"Uploaded successfully as: {uploaded_name}")

                with open(args.json, "r", encoding="utf-8") as f:
                    workflow_json = json.load(f)
                
                updated = False
                for node_id, node_data in workflow_json.items():
                    if "inputs" in node_data and "image" in node_data["inputs"]:
                        if node_data["inputs"]["image"] == "dragon1.png":
                            node_data["inputs"]["image"] = uploaded_name
                            updated = True
                
                if not updated:
                    print("Warning: Could not find node with 'dragon1.png' to replace.")
                else:
                    print(f"Updated workflow with uploaded image: {uploaded_name}")

                run_workflow(workflow_json, server_address=args.server)

            except Exception as e:
                print(f"An error occurred: {e}")
        else:
            print(f"Error: {args.json} not found.")
    else:
        print(f"Error: Input image {args.image_path} not found.")
