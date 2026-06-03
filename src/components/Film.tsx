import React from 'react'
import { Link } from 'react-router-dom'
import { Card, Col, Row, Input, InputNumber, Button, Form, Space, message } from 'antd'
import { HeartOutlined, HeartFilled } from '@ant-design/icons'
import { api } from '../common/http-common'
import axios from 'axios'
import { useAuth } from './AuthContext'

const chunkArray = (arr: any[], size: number) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
    );
};

interface SearchFilters {
    title?: string
    genre?: string
    year?: number
    rating?: number
}

const Film = () => {
    const { isAuthenticated, user } = useAuth()
    const [films, setFilms] = React.useState<any[] | null>(null)
    const [favorites, setFavorites] = React.useState<any[]>([])
    const [showOnlyFavorites, setShowOnlyFavorites] = React.useState<boolean>(false)
    const [filters, setFilters] = React.useState<SearchFilters>({})
    const [form] = Form.useForm()

    const getAuthHeader = React.useCallback(() => {
        if (user && user.token) {
            return { Authorization: `Basic ${user.token}` }
        }
        return {}
    }, [user])

    React.useEffect(() => {
        axios.get(`${api.uri}/films`, {
            params: {
                title: filters.title || undefined,
                genre: filters.genre || undefined,
                year: filters.year || undefined,
                rating: filters.rating || undefined
            }
        })
        .then((res) => {
            setFilms(res.data)
        })
        .catch((err) => {
            console.error("Error fetching films:", err)
        })
    }, [filters])

    const fetchFavorites = React.useCallback(() => {
        if (!isAuthenticated || !user?.id) return

        axios.get(`${api.uri}/users/${user.id}/favorites`, {
            headers: getAuthHeader()
        })
        .then((res) => {
            setFavorites(res.data || [])
        })
        .catch((err) => {
            console.error("Error fetching favorites:", err)
        })
    }, [isAuthenticated, user, getAuthHeader])

    React.useEffect(() => {
        fetchFavorites()
    }, [fetchFavorites])

    const handleToggleFavorite = async (filmId: number) => {
        if (!user?.id) return

        const isAlreadyFav = favorites.some(fav => fav.id === filmId);

        try {
            if (isAlreadyFav) {
                await axios.delete(`${api.uri}/users/${user.id}/favorites/${filmId}`, {
                    headers: getAuthHeader()
                });
                message.success('Removed from favorites')
            } else {
                await axios.post(`${api.uri}/users/${user.id}/favorites/${filmId}`, {}, {
                    headers: getAuthHeader()
                })
                message.success('Added to favorites')
            }
            fetchFavorites(); 
        } catch (err) {
            console.error("Error updating favorite status:", err)
            message.error('Could not update favorites list')
        }
    };

    const onFinish = (values: SearchFilters) => {
        setFilters(values)
    }

    const handleReset = () => {
        form.resetFields()
        setFilters({})
    }

    const displayedFilms = films ? films.filter(film => {
        if (showOnlyFavorites) {
            return favorites.some(fav => fav.id === film.id)
        }
        return true
    }) : []

    const filmRows = chunkArray(displayedFilms, 3)

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ background: '#f5f5f5', padding: '24px', borderRadius: '8px', marginBottom: '30px' }}>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item name="title" label="Film Title">
                              <Input placeholder="e.g. Inception" allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item name="genre" label="Genre">
                                <Input placeholder="e.g. Sci-Fi" allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item name="year" label="Release Year">
                                 <InputNumber placeholder="e.g. 2010" style={{ width: '100%' }} min={1800} max={2100} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                             <Form.Item name="rating" label="Minimum Rating">
                                <InputNumber placeholder="e.g. 8.5" style={{ width: '100%' }} min={0} max={10} step={0.1} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify="space-between" align="middle">
                        <Col>
                            {isAuthenticated && (
                                <Button
                                    type={showOnlyFavorites ? "primary" : "default"}
                                    danger={showOnlyFavorites}
                                    onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                                >
                                    {showOnlyFavorites ? "Show All Films" : "Show Favorites Only"}
                                </Button>
                            )}
                        </Col>
                        <Col>
                            <Space>
                                <Button onClick={handleReset}>Clear Filters</Button>
                                <Button type="primary" htmlType="submit">Search</Button>
                            </Space>
                        </Col>
                    </Row>
                </Form>
            </div>

            {!films ? (
                <div style={{ textAlign: 'center' }}>Loading films...</div>
            ) : displayedFilms.length === 0 ? (
                <div style={{ textAlign: 'center' }}>No films match your search criteria.</div>
            ) : (
                filmRows.map((rowFilms, rowIndex) => (
                    <Row key={rowIndex} justify={'space-around'} style={{ marginBottom: '20px' }}>
                        {rowFilms.map(({ id, title, genre, year, rating, description }) => {
                            const isFavorited = favorites.some(fav => fav.id === id);
                            return (
                                <Col span={8} key={id}>
                                    <Card
                                        style={{ width: 300 }}
                                        actions={isAuthenticated ? [
                                            <div onClick={() => handleToggleFavorite(id)} style={{ cursor: 'pointer' }}>
                                                {isFavorited ? (
                                                    <HeartFilled style={{ color: '#ff4d4f' }} />
                                                ) : (
                                                    <HeartOutlined style={{ color: '#bfbfbf' }} />
                                                )}
                                                <span style={{ marginLeft: 8 }}>Favorite</span>
                                            </div>
                                        ] : undefined}
                                    >
                                        <h2 style={{ color: 'black' }}>{title}({year})</h2>
                                        <p>{description}</p>
                                        <b>Genre: {genre}</b>
                                        <p>Rating: {rating}/10</p>
                                        <Link to={`f/${id}`}>Details</Link>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                ))
            )}
        </div>
    )
}

export default Film