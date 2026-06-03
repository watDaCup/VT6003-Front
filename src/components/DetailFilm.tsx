import React from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Spin, Descriptions, Card, Rate } from 'antd'
import { LoadingOutlined, RollbackOutlined } from '@ant-design/icons'
import { api } from '../common/http-common'

interface FilmType {
    ID: number
    title: string
    genre: string
    year: number
    description: string
    rating: number
}

const FilmDetail = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [film, setFilm] = React.useState<FilmType | null>(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        axios.get(`${api.uri}/films/${id}`)
            .then((res) => {
                const filmData = Array.isArray(res.data) ? res.data[0] : res.data
                setFilm(filmData)
                setLoading(false)
            })
            .catch((err) => {
                console.error("Error fetching film details:", err)
                setLoading(false)
            })
    }, [id])

    if (loading) {
        const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />
        return (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
                <Spin indicator={antIcon} />
            </div>
        )
    }

    if (!film) {
        return <div style={{ padding: '24px', textAlign: 'center' }}>There is no film available now.</div>
    }

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <Card title={<h2 style={{ margin: 0, color: 'black' }}>{film.title} ({film.year})</h2>}>
                
                <Descriptions column={1} bordered size="middle">
                    <Descriptions.Item label="Genre">
                        <strong>{film.genre}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Release Year">
                        {film.year}
                    </Descriptions.Item>
                    <Descriptions.Item label="Rating">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Rate disabled allowHalf count={10} value={film.rating} />
                            <span>({film.rating}/10)</span>
                        </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Description">
                        <p style={{ fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
                            {film.description}
                        </p>
                    </Descriptions.Item>
                </Descriptions>

                <Button
                    type="primary"
                    icon={<RollbackOutlined />}
                    onClick={() => navigate(-1)}
                    style={{ marginTop: '24px' }}
                >
                    Back
                </Button>
            </Card>
        </div>
    )
}
export default FilmDetail