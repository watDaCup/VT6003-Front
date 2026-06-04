import React, { useState, useEffect, useCallback } from 'react'
import { Card, Button, Tag, Space, Typography, Empty, message, Row, Col } from 'antd'
import { EyeOutlined, ArrowLeftOutlined, InboxOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from './AuthContext'
import { api } from '../common/http-common'

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

const DetailRequest = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState<MessageItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const getAuthHeader = useCallback(() => {
    if (user && user.token) {
      return { Authorization: `Basic ${user.token}` }
    }
    return {}
  }, [user])

  const fetchFilmRequests = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'Admin') return
    setLoading(true)
    try {
      const res = await axios.get(`${api.uri}/messages`, { headers: getAuthHeader() })
      const allMessages: MessageItem[] = res.data || []
      
      const isolatedRequests = allMessages.filter(msg => msg.from_user_id === 4)
      setRequests(isolatedRequests)
    } catch (err: any) {
      console.error('Error compiling public film request database registry:', err)
      message.error('Failed to parse incoming public catalog requests.')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user, getAuthHeader])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'Admin') {
      fetchFilmRequests()
    }
  }, [isAuthenticated, user, fetchFilmRequests])

  const handleMarkAsSeen = async (requestId: number) => {
    try {
      const res = await axios.post(
        `${api.uri}/messages/${requestId}/respond`,
        { response: 'Seen' },
        { headers: getAuthHeader() }
      )
      if (res.status === 200) {
        message.success('Film recommendation marked as checked.')
        fetchFilmRequests()
      }
    } catch (err: any) {
      console.error('Failed processing request state transition updates:', err)
      message.error('Error changing notification entry status.')
    }
  }

  if (!isAuthenticated || user?.role !== 'Admin') {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <Card style={{ maxWidth: '500px', margin: '0 auto' }}>
          <Title level={3} type="danger">Access Denied</Title>
          <p>Administrative authentication elevation tokens are required for this deck panel view.</p>
          <Button type="primary" onClick={() => navigate('/login')}>Login</Button>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Space size="middle">
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')} type="text" />
            <InboxOutlined style={{ fontSize: '28px', color: '#faad14' }} />
            <Title level={2} style={{ margin: 0, color: 'white', outline: 'black'  }}>Anonymous Guest Film Requests Panel</Title>
          </Space>
        </Col>
      </Row>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Parsing unread system logs...</div>
      ) : requests.length === 0 ? (
        <Empty description="No public requests located inside database memory." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {requests.map((req) => (
            <Card
              key={req.id}
              style={{
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                borderLeft: req.response ? '5px solid #52c41a' : '5px solid #faad14'
              }}
            >
              <Row justify="space-between" align="middle" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '8px', marginBottom: '12px' }}>
                <Col>
                  <Space>
                    <Tag color="orange">Guest Account Tier (ID 4)</Tag>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {new Date(req.created_at).toLocaleString()}
                    </Text>
                  </Space>
                </Col>
                <Col>
                  {req.response ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">Processed ({req.response})</Tag>
                  ) : (
                    <Tag icon={<ClockCircleOutlined />} color="warning">Pending Review</Tag>
                  )}
                </Col>
              </Row>

              <div style={{ padding: '4px 0 16px 0' }}>
                <Text style={{ fontSize: '14px', whiteSpace: 'pre-wrap', display: 'block', color: '#262626' }}>
                  {req.text}
                </Text>
              </div>

              {!req.response && (
                <Row justify="end">
                  <Button
                    type="primary"
                    ghost
                    icon={<EyeOutlined />}
                    size="middle"
                    onClick={() => handleMarkAsSeen(req.id)}
                  >
                    Seen
                  </Button>
                </Row>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default DetailRequest