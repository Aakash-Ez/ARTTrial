import React, { useEffect, useState } from "react";
import { Card, Col, Row, Typography, Spin, Form, Input, Button, DatePicker, Modal } from "antd";
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, PlusOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const dummyEvents = [
  {
    id: "1",
    title: "Spring Festival",
    date: new Date("2025-04-01T10:00:00"),
    location: "Main Quad",
    image: "https://sjmsom.in/_astro/hero.Cd__cX0o_Z1FBWWr.webp",
  },
  {
    id: "2",
    title: "Guest Lecture: AI in 2025",
    date: new Date("2025-04-05T14:00:00"),
    location: "Auditorium",
    image: "https://sjmsom.in/_astro/5.cRP5J5Rp_Z1PDt5e.webp",
  },
  {
    id: "3",
    title: "Art Exhibition",
    date: new Date("2025-04-10T09:00:00"),
    location: "Art Gallery",
    image: "https://sjmsom.in/_astro/hero.DEgrgKZ5_Za4FIu.webp",
  },
  {
    id: "4",
    title: "Music Concert",
    date: new Date("2025-04-15T18:00:00"),
    location: "Concert Hall",
    image: "https://sjmsom.in/_astro/hero.D8mSOKUo_Zx57c4.webp",
  },
];

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      // Ensure dates are Date objects
      const eventsWithDates = dummyEvents.map(event => ({
        ...event,
        date: event.date instanceof Date ? event.date : new Date(event.date)
      }));
      setEvents(eventsWithDates);
      setLoading(false);
    }, 1000);
  }, []);

  // Helper function to safely format dates
  const formatDate = (date: any) => {
    if (!date) return "N/A";
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleDateString();
    } catch (e) {
      return "Invalid Date";
    }
  };

  // Helper function to safely format time
  const formatTime = (date: any) => {
    if (!date) return "N/A";
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleTimeString();
    } catch (e) {
      return "Invalid Time";
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = (values: any) => {
    const newEvent = {
      id: (events.length + 1).toString(),
      title: values.title,
      date: values.date.toDate(),
      location: values.location,
      image: `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 100)}`,
    };

    setEvents([...events, newEvent]);
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div>
      <div style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <Title level={2} style={{ margin: 0 }}>
            Upcoming Campus Events
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
            Add Event
          </Button>
        </div>

        {loading ? (
          <Spin size="large" style={{ display: "block", margin: "0 auto" }} />
        ) : (
          <Row gutter={[16, 16]} justify="center">
            {events.map((event) => (
              <Col key={event.id} xs={24} sm={12} md={8} lg={6}>
                <Card hoverable cover={<img alt={event.title} src={event.image} />}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
                    <Text strong style={{ fontSize: "16px", marginBottom: "10px" }}>{event.title}</Text>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                      <CalendarOutlined style={{ marginRight: "8px" }} />
                      <Text>{formatDate(event.date)}</Text>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                      <ClockCircleOutlined style={{ marginRight: "8px" }} />
                      <Text>{formatTime(event.date)}</Text>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <EnvironmentOutlined style={{ marginRight: "8px" }} />
                      <Text>{event.location}</Text>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <Modal
          title="Add New Event"
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="title"
              label="Event Title"
              rules={[{ required: true, message: 'Please enter the event title' }]}
            >
              <Input placeholder="Enter event title" />
            </Form.Item>
            
            <Form.Item
              name="date"
              label="Event Date & Time"
              rules={[{ required: true, message: 'Please select event date and time' }]}
            >
              <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name="location"
              label="Event Location"
              rules={[{ required: true, message: 'Please enter the event location' }]}
            >
              <Input placeholder="Enter event location" />
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                Add Event
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default EventsPage;