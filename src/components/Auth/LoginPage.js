import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../AppContext";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Card,
} from "react-bootstrap";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { API_BASE_URL, isLogin, setLogin, setAuthData } = useAppContext();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    axios.defaults.withCredentials = false;

    if (isLogin) {
      window.alert("Please logout the current user before logging in.");
      return;
    }

    try {
      const authenData = await axios.post(`${API_BASE_URL}/api/authenticate`, {
        username,
        password,
      });

      if (authenData.data.jwt) {
        setLogin(true);
        setAuthData(authenData.data);
        localStorage.setItem("authData", JSON.stringify(authenData.data));
        navigate("/");
      } else {
        setError(authenData.data.error || "Authentication failed.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    }

    setTimeout(() => {
      setError("");
    }, 5000);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ width: "100%", maxWidth: "400px" }} className="p-4 shadow">
        <h2 className="text-center mb-4">Login</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="username" className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="password" className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100">
            Login
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default LoginPage;
