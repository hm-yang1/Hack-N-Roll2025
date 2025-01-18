import { VStack } from '@chakra-ui/react';
import Controls from './components/ui/Controls';
import VideoStream from './components/ui/VideoStream';

import './App.css'

function App() {
  return (
    <>
      <VStack display="flex" alignItems="top" width={"99%"} >
        <Controls/>
        <VideoStream/>
      </VStack>
    </>
  )
}

export default App
