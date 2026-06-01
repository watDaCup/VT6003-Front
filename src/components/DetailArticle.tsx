import React from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Spin } from 'antd'
import { LoadingOutlined, RollbackOutlined } from '@ant-design/icons'
import { api } from '../common/http-common'

interface ArticleType {
    ID: number;
    title: string;
    allText: string;
    authorID: number;
    dateCreated: string;
    dateModified: string | null;
    imageURL: string | null;
    published: boolean | null;
    summary: string | null;
}

const DetailArticle = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [article, setArticle] = React.useState<ArticleType | null>(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        axios.get(`${api.uri}/articles/${id}`)
            .then((res) => {
                setArticle(res.data[0])
                setLoading(false)
            })
            .catch((err) => {
                console.error("Error fetching article details:", err)
                setLoading(false)
            })
    }, [id])

    if (loading) {
        const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />
        return (
            <>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
                    <Spin indicator={antIcon} />
                </div>
            </>
        )
    }

    if (!article) {
        return <div>There is no article available now.</div>;
    } else {
        return (
            <div style={{ padding: '24px' }}>
                <p><strong>Published Date:</strong> {new Date(article.dateCreated).toLocaleDateString()}</p>
                <p><strong>Author ID:</strong> {article.authorID}</p>
                <hr />
                <p style={{ marginTop: '16px', fontSize: '16px' }}>{article.allText}</p>


                <Button
                    type="primary"
                    icon={<RollbackOutlined />}
                    onClick={() => navigate(-1)}
                    style={{ marginTop: '16px' }}
                >
                    Back
                </Button>
            </div>
        )
    }

}
export default DetailArticle