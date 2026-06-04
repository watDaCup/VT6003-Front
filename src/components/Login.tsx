import React from 'react'
import { Form, Input, Button, Card, message, Row, Col } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from './AuthContext'
import { api } from '../common/http-common'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)

  const onFinish = async (values: any) => {
    setLoading(true)
    const { username, password } = values

    try {
      const clientBackupToken = btoa(`${username}:${password}`)

      const response = await axios.post(
        `${api.uri}/users/login`,
        {},
        {
          headers: {
            Authorization: `Basic ${clientBackupToken}`,
          },
        }
      )

      if (response.status === 200) {
        message.success('Login successful!')
      
        const serverToken = response.data.token; 
        const nestedUserObj = response.data.user;

        const finalToken = serverToken || clientBackupToken;

        // console.log("[DEBUG] Server response:", {
        //   response,
        // });

        // console.log("[DEBUG] Saving session payload to AuthContext:", {
        //   ...nestedUserObj,
        //   email: nestedUserObj?.email,
        //   id: nestedUserObj?.id,
        //   token: finalToken
        // });

        login({
          ...nestedUserObj,    
          email: nestedUserObj?.email,   
          id: nestedUserObj?.id,
          token: finalToken
        })
        
        navigate('/')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      message.error(
        error.response?.data?.message || 'Authentication failed. Please check your credentials.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Row justify="center" align="middle" style={{ minHeight: '80vh' }}>
      <Col xs={22} sm={16} md={12} lg={8}>
        <Card title={<h2 style={{ textAlign: 'center', margin: 0, color: 'black' }}>Account Login</h2>}>
          <Form name="login_form" onFinish={onFinish} layout="vertical">
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: 'Please enter your username!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter your password!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
            </Form.Item>
            <Form.Item style={{ marginTop: '24px' }}>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Log in
              </Button>
            </Form.Item>
          </Form>
        </Card>
        <Link to="/register">Register a new account</Link>
      </Col>
    </Row>
  )
}

export default Login