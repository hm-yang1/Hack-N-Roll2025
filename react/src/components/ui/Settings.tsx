import { useState } from 'react';
import { MenuItem, Button, Input, MenuRoot, MenuTrigger, MenuContent } from '@chakra-ui/react';
import { toaster } from "@/components/ui/toaster"

import { LuSettings } from 'react-icons/lu';

const SetHomeMenu = () => {
  const [newHome, setNewHome] = useState('');
  const [isInputVisible, setIsInputVisible] = useState(false);

  const handleSetHome = async () => {
    if (!newHome) {
      toaster.create({
        title: 'Error',
        description: 'Please enter a home URL',
        type: 'error',
        action: {
            label: "Close",
            onClick: () => {}
        }
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/set_home', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_home: newHome }),
      });

      const data = await response.json();

      if (response.ok) {
        toaster.create({
          title: 'Success',
          description: `Home changed to ${newHome}`,
          type: 'success',
          action: {
            label: "Close",
            onClick: () => {}
          }
        });
      } else {
        toaster.create({
          title: 'Error',
          description: data.error || 'Failed to change home',
          type: 'error',
          duration: 3000,
          action: {
            label: "Close",
            onClick: () => {}
        }
        });
      }
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: "Error",
        type: 'error',
        duration: 3000,
        action: {
            label: "Close",
            onClick: () => {}
        }
      });
    } finally {
      // Hide input after submission
      setIsInputVisible(false);
      setNewHome('');
    }
  };

  const handleMenuClick = () => {
    setIsInputVisible(true); // Show the input when the MenuItem is clicked
  };

  const handleCancel = () => {
    setIsInputVisible(false); // Hide the input
    setNewHome(''); // Clear the input value
  };

  return (
    <div 
      style={{
        position: 'relative'
      }}>
      <MenuRoot>
        <MenuTrigger>
          <LuSettings/>
        </MenuTrigger>
        <MenuContent zIndex={1} position={"absolute"}>
          <MenuItem value='Change Home' onClick={handleMenuClick}>Change Home</MenuItem>
        </MenuContent>
      </MenuRoot>

      {isInputVisible && (
        <div
            style={{
                position: 'absolute',
                top: '50%', // You can adjust the position as needed
                left: '50%',
                transform: 'translate(-50%, -50%)', // Center the input
                zIndex: 2, // Ensure it appears on top of other content
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                width: '300px',
            }}
        >
          <Input
            value={newHome}
            onChange={(e) => setNewHome(e.target.value)}
            placeholder="Enter new home URL"
            marginTop={4}
          />
          <Button onClick={handleCancel} colorScheme="blue" marginTop={2}>Cancel</Button>
          <Button onClick={handleSetHome} colorScheme="blue" marginTop={2}>Submit</Button>
        </div>
      )}
    </div>
  );
};

export default SetHomeMenu;
