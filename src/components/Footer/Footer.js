import React from "react";
import { Container } from "react-bootstrap";

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: "#f8f9fa",
        marginTop: "20px",
        padding: "10px 0",
        // position: "fixed",
        bottom: 0,
        width: "100%",
      }}
    >
      <Container className="text-center">
        <p style={{ margin: 0, fontSize: "14px", color: "#6c757d" }}>
          &copy; {new Date().getFullYear()} Exam Prep. All rights reserved.
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
