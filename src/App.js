import './index.css';
import AppConfirmation from './pages/AppConfirmation';


import ThemeProvider from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import PrivateRoute from './router/PrivateRoute';
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <div className="App">
              <PrivateRoute>
                <AppConfirmation />
              </PrivateRoute>
            </div>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider></BrowserRouter>

  );
}

export default App;
