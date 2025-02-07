import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Divider,
  Typography,
  Upload,
  message,
  Progress,
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  SmileOutlined,
  SoundOutlined,
  UploadOutlined,
  EnvironmentOutlined,
  BookOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { RcFile } from "antd/es/upload";
import { registerUser } from "../../auth"; // Import the register function
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate

const { Title, Text } = Typography;
const { TextArea } = Input;

const SignUp: React.FC = () => {
  
const navigate = useNavigate(); // ✅ Initialize navigate
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth <= 768);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

  const [step1Values, setStep1Values] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [step2Values, setStep2Values] = useState({
    nickname: "",
    favoriteSpot: "",
    favoriteSubject: "",
    bestMemory: "",
  });

  const [step3Values, setStep3Values] = useState({
    lifeLesson: "",
    mbaLifeMiss: "",
    mbaLifeEmojis: "",
    mbaLifeThemeSong: "",
  });

  const convertToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const onFinish = async () => {
    setLoading(true);
    try {
      const { name, email, password } = step1Values;
      const { nickname, favoriteSpot, favoriteSubject, bestMemory } =
        step2Values;
      const { lifeLesson, mbaLifeMiss, mbaLifeEmojis, mbaLifeThemeSong } =
        step3Values;

      let photoBase64 = null;
      if (photo) {
        photoBase64 = await convertToBase64(photo);
      }

      // Combine data from both steps
      const formData = {
        name,
        email,
        nickname,
        favoriteSpot,
        favoriteSubject,
        bestMemory,
        lifeLesson,
        mbaLifeMiss,
        mbaLifeEmojis,
        mbaLifeThemeSong
      };

      // Register user and store additional data
      await registerUser(email, password, formData, photoBase64);

      message.success("Sign-up and profile completed!");
      navigate("/");

    } catch (error) {
      console.log(error);
      message.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setCurrentStep(2);
  };
  const handleNextThird = () => {
    setCurrentStep(3);
  };

  const onPhotoChange = (file: RcFile) => {
    setPhoto(file);
    return false; // Prevent auto-upload
  };

  const onPasswordChange = (value: string) => {
    if (!value) setPasswordStrength(0);
    else if (value.length < 6) setPasswordStrength(20);
    else if (value.length < 10) setPasswordStrength(50);
    else if (
      /[A-Z]/.test(value) &&
      /[0-9]/.test(value) &&
      /[^a-zA-Z0-9]/.test(value)
    )
      setPasswordStrength(100);
    else setPasswordStrength(75);
  };

  const handleStep1Change = (changedValues: any) => {
    setStep1Values((prevValues) => ({
      ...prevValues,
      ...changedValues,
    }));
  };

  const handleStep2Change = (changedValues: any) => {
    setStep2Values((prevValues) => ({
      ...prevValues,
      ...changedValues,
    }));
  };

  const handleStep3Change = (changedValues: any) => {
    setStep3Values((prevValues) => ({
      ...prevValues,
      ...changedValues,
    }));
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #6e8efb, #a777e3)",
        }}
      >
        {/* Left side: Sign-Up Form */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Card
            style={{
              width: 500,
              padding: "30px 50px",
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              backgroundColor: "#fff",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <Title level={3}>
                {currentStep === 1 ? "Sign Up" : "Tell Us About You"}
              </Title>
            </div>

            <Divider />

            <Form
              form={form}
              name="signup"
              layout="vertical"
              onFinish={onFinish}
              onValuesChange={
                currentStep === 1 ? handleStep1Change :
                currentStep === 2 ? handleStep2Change :
                handleStep3Change
              }
            >
              {currentStep === 1 && (
                <>
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[
                      { required: true, message: "Please input your name!" },
                    ]}
                  >
                    <Input placeholder="Full Name" />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: "Please input your email!" },
                    ]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="Email" />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                      {
                        required: true,
                        message: "Please input your password!",
                      },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Password"
                      onChange={(e) => onPasswordChange(e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item
                    name="confirmPassword"
                    label="Confirm Password"
                    rules={[
                      {
                        required: true,
                        message: "Please confirm your password!",
                      },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Confirm Password"
                    />
                  </Form.Item>
                  <Progress
                    percent={passwordStrength}
                    showInfo={false}
                    style={{ marginBottom: 20 }}
                  />
                  <Form.Item label="Upload Photo">
                    <Upload
                      beforeUpload={onPhotoChange}
                      maxCount={1}
                      listType="picture"
                    >
                      <Button icon={<UploadOutlined />}>Choose Photo</Button>
                    </Upload>
                  </Form.Item>
                  <Button type="primary" onClick={handleNext} block>
                    Next: Complete Profile
                  </Button>
                </>
              )}

              {currentStep === 2 && (
                <>
                  {photo && (
                    <div style={{ textAlign: "center", marginBottom: 20 }}>
                      <img
                        src={URL.createObjectURL(photo)}
                        alt="Profile Preview"
                        style={{
                          width: 100,
                          height: 100,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "3px solid #a777e3",
                        }}
                      />
                    </div>
                  )}

                  <Form.Item
                    name="nickname"
                    label="Nickname"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your nickname!",
                      },
                    ]}
                  >
                    <Input prefix={<SmileOutlined />} placeholder="Nickname" />
                  </Form.Item>

                  <Form.Item
                    name="favoriteSpot"
                    label="Favorite Spot in IIT"
                  >
                    <Input
                      prefix={<EnvironmentOutlined />}
                      placeholder="Favorite Spot in IIT"
                    />
                  </Form.Item>

                  <Form.Item
                    name="favoriteSubject"
                    label="Favorite Subject"
                  >
                    <Input
                      prefix={<BookOutlined />}
                      placeholder="Favorite Subject"
                    />
                  </Form.Item>

                  <Form.Item
                    name="bestMemory"
                    label="Best Memory"
                  >
                    <TextArea
                      placeholder="Share your best memory"
                      maxLength={200}
                      rows={4}
                    />
                  </Form.Item>

                  <Button type="primary" onClick={handleNextThird} block>
                    Next: Complete Profile
                  </Button>
                </>
              )}

              {currentStep === 3 && (
                <>
                  {photo && (
                    <div style={{ textAlign: "center", marginBottom: 20 }}>
                      <img
                        src={URL.createObjectURL(photo)}
                        alt="Profile Preview"
                        style={{
                          width: 100,
                          height: 100,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "3px solid #a777e3",
                        }}
                      />
                    </div>
                  )}

                  <Form.Item
                    name="lifeLesson"
                    label="One Life Lesson from MBA"
                  >
                    <TextArea placeholder="Life Lesson" />
                  </Form.Item>
                  <Form.Item
                    name="mbaLifeMiss"
                    label="What’s the one thing you’ll miss most about SOM?"
                  >
                    <Input placeholder="What You'll Miss" />
                  </Form.Item>
                  <Form.Item
                    name="mbaLifeThemeSong"
                    label="Your MBA Life Had a Theme Song"
                  >
                    <Input
                      prefix={<SoundOutlined />}
                      placeholder="Theme Song"
                    />
                  </Form.Item>
                  <Form.Item
                    name="mbaLifeEmojis"
                    label="Your MBA Life in 3 Emojis"
                  >
                    <Input placeholder="Three Emojis" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Submit
                  </Button>
                </>
              )}
            </Form>
          </Card>
        </div>

        {/* Right side: SOM25 Yearbook Description */}
        {!isMobile && (
          <div
            style={{
              flex: 1,
              padding: "20px",
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Title level={2} style={{ textAlign: "center", color: "#fff" }}>
              Celebrate Your Journey with the SOM25 Yearbook!
            </Title>
            <Text
              style={{
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#fff",
                textAlign: "center",
                maxWidth: "600px",
              }}
            >
              As we approach the end of our academic journey at the School of
              Management, it's a moment to reflect on the memories we've
              created, the friendships we've built, and the challenges we've
              overcome. We've spent countless hours together—learning, growing,
              and supporting one another. From late-night study sessions to
              group projects, these experiences have shaped us into a community
              bound by shared goals and mutual respect. The lessons we've
              learned, not just from our professors but from each other, will
              stay with us long after we leave. As we move forward, we carry
              with us the strength of our collective spirit and the memories of
              a remarkable journey that will last a lifetime.
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUp;
