import './index.css';
import AppConfirmation from './pages/AppConfirmation';


import ThemeProvider from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import PrivateRoute from './router/PrivateRoute';
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <LanguageProvider>
              <div className="App">
                <PrivateRoute>
                  <AppConfirmation />
                </PrivateRoute>
              </div>
            </LanguageProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider></BrowserRouter>

  );
}

export default App;
