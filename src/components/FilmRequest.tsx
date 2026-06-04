import React, { useState } from 'react'
import { Card, Form, Input, Button, Typography, Space, Row, Col, message } from 'antd'
import { VideoCameraAddOutlined, SendOutlined } from '@ant-design/icons'
import axios from 'axios'
import { api } from '../common/http-common'

const { Title, Text } = Typography
const { TextArea } = Input

const FilmRequest = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState<boolean>(false)

  const onFinish = async (values: any) => {
    setLoading(true)

    const messageText = `[PUBLIC FILM REQUEST]\nFilm Title Suggestion: ${values.title}\nAdditional Information: ${values.notes || 'None provided.'}`

    const payload = {
      film_id: null,
      text: messageText
    }

    const publicCredentialsB64 = btoa('public:public123')
    const config = {
      headers: {
        Authorization: `Basic ${publicCredentialsB64}`
      }
    }

    try {
      const response = await axios.post(
        `${api.uri}/messages`, 
        payload,
        config
      )

      if (response.status === 201) {
        message.success('Your movie request has been successfully posted to the administrator!')
        form.resetFields()
      }
    } catch (error: any) {
      // console.error('[DEBUG - Public Film Request Error]:', error)
      message.error(
        error.response?.data?.message || 'Failed to dispatch request. Please try again later.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Row justify="center" align="middle" style={{ minHeight: '80vh', padding: '20px' }}>
      <Col xs={24} sm={20} md={16} lg={12} xl={10}>
        <Card 
          style={{ borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <VideoCameraAddOutlined style={{ fontSize: '42px', color: '#1890ff' }} />
              <Title level={2} style={{ margin: 0 }}>Request a New Film</Title>
              <Text type="secondary">
                Can't find your favorite movie in CinemaVault? Suggest a title below and our administration team will look into adding it.
              </Text>
            </Space>
          </div>

          <Form
            form={form}
            name="public_film_request_form"
            layout="vertical"
            onFinish={onFinish}
            requiredMark="optional"
          >
            <Form.Item
              name="title"
              label="Suggested Film Title"
              rules={[{ required: true, message: 'Please input the name of the film you want to request!' }]}
            >
              <Input placeholder="e.g., Interstellar, Parasite, etc." size="large" />
            </Form.Item>

            <Form.Item
              name="notes"
              label="Additional Information / Description Notes"
            >
              <TextArea 
                rows={5} 
                placeholder="Provide details such as release year, director, genre, or specific reasons why this film belongs in the database..." 
                size="large"
              />
            </Form.Item>

            <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SendOutlined />} 
                loading={loading} 
                block 
                size="large"
                style={{ borderRadius: '6px', height: '45px', fontSize: '16px', fontWeight: 600 }}
              >
                {loading ? 'Posting Request...' : 'Submit Request'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  )
}

export default FilmRequest