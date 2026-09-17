import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Trang quan tri tach rieng o /admin va tai code rieng,
// khach vao web khong phai tai phan quan tri
const AdminApp = lazy(() => import('./components/AdminApp.jsx'))
const laTrangQuanTri = window.location.pathname.replace(/\/+$/, '') === '/admin'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {laTrangQuanTri
      ? <Suspense fallback={null}><AdminApp /></Suspense>
      : <App />}
  </StrictMode>,
)
