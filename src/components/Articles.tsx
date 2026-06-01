import { Link, Route, Routes } from 'react-router-dom'
import React from 'react'
import { Card, Col, Row } from 'antd'
import { api } from '../common/http-common'
import axios from 'axios'

const access_token = btoa(`alice:lmao`)

axios.get(`${api.uri}/private`, {
    headers: {
        'Authorization': `Basic ${access_token}`
    }
})

const Article = () => {
    const [articles, setArticles] = React.useState(null)
    React.useEffect(() => {
        axios.get(`${api.uri}/articles`)
            .then((res) => {
                setArticles(res.data)
            })
    }, [])

    if (!articles) {
        return (
            <div>There is no article available now.</div>
        )
    } else {
        return (
            <Row justify={'space-around'}>
                {
                    articles &&
                    articles.map(({ ID, title, allText }) => (
                        <Col span={8} key={ID}>
                            <Card title={title} style={{ width: 300 }} bordered={true}>
                                <p>{allText}</p>
                                <p></p>
                                <Link to={`a/${ID}`}>Details</Link>
                            </Card>
                        </Col>))
                }
            </Row>
        )
    }
}
export default Article