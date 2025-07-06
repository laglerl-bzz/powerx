import { Route, Routes } from "react-router-dom"
import Navbar from "./components/ui/navbar"
import HomePage from "./components/home-page"
import UploadPage from "./components/upload-page"
import { ThemeProvider } from "./components/theme-provider"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="powerx-ui-theme">
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
        </Routes>
      </div>
    </ThemeProvider>
  )
}

export default App
