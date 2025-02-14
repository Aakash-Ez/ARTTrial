import React, { useState } from "react";
import { Avatar, Modal, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { getCurrentUserInfo } from "../../auth";
import { useNavigate } from "react-router-dom";

const AvatarEditor: React.FC<{ userData: any }> = ({ userData }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleFileChange = (info: any) => {
    if (info.file) {
      setFile(info.file);
      message.success("File selected successfully!");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      message.error("Please select a file first!");
      return;
    }
    setLoading(true);
    try {
      const userInfo = await getCurrentUserInfo();
      if (!userInfo || !userInfo.email) {
        message.error("User information not found");
        return;
      }
      const storage = getStorage();
      const storageRef = ref(storage, `profile_pictures/${userInfo.email}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "users", userInfo.uid), {
        photoURL: downloadURL,
      });
      message.success("Avatar updated successfully!");
      setIsModalVisible(false);
      setFile(null);
      navigate("/");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      message.error("Failed to update avatar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <Avatar
        size={120}
        src={userData.photoURL || "https://via.placeholder.com/120"}
        style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)", objectFit: "cover", cursor: "pointer" }}
        onClick={() => setIsModalVisible(true)}
      />
      <Modal
        title="Edit Avatar"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Upload beforeUpload={() => false} onChange={handleFileChange} showUploadList={true}>
          <Button icon={<UploadOutlined />}>Select Image</Button>
        </Upload>
        <Button type="primary" onClick={handleUpload} loading={loading} style={{ marginTop: 10 }}>
          Upload Avatar
        </Button>
      </Modal>
    </div>
  );
};

export default AvatarEditor;
