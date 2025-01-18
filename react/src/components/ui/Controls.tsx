import React, { useEffect, useState } from 'react';
import { Box, IconButton, Input, Spinner } from '@chakra-ui/react';
import { LuArrowLeft, LuArrowRight, LuLogIn, LuRefreshCcw } from "react-icons/lu";
import { RiRestartFill } from 'react-icons/ri';
import { Tooltip } from './tooltip';
import Settings from './Settings';

// Controls Component
const Controls: React.FC = () => {
    const [width, setWidth] = useState(1280);
    const [currentUrl, setCurrentUrl] = useState<string>('');

    const [navigateLoad, setNavigateLoad] = useState(false)
    const [backLoad, setBackLoad] = useState(false)
    const [forwardLoad, setForwardLoad] = useState(false)
    const [refreshLoad, setRefreshLoad] = useState(false)
    const [restartLoad, setRestartLoad] = useState(false)
    
    useEffect(() => {
        fetch('http://localhost:5000/get_window_size')
            .then(response => response.json())
            .then(data => {
                setWidth(data.width)
            });
        // Fetch current URL from the backend on mount
        fetch('http://localhost:5000/get_current_url')
            .then(response => response.json())
            .then(data => setCurrentUrl(data.current_url));
    }, []);

    const handleBack = async () => {
        setBackLoad(true)
        try {
            // Wait for the fetch request to complete
            await fetch('http://localhost:5000/back', { method: 'POST' });
            // Optionally call updateCurrentUrl() if it's necessary after the fetch request
            
          } catch (error) {
            console.error("Error occurred during back request:", error);
          } finally {
            updateCurrentUrl()
            setBackLoad(false); // Hide the spinner when the fetch is done (or if an error occurs)
        }
    };

    const handleForward = async () => {
        setForwardLoad(true)
        try {
            await fetch('http://localhost:5000/forward', { method: 'POST' });
        } catch(error) {
            console.error("Error occurred during back request:", error);
          } finally {
            updateCurrentUrl()
            setForwardLoad(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshLoad(true)
        try {
            await fetch('http://localhost:5000/refresh', { method: 'POST' })
            .then(response => response.json())
            .then(data => console.log('Navigation successful:', data))
            .catch(error => console.error('Error navigating:', error));;
            
        } catch(error) {
            console.error("Error occurred during back request:", error);
        } finally {
            updateCurrentUrl()
            setRefreshLoad(false);
        }
    };

    const handleSubmitUrl = async () => {
        setNavigateLoad(true)
        const url = currentUrl

        try {
        await fetch('http://localhost:5000/navigate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        })
        .then(response => response.json())
        .then(data => console.log('Navigation successful:', data))
        .catch(error => console.error('Error navigating:', error));
        } catch(error) {
            console.error("Error occurred during back request:", error);
        } finally {
            updateCurrentUrl()
            setNavigateLoad(false)
        }
    };

    const updateCurrentUrl = () => {
    fetch('http://localhost:5000/get_current_url')
        .then(response => response.json())
        .then(data => setCurrentUrl(data.current_url));
    };

    const handleRestart = async () => {
        setRestartLoad(true)
        try {
            await fetch('http://localhost:5000/restart')
        } catch (error) {
            console.error("Error occurred during back request:", error);
        } finally {
            setRestartLoad(false)
            window.location.reload()
        }
    }
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          handleSubmitUrl(); // Call the submit function on Enter key press
        }
    };

    return (
      <Box 
        maxW={`${width}px`}
        width={"100%"}
        maxH="5%"
        display="flex" 
        flexDirection="row" 
        alignItems="center" 
        mb="2"
        gap={2}
        >
        <Box 
          gap={1}
          display="flex" 
          flexDirection="row" 
          alignItems="center"
          >
            { backLoad ? (
                <Spinner/>
            ) : (
                <IconButton onClick={handleBack} mb="1" height="100%">
                    <LuArrowLeft/>
                </IconButton>
            )}
            { forwardLoad ? (
                <Spinner/>
            ) : (
                <IconButton onClick={handleForward} mb="1" height="100%">
                    <LuArrowRight/>
                </IconButton>
            )}
            { refreshLoad ? (
                <Spinner/>
            ) : (
            <IconButton onClick={handleRefresh} mb="1" height="100%">
                <LuRefreshCcw/>
            </IconButton>
            )}
            { restartLoad ? (
                <Spinner/>
            ) : (
                <Tooltip content="Restart browser" >
                    <IconButton onClick={handleRestart} mb="1" height="100%">
                        <RiRestartFill />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
        <Box display="flex" flex={1} width="100%" height="100%">
            <Input
                id="urlInput"
                variant="flushed"
                placeholder="Enter URL here"
                value={currentUrl}
                onChange={(e) => setCurrentUrl(e.target.value)}
                flex="1"
                mb="2"
                onKeyDown={handleKeyDown}
            />
        </Box>
        { navigateLoad ? (
                <Spinner/>
        ) : (
        <IconButton onClick={handleSubmitUrl} mb="1" height="100%">
            <LuLogIn/>
        </IconButton>
        )}
        <Settings/>
      </Box>
    );
  };

export default Controls;