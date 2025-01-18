# Kill any process running on port 5000
echo "Killing processes on port 5000..."
lsof -t -i:5000 | xargs kill -9