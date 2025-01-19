import { Skeleton } from '@chakra-ui/react/skeleton';
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { throttle } from "lodash";
import { BACKEND_API_URL } from '@/constants';


interface WindowSize {
  width: number;
  height: number;
}


const VideoStream: React.FC = () => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loading, setLoading] = useState(true);

  // Function to set the stream image size based on window size
  const setStreamImageSize = async () => {
    try {
      const response = await fetch(BACKEND_API_URL + '/get_window_size');
      const data: WindowSize = await response.json();
      if (imgRef.current) {
        imgRef.current.style.width = `${data.width}px`;
        imgRef.current.style.height = "auto";
      }
      console.log(data.width)
      console.log(data.height)
    } catch (error) {
      console.error('Error setting stream image size:', error);
    }
  };

  useEffect(() => {
    setLoading(true);
    // Initialize stream and fetch initial data
    setStreamImageSize();

    // Set up the WebSocket for streaming
    const socket = io.connect(BACKEND_API_URL);

    // Start the stream on connection
    socket.emit('start_stream');
    setLoading(false);

    // Listen for incoming frames and update the image element
    socket.on('frame', (frame: string) => {
      if (imgRef.current) {
        imgRef.current.src = `data:image/jpeg;base64,${frame}`;
      }
    });

    window.addEventListener('keydown', handleKeys);

    // Cleanup WebSocket connection on component unmount
    return () => {
      socket.disconnect();
      window.removeEventListener('keydown', handleKeys);
    };
  }, []);

  const handleImageClick = async (e: React.MouseEvent) => {
    if (imgRef.current) {
      document.body.style.cursor = 'wait';
      const rect = imgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      console.log(`Click at: ${x}, ${y}`);
      // Send the click coordinates to the backend
      await fetch(BACKEND_API_URL+'/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          x,
          y,
          frontend_width: rect.width,
          frontend_height: rect.height,
        }),
      }).catch((err) => console.error('Error sending click event:', err));

      setTimeout(() => {
      }, 2000); // 2 debounce time
      document.body.style.cursor = 'default';
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the right-click context menu
    console.log('Right-click disabled on the image');
  };

  const handleKeys = (e: KeyboardEvent) => {
    fetch(BACKEND_API_URL+'/type', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: e.key }),
    })
      .then((response) => console.log(response))
      .then((data) => console.log('Keypress registered:', data))
      .catch((err) => console.error('Error sending keypress:', err));
  };

  const handleWheel = throttle((e: React.WheelEvent) => {
    const deltaX = e.deltaX;
    const deltaY = e.deltaY;

    // Send scroll data to the backend
    fetch(BACKEND_API_URL+'/scroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deltaX, deltaY }),
    }).catch((err) => console.error('Error sending scroll event:', err));
  }, 100);

  return (
    <div>
      {loading ? (
        // Skeleton is shown while loading
        <Skeleton width="1280px" height="581px" />
      ) : (
        // Image is shown once loading is complete
        <img
          id="stream"
          ref={imgRef}
          style={{ border: '1px solid black', width:"100%" , height:"auto" }}
          onClick={handleImageClick}
          onContextMenu={handleRightClick}
          onWheel={handleWheel}
          alt="Video Stream"
        />
      )
      }
    </div>
  );
};

export default VideoStream;
