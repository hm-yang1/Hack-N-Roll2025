#!/bin/bash
# Start Flask backend server
echo "Starting Flask backend..."
cd /Users/hm/Documents/GitHub/Hack-N-Roll2025/flask
python3 -m pip install -r requriements.txt
python3 back.py &
# Start React frontend server
echo "Starting React frontend..."
cd /Users/hm/Documents/GitHub/Hack-N-Roll2025/react
npm run dev &
echo "Opening Chrome at localhost:5173..."
open -a "Google Chrome" http://localhost:5173
# Wait for both servers to be stopped
wait