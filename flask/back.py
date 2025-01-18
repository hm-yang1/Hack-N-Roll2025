import time
import threading
from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:5000"])
socketio = SocketIO(app=app, async_mode='threading', cors_allowed_origins=["http://localhost:5173", "http://localhost:5000"])

window_width = 1280
window_height = 800
options = webdriver.ChromeOptions()
# options.add_argument("--disable-gpu")
options.add_argument("--headless")
options.add_argument('--no-sandbox')
options.add_argument(f"--window-size={window_width},{window_height}")
options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')

# service = Service(ChromeDriverManager().install())

driver = webdriver.Chrome(options=options)
# driver.set_window_size(window_width, window_height)

home = "http://localhost:5173"

def generate_frames():
    frame_rate = 30  # Target frame rate
    frame_interval = 1 / frame_rate  # Time between frames

    while True:
        start_time = time.time()  # Record start time for frame timing

        try:
            # Capture screenshot as base64
            screenshot = driver.get_screenshot_as_base64()
            yield screenshot
        except Exception as e:
            print(f"Error generating frames: {e}")
            break  # Exit the loop if an error occurs

        # Maintain target frame rate
        elapsed_time = time.time() - start_time
        time.sleep(max(0, frame_interval - elapsed_time))

# WebSocket route to stream video
@socketio.on('start_stream')
def start_stream():
    for frame in generate_frames():
        # Send the Base64-encoded frame to the client
        emit('frame', frame)

# HTML route to show the stream (basic)
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/click', methods=['POST'])
def handle_click():
    data = request.json
    frontend_x, frontend_y = data['x'], data['y']

    print("CLick at")
    
    # Get the actual viewport window size (already set to 1280x720)
    browser_width = driver.execute_script("return window.innerWidth;")
    browser_height = driver.execute_script("return window.innerHeight;")

    if frontend_x > browser_width:
        frontend_x = browser_width
    if frontend_y > browser_width:
        frontend_y = browser_height

    # Disables window.open()
    driver.execute_script("""
    const links = document.querySelectorAll('a[target="_blank"]');
    links.forEach(link => link.removeAttribute('target'));
    """)

    # Perform the click at the scaled coordinates
    action = ActionChains(driver)
    action.move_by_offset(frontend_x, frontend_y).click().perform()
    time.sleep(0.5)

    action.move_by_offset(-frontend_x, -frontend_y).perform()  # Reset cursor position
    time.sleep(0.5)
    return 'OK', 200

@app.route('/type', methods=['POST'])
def handle_typing():
    text = request.json['text']
    print(text)
    
    action = ActionChains(driver)
    
    if text == 'Enter':
        # Perform the Enter key action
        action.send_keys("\n").perform()
    elif text == 'Backspace':
        # Perform the Backspace key action
        action.send_keys("\b").perform()
    elif text == 'ArrowDown':
        action.send_keys(Keys.ARROW_DOWN).perform()
    elif text == 'ArrowUp':
        action.send_keys(Keys.ARROW_UP).perform()
    elif text == 'ArrowLeft':
        action.send_keys(Keys.ARROW_LEFT).perform()
    elif text == 'ArrowRight':
        action.send_keys(Keys.ARROW_RIGHT).perform()
    else:
        # For all other keys, type them normally
        action.send_keys(text).perform()
    
    return 'OK', 200

@app.route('/scroll', methods=['POST'])
def handle_scroll():
    data = request.json
    delta_x = data.get('deltaX', 0)  # Default horizontal scroll is 0
    delta_y = data.get('deltaY', 0)  # Default vertical scroll is 0

    # Execute JavaScript to scroll the window by the specified amounts
    driver.execute_script(f"window.scrollBy({delta_x}, {delta_y});")

    return {"status": "success"}, 200

@app.route('/back', methods=['POST'])
def go_back():
    print("Navigating back")
    driver.back()  # Go to the previous page
    return {"status": "success", "action": "back"}

@app.route('/forward', methods=['POST'])
def go_forward():
    print("Navigating forward")
    driver.forward()  # Go to the next page
    return {"status": "success", "action": "forward"}

@app.route('/refresh', methods=['POST'])
def refresh_page():
    print("Refreshing page")
    driver.refresh()  # Refresh the current page
    return {"status": "success", "action": "refresh"}

@app.route('/navigate', methods=['POST'])
def navigate():
    try:
        # Get the URL from the request data
        data = request.json
        url = data.get('url')

        if not url:
            return jsonify({'error': 'No URL provided'}), 400

        # Use Selenium to navigate to the provided URL
        driver.get(url)

        return jsonify({'message': f'Navigated to {url}'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_window_size', methods=['GET'])
def get_window_size():
    # Calculate and print the actual viewport size
    viewport_width = driver.execute_script("return window.innerWidth;")
    viewport_height = driver.execute_script("return window.innerHeight;")

    print(f"Viewport size: {viewport_width} x {viewport_height}")

    return {
        'width': viewport_width,
        'height': viewport_height
    }

@app.route('/get_current_url', methods=['GET'])
def get_current_url():
    # Get the current URL
    current_url = driver.current_url

    # Return the current URL as a JSON response
    return jsonify({'current_url': current_url})

@app.route('/restart', methods=['GET'])
def restart():
    global driver
    
    driver = webdriver.Chrome(options=options)
    driver.get(home)
    return jsonify({'message': 'success'})

@app.route('/set_home', methods=['POST'])
def set_home():
    global home
    
    try:
        # Get the URL from the request data
        data = request.json
        new_home = data.get('new_home')

        if not new_home:
            return jsonify({'error': 'No HOME provided'}), 400
        
        home = new_home
        
        return jsonify({'message': f'Changed home to {new_home}'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

if __name__ == '__main__':
    # Start Selenium
    driver.get(home)

    # Start Flask
    app.run(host="0.0.0.0", port="5000", debug=True)