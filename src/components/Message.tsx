import { useState, useEffect, useCallback } from 'react'
import { Card, Button, Modal, Form, Input, Select, Tag, Space, Typography, Empty, message, Row, Col } from 'antd'
import { CommentOutlined, PlusOutlined, SendOutlined, CheckCircleOutlined, ClockCircleOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons'
import axios from 'axios'
import { useAuth } from './AuthContext'
import { api } from '../common/http-common'

const { TextArea } = Input
const { Title, Text } = Typography

interface MessageItem {
  id: number
  from_user_id: number
  to_user_id: number
  film_id: number | null
  text: string
  response: string | null
  created_at: string
}

interface FilmItem {
  id: number
  title: string
}

const Message = () => {
  const { user, isAuthenticated } = useAuth()
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [films, setFilms] = useState<FilmItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isRespondModalOpen, setIsRespondModalOpen] = useState<boolean>(false)

  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(null)

  const [form] = Form.useForm()
  const [respondForm] = Form.useForm()

  const getAuthHeader = useCallback(() => {
    if (user && user.token) {
      return { Authorization: `Basic ${user.token}` }
    }
    return {}
  }, [user])

  const fetchMessages = useCallback(async () => {
    if (!isAuthenticated || !user) return
    setLoading(true)
    try {
      let endpoint = `${api.uri}/messages`

      if (user.role === 'User') {
        endpoint = `${api.uri}/messages/user/${user.id}`
      }

      const res = await axios.get(endpoint, { headers: getAuthHeader() })
      setMessages(res.data || [])
    } catch (err: any) {
      console.error('Error loading messages data:', err)
      message.error('Failed to load message registry.')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user, getAuthHeader])

  const fetchFilms = useCallback(async () => {
    try {
      const res = await axios.get(`${api.uri}/films`)
      setFilms(res.data || [])
    } catch (err) {
      console.error('Error pre-loading film items catalogs:', err)
    }
  }, [])

  useEffect(() => {
    fetchMessages()
    fetchFilms()
  }, [fetchMessages, fetchFilms])

  const handleCreateMessage = async (values: any) => {
    try {
      const payload = {
        film_id: values.film_id || null,
        text: values.text
      }

      const res = await axios.post(`${api.uri}/messages`, payload, {
        headers: getAuthHeader(),
      })

      if (res.status === 201) {
        message.success('Message queued and dispatched to admin successfully.')
        setIsModalOpen(false)
        form.resetFields()
        fetchMessages()
      }
    } catch (err: any) {
      console.error('Message creation failed:', err)
      message.error(err.response?.data?.message || 'Could not dispatch message.')
    }
  }

  const handleAdminRespond = async (values: any) => {
    if (!selectedMessage) return
    try {
      const res = await axios.post(
        `${api.uri}/messages/${selectedMessage.id}/respond`,
        { response: values.response },
        { headers: getAuthHeader() }
      )

      if (res.status === 200) {
        message.success('Response successfully populated.')
        setIsRespondModalOpen(false)
        respondForm.resetFields()
        setSelectedMessage(null)
        fetchMessages()
      }
    } catch (err: any) {
      console.error('Failed saving message response matrix:', err)
      message.error(err.response?.data?.message || 'Could not update message entry.')
    }
  }

  const handleDeleteMessage = async (id: number) => {
    try {
      const res = await axios.delete(`${api.uri}/messages/${id}`, {
        headers: getAuthHeader()
      })
      if (res.status === 200) {
        message.success('Message record deleted.')
        fetchMessages()
      }
    } catch (err: any) {
      console.error('Error running message deletion:', err)
      message.error('Could not complete erasure.')
    }
  }

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Empty description="Access Denied. Please authenticate to open the message terminal." />
      </div>
    )
  }

  const filteredMessages = messages.filter((msg) => msg.from_user_id !== 4)

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>

      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Space size="middle">
            <CommentOutlined style={{ fontSize: '28px' }} />
            <Title level={2} style={{ margin: 0, color: 'white' }}>
              {user?.role === 'Admin' ? 'Administrative Feedback Moderation' : 'Support Ticket Message Board'}
            </Title>
          </Space>
        </Col>
        <Col>
          {user?.role === 'User' && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => setIsModalOpen(true)}
            >
              Compose New Message
            </Button>
          )}
        </Col>
      </Row>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading conversation history...</div>
      ) : filteredMessages.length === 0 ? (
        <Empty description="No message transactions registered on this account profile tier." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredMessages.map((msg) => {
            const linkedFilm = films.find(f => f.id === msg.film_id)

            return (
              <Card
                key={msg.id}
                style={{
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  borderLeft: msg.response ? '5px solid #52c41a' : '5px solid #faad14'
                }}
                bodyStyle={{ padding: '20px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px', marginBottom: '12px' }}>
                  <Space size="small">
                    <UserOutlined style={{ color: '#8c8c8c' }} />
                    <Text strong style={{ color: '#262626' }}>
                      {user?.role === 'Admin' ? `User ID: ${msg.from_user_id}` : 'From: You'}
                    </Text>
                    <Text type="secondary">→</Text>
                    <MessageOutlined style={{ color: '#8c8c8c' }} />
                    <Text strong style={{ color: '#262626' }}>To: System Administrator</Text>
                  </Space>

                  <Space>
                    {linkedFilm && (
                      <Tag color="blue">Film Reference: {linkedFilm.title}</Tag>
                    )}
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {new Date(msg.created_at).toLocaleString()}
                    </Text>
                  </Space>
                </div>

                <div style={{ padding: '8px 0 16px 0' }}>
                  <Text style={{ fontSize: '15px', whiteSpace: 'pre-wrap', color: '#434343' }}>
                    {msg.text}
                  </Text>
                </div>

                <div style={{
                  background: msg.response ? '#f6ffed' : '#fffbe6',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  border: msg.response ? '1px solid #b7eb8f' : '1px solid #ffe58f',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '4px' }}>
                      {msg.response ? (
                        <Tag icon={<CheckCircleOutlined />} color="success">Admin Response Received</Tag>
                      ) : (
                        <Tag icon={<ClockCircleOutlined />} color="warning">Awaiting Admin Response</Tag>
                      )}
                    </div>
                    {msg.response ? (
                      <Text style={{ display: 'block', fontStyle: 'italic', color: '#1f2d3d', marginTop: '6px' }}>
                        "{msg.response}"
                      </Text>
                    ) : (
                      <Text type="secondary" style={{ fontStyle: 'italic', fontSize: '13px' }}>
                        Your inquiry has been logged. Our administration desk is reviewing your ticket.
                      </Text>
                    )}
                  </div>

                  {user?.role === 'Admin' && (
                    <Space style={{ marginLeft: '16px' }}>
                      {!msg.response && (
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => {
                            setSelectedMessage(msg)
                            setIsRespondModalOpen(true)
                          }}
                        >
                          Provide Response
                        </Button>
                      )}
                      <Button
                        danger
                        type="text"
                        size="small"
                        onClick={() => handleDeleteMessage(msg.id)}
                      >
                        Delete
                      </Button>
                    </Space>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        title={<h2>Compose Ticket Request</h2>}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateMessage}>
          <Form.Item name="film_id" label="Contextual Movie Association (Optional)">
            <Select placeholder="Select a film entry to tag onto this query string" allowClear>
              {films.map(f => (
                <Select.Option key={f.id} value={f.id}>{f.title}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="text"
            label="Message Details"
            rules={[{ required: true, message: 'Please input the body details text content!' }]}
          >
            <TextArea rows={5} placeholder="Provide information regarding your catalog data request..." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
                Submit Inquiry
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<h2>Respond to Message Entry</h2>}
        open={isRespondModalOpen}
        onCancel={() => {
          setIsRespondModalOpen(false)
          respondForm.resetFields()
          setSelectedMessage(null)
        }}
        footer={null}
      >
        {selectedMessage && (
          <div style={{ marginBottom: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
            <Text type="secondary" style={{ fontSize: '12px', marginBottom: '4px' }}>Original Message String:</Text>
            <Text style={{ whiteSpace: 'pre-wrap' }}>{selectedMessage.text}</Text>
          </div>
        )}

        <Form form={respondForm} layout="vertical" onFinish={handleAdminRespond}>
          <Form.Item
            name="response"
            label="Official Response Text"
            rules={[{ required: true, message: 'Please input the resolution details text!' }]}
          >
            <TextArea rows={4} placeholder="Type the structural official response updates..." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsRespondModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" icon={<CheckCircleOutlined />}>
                Post Response
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  )
}

export default Message