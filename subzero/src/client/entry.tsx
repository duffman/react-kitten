import { createRoot } from 'react-dom/client'
import { SubZeroClient } from './SubZeroClient'

const root = document.getElementById('root')!
const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
const endpoint = `${protocol}//${location.host}${root.dataset.endpoint ?? '/subzero'}${location.search}`

createRoot(root).render(<SubZeroClient url={endpoint} />)
