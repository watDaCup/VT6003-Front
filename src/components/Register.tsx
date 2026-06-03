import React from 'react'
import { Form, Input, Button, Card, Select, message, Row, Col } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, TeamOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { api } from '../common/http-common'

const Register = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const [form] = Form.useForm()

  const onFinish = async (values: any) => {
    setLoading(true)
    
    const signupPayload = {
      username: values.username,
      password: values.password,
      role: "User",
      email: values.email
    }

    try {
    //   console.log("[DEBUG - Dispatching Signup Payload]:", signupPayload);
      
      const response = await axios.post(
        `${api.uri}/users`,
        signupPayload
      )

      if (response.status === 201) {
        message.success('Account registered successfully! Please log in.')
        navigate('/login')
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      message.error(
        error.response?.data?.message || 'Registration failed. Please check your details and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Row justify="center" align="middle" style={{ minHeight: '85vh', padding: '20px' }}>
      <Col xs={24} sm={18} md={14} lg={10} xl={8}>
        <Card title={<h2 style={{ textAlign: 'center', margin: 0, color: 'black' }}>Create Account</h2>}>
          <Form
            form={form}
            name="register_form"
            onFinish={onFinish}
            layout="vertical"
            initialValues={{ role: 'User' }}
          >
            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: 'Please input your username!' },
                { min: 3, message: 'Username must be at least 3 characters!' }
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="e.g. alice_discoveries" size="large" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please input your email address!' },
                { type: 'email', message: 'Please enter a valid email format!' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="e.g. alice@example.com" size="large" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
            </Form.Item>

            <Form.Item
              name="confirm"
              label="Confirm Password"
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: 'Please confirm your password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('The two passwords do not match!'))
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" size="large" />
            </Form.Item>

            <Form.Item style={{ marginTop: '24px', marginBottom: '8px' }}>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Sign Up
              </Button>
            </Form.Item>
            
            <div style={{ textAlign: 'center' }}>
              Already have an account? <Link to="/login">Log in here</Link>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  )
}

export default Register