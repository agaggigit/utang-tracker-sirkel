import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { CreateGroup } from "./pages/CreateGroup";
import { JoinGroup } from "./pages/JoinGroup";
import { ProtectedRoute } from './components/ProtectedRoute';
import { PWAPrompt } from "./components/PWAPrompt";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard/>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile/>
            </ProtectedRoute>
          } />
          <Route path="/create-group" element={
            <ProtectedRoute>
              <CreateGroup/>
            </ProtectedRoute>
          } />
          <Route path="/join-group" element={
            <ProtectedRoute>
              <JoinGroup/>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>

      <PWAPrompt/>
    </>
  );
}

export default App;
