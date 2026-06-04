import React, { useState, useEffect } from 'react'
import { Card, Avatar, Upload, Button, Descriptions, message, Row, Col } from 'antd'
import { UserOutlined, UploadOutlined } from '@ant-design/icons'
import axios from 'axios'
import { useAuth } from './AuthContext'
import { api } from '../common/http-common'

const Profile = () => {
  const { user, login } = useAuth()
  const [uploading, setUploading] = useState(false)

//   useEffect(() => {
//     console.log("[DEBUG - Profile Component Auth State]:", { 
//       hasUser: !!user, 
//       userId: user?.id, 
//       username: user?.username,
//       email: user?.email,
//       role: user?.role,
//       hasToken: !!user?.token,
//       hasPhoto: !!user?.profile_photo 
//     });
//   }, [user])

  const getAuthHeader = () => {
    if (user && user.token) {
      const authHeader = { Authorization: `Basic ${user.token}` };
    //   console.log("[DEBUG - Generated Auth Header]:", authHeader);
      return authHeader;
    }
    // console.warn("[DEBUG - getAuthHeader Warning]: Cannot build header. Token or user object is missing!", { user });
    return {}
  }

  const handlePhotoUpload = async (file: File) => {
    // console.log("[DEBUG - Photo Upload Triggered]: Selected file metadata:", {
    //   name: file.name,
    //   size: `${(file.size / 1024).toFixed(2)} KB`,
    //   type: file.type
    // });

    if (!user?.id) {
    //   console.error("[DEBUG - Upload Blocked]: Action terminated because user.id is missing or undefined.");
      message.error("User session missing.")
      return false
    }

    setUploading(true)

    const reader = new FileReader()
    reader.readAsDataURL(file)
    
    reader.onload = async () => {
      try {
        const base64String = reader.result as string
        // console.log("[DEBUG - FileReader Success]: Base64 compilation complete string snippet:", base64String.substring(0, 50) + "...");

        const targetUrl = `${api.uri}/users/${user.id}/photo`;
        // console.log(`[DEBUG - Sending POST Request to]: ${targetUrl}`);

        const response = await axios.post(
          targetUrl,
          { data: base64String },
          { headers: getAuthHeader() }
        )

        // console.log("[DEBUG - Server Response received]:", {
        //   status: response.status,
        //   statusText: response.statusText,
        //   data: response.data
        // });

        if (response.status === 200) {
          message.success("Profile photo updated successfully!")

          const updatedUser = {
            ...user,
            profile_photo: base64String
          }
          
        //   console.log("[DEBUG - Updating Auth State via login()]: Syncing new profile image string to session.");
          login(updatedUser)
        }
      } catch (error: any) {
        // console.error("[DEBUG - Photo Upload Server Error]: Full exception trace:", error);
        // if (error.response) {
        //   console.error("[DEBUG - Error Response Payload from server]:", {
        //     status: error.response.status,
        //     data: error.response.data
        //   });
        // }
        message.error(error.response?.data?.message || "Failed to upload profile photo.")
      } finally {
        setUploading(false)
      }
    }

    reader.onerror = (error) => {
    //   console.error("[DEBUG - FileReader Error]: Local compilation failed:", error);
      message.error("Failed to process selected file.")
      setUploading(false)
    }

    return false
  }

  if (!user) {
    // console.warn("[DEBUG - Profile Render Blocked]: Rendering guest notification layout because user data context is empty.");
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        Please log in to view your profile settings.
      </div>
    )
  }

  return (
    <Row justify="center" align="middle" style={{ minHeight: '80vh', padding: '20px' }}>
      <Col xs={24} sm={20} md={16} lg={12} xl={10}>
        <Card
          title={<h2 style={{ textAlign: 'center', margin: 0, color: 'black' }}>User Profile</h2>}
          style={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>

            <div style={{
              border: '4px solid #f0f0f0',
              borderRadius: '50%',
              padding: '4px',
              marginBottom: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <Avatar
                size={140}
                src={user.profile_photo || undefined}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1890ff' }}
              />
            </div>

            <Upload
              beforeUpload={handlePhotoUpload}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} loading={uploading}>
                {uploading ? 'Uploading...' : 'Change Photo'}
              </Button>
            </Upload>
          </div>

          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="Username">
              <strong>{user.username}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Email Address">
              {user.email}
            </Descriptions.Item>
            <Descriptions.Item label="Account Type / Role">
              {user.role}
            </Descriptions.Item>
            <Descriptions.Item label="User Identification Key (ID)">
              {user.id}
            </Descriptions.Item>
          </Descriptions>

        </Card>
      </Col>
    </Row>
  )
}

export default Profile