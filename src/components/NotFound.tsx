import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
    const navigate = useNavigate()
    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist or has been moved.</p>
            <br />
            <Button type="primary" onClick={() => navigate('/')}>
                Back to Home
            </Button>
        </div>
    )
}
export default NotFound