import React, { useState, useEffect, useCallback } from 'react'
import { Table, Button, Space, Modal, Form, Input, InputNumber, Card, Badge, Popconfirm, Typography, message, Row, Col } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, MessageOutlined, VideoCameraOutlined, InboxOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from './AuthContext'
import { api } from '../common/http-common'

const { Title } = Typography
const { TextArea } = Input

interface FilmItem {
    id: number
    title: string
    genre: string | null
    year: number | null
    rating: number | null
    description: string | null
}

const Dashboard = () => {
    const { user, isAuthenticated } = useAuth()
    const navigate = useNavigate()

    const [films, setFilms] = useState<FilmItem[]>([])
    const [pendingCount, setPendingCount] = useState<number>(0)
    const [userMessageCount, setUserMessageCount] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false)

    const [isFilmModalOpen, setIsFilmModalOpen] = useState<boolean>(false)
    const [editingFilm, setEditingFilm] = useState<FilmItem | null>(null)

    const [form] = Form.useForm()

    const getAuthHeader = useCallback(() => {
        if (user && user.token) {
            return { Authorization: `Basic ${user.token}` }
        }
        return {}
    }, [user])

    const fetchFilms = useCallback(async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${api.uri}/films`)
            setFilms(res.data || [])
        } catch (err) {
            console.error('Error fetching films:', err)
            message.error('Failed to load films library.')
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchPendingMessageCounts = useCallback(async () => {
        if (!user || user.role !== 'Admin') return
        try {
            const res = await axios.get(`${api.uri}/messages`, { headers: getAuthHeader() })
            const allMessages: any[] = res.data || []

            const pendingRequests = allMessages.filter(
                msg => msg.from_user_id === 4 && msg.response === null
            ).length
            setPendingCount(pendingRequests)

            const pendingUserTickets = allMessages.filter(
                msg => msg.from_user_id !== 4 && msg.response === null
            ).length
            setUserMessageCount(pendingUserTickets)

        } catch (err) {
            console.error('Error fetching message count details:', err)
        }
    }, [user, getAuthHeader])

    useEffect(() => {
        if (isAuthenticated && user?.role === 'Admin') {
            fetchFilms()
            fetchPendingMessageCounts()
        }
    }, [isAuthenticated, user, fetchFilms, fetchPendingMessageCounts])

    const handleFormSubmit = async (values: any) => {
        try {
            if (editingFilm) {
                const res = await axios.put(
                    `${api.uri}/films/${editingFilm.id}`,
                    values,
                    { headers: getAuthHeader() }
                )
                if (res.status === 200) {
                    message.success('Film updated successfully!')
                }
            } else {
                const res = await axios.post(
                    `${api.uri}/films`,
                    values,
                    { headers: getAuthHeader() }
                )
                if (res.status === 201) {
                    message.success('New film created successfully!')
                }
            }
            setIsFilmModalOpen(false)
            form.resetFields()
            fetchFilms()
        } catch (err: any) {
            console.error('Failed to save film records:', err)
            message.error(err.response?.data?.message || 'Error occurred while saving film records.')
        }
    }

    const handleDeleteFilm = async (id: number) => {
        try {
            const res = await axios.delete(`${api.uri}/films/${id}`, { headers: getAuthHeader() })
            if (res.status === 200) {
                message.success('Film entry successfully deleted.')
                fetchFilms()
            }
        } catch (err: any) {
            console.error('Deletion error execution:', err)
            message.error('Failed to remove targeted film record.')
        }
    }

    if (!isAuthenticated || user?.role !== 'Admin') {
        return (
            <div style={{ textAlign: 'center', padding: '60px' }}>
                <Card style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <Title level={3} type="danger">Access Unauthorized</Title>
                    <p>This control center requires administrative elevation privileges.</p>
                    <Button type="primary" onClick={() => navigate('/login')}>Navigate to Login</Button>
                </Card>
            </div>
        )
    }

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: '70px',
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => <strong>{text}</strong>,
        },
        {
            title: 'Genre',
            dataIndex: 'genre',
            key: 'genre',
            render: (genre: string) => genre || 'N/A',
        },
        {
            title: 'Year',
            dataIndex: 'year',
            key: 'year',
            width: '100px',
            render: (year: number) => year || 'N/A',
        },
        {
            title: 'Rating',
            dataIndex: 'rating',
            key: 'rating',
            width: '100px',
            render: (rating: number) => rating ? `${rating}/10` : 'N/A',
        },
        {
            title: 'Management Operations Desk',
            key: 'actions',
            width: '200px',
            render: (_: any, record: FilmItem) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        ghost
                        icon={<EditOutlined />}
                        onClick={() => handleOpenEditModal(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to remove this film entry?"
                        onConfirm={() => handleDeleteFilm(record.id)}
                        okText="Yes, Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    const handleOpenCreateModal = () => {
        setEditingFilm(null)
        form.resetFields()
        setIsFilmModalOpen(true)
    }

    const handleOpenEditModal = (film: FilmItem) => {
        setEditingFilm(film)
        form.setFieldsValue(film)
        setIsFilmModalOpen(true)
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>

            <Row justify="space-between" align="middle" style={{ marginBottom: '32px', background: '#fafafa', padding: '20px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                <Col>
                    <Space size="middle">
                        <VideoCameraOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                        <div>
                            <Title level={2} style={{ margin: 0 }}>System Management Center</Title>
                            <span style={{ color: '#8c8c8c' }}>Welcome back, administrator account: <strong>{user.username}</strong></span>
                        </div>
                    </Space>
                </Col>

                <Col>
                    <Space size="large">
                        <Badge count={userMessageCount} offset={[-2, 2]} color="#1890ff">
                            <Button
                                type="default"
                                size="large"
                                icon={<MessageOutlined />}
                                onClick={() => navigate('/message')}
                                style={{ display: 'flex', alignItems: 'center' }}
                            >
                                Go to Message Board
                            </Button>
                        </Badge>

                        <Badge count={pendingCount} offset={[-2, 2]} color="#faad14">
                            <Button
                                type="default"
                                size="large"
                                icon={<InboxOutlined />}
                                onClick={() => navigate('/detail-request')}
                                style={{ display: 'flex', alignItems: 'center', borderColor: '#faad14', fontWeight: 500 }}
                            >
                                Film Requests
                            </Button>
                        </Badge>
                        
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlusOutlined />}
                            onClick={handleOpenCreateModal}
                        >
                            Add New Film
                        </Button>
                    </Space>
                </Col>
            </Row>

            <Card title={<span style={{ fontSize: '18px', fontWeight: 600 }}>Active Film Library Database</span>}>
                <Table
                    dataSource={films}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 8 }}
                />
            </Card>

            <Modal
                title={<h2>{editingFilm ? 'Modify Existing Film Specifications' : 'Add New Entry Into Vault'}</h2>}
                open={isFilmModalOpen}
                onCancel={() => {
                    setIsFilmModalOpen(false)
                    form.resetFields()
                }}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    initialValues={{ rating: 5.0, year: new Date().getFullYear() }}
                >
                    <Form.Item
                        name="title"
                        label="Film Title"
                        rules={[{ required: true, message: 'Please input the official film title description!' }]}
                    >
                        <Input placeholder="e.g., The Dark Knight" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="genre" label="Genre Category Theme">
                                <Input placeholder="e.g., Action / Drama" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="year" label="Release Year">
                                <InputNumber min={1880} max={2100} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="rating" label="Score Rating">
                                <InputNumber min={0.0} max={10.0} step={0.1} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="description" label="Plot Summary / Description Overview">
                        <TextArea rows={4} placeholder="Write a short summary profile synopsis..." />
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right', marginBottom: 0, marginTop: '24px' }}>
                        <Space>
                            <Button onClick={() => {
                                setIsFilmModalOpen(false)
                                form.resetFields()
                            }}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingFilm ? 'Save Modifications' : 'Publish Entry'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

        </div>
    )
}

export default Dashboard