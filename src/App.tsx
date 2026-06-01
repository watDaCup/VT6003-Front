import { Layout, Space } from 'antd'
import './App.css'
import { BrowserRouter as Router,
        Routes, Route, Link
      } from 'react-router-dom'
import Home from './components/Home'
import Dashboard from './components/Dashboard'
import About from './components/About'
import Register from './components/Register'
import Login from './components/Login'
import DetailArticle from './components/DetailArticle'
import NotFound from './components/NotFound'

const { Header, Content, Footer } = Layout

const App = () => {
  return (
    <Router>
      <Header>
        <nav>
          <Space>
            <Link to="/">Home</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/about">About</Link>
          </Space>
        </nav>
      </Header>
      <Content>
        <Routes>
          <Route index element={ <Home/> }/>
          <Route path="/about" element={ <About/> }/>
          <Route path="/dashboard" element={ <Dashboard/> }/>
          <Route path="/register" element={ <Register/> }/>
          <Route path="/login" element={ <Login/> }/>
          <Route path="/a/:id" element={ <DetailArticle/> }/>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Content>
      <Footer>
        <p>VT6003CEM Demo</p>
      </Footer>
    </Router>
  )
}
export default App