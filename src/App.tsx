import { Layout, Space } from 'antd'
import './App.css'
import {
  BrowserRouter as Router,
  Routes, Route, Link
} from 'react-router-dom'
import Home from './components/Home'
import Dashboard from './components/Dashboard'
import Register from './components/Register'
import Login from './components/Login'
import DetailFilm from './components/DetailFilm'
import NotFound from './components/NotFound'
import Message from './components/Message'
import Profile from './components/Profile'
import { useAuth } from './components/AuthContext'

const { Header, Content, Footer } = Layout

const App = () => {
  const { isAuthenticated, logout, user } = useAuth();
  return (
    <Router>
      <Header>
        <nav>
          <Space>
            <Link to="/">Home</Link>
            {!isAuthenticated ? (
              <Link to="/login">Login</Link>
            ) : (
              <>
                {user?.role === 'Admin' ? (
                  <Link to="/dashboard">Dashboard</Link>
                ) : (
                  <Link to="/message">Message</Link>
                )}
                <Link to="/profile">Profile</Link>
                <Link
                  to="#"
                  role="button"
                  onClick={(e) => {
                    e.preventDefault() 
                    logout()          
                    window.location.href = '/'
                  }}
                >
                  Logout
                </Link>
              </>
            )}
          </Space>
        </nav>
      </Header>
      <Content>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/f/:id" element={<DetailFilm />} />
          <Route path="/message" element={<Message />}/>
          <Route path="*" element={<NotFound />} />
          <Route path="/profile" element={<Profile />}/>
        </Routes>
      </Content>
      <Footer>
        <p>VT6003CEM Demo</p>
      </Footer>
    </Router>
  )
}
export default App