import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { system } from './theme.tsx'

import './index.css'
import App from './App.tsx'
import { ColorModeProvider } from './components/ui/color-mode.tsx'

createRoot(document.getElementById('root')!).render(
    <ChakraProvider value={system}>
      <ColorModeProvider defaultTheme=''>
        <App />
      </ColorModeProvider>
    </ChakraProvider>
)
