import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { NavLink } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../AppContext";

const Header = () => {
  const navigate = useNavigate();
  const { isLogin, setLogin, authData } = useAppContext();

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout this user?"
    );
    if (confirmLogout) {
      setLogin(false);
      localStorage.clear();
      navigate("/login");
    }
  };

  return (
    <Navbar expand="lg" bg="light" className="shadow-sm">
      <Container>
        <NavLink to="/" className="navbar-brand text-primary fw-bold">
          Exam_Prep
        </NavLink>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <NavLink to="/" className="nav-link">
              Home
            </NavLink>

            {/* Menu for ROLE_TEACHER */}
            {authData?.role === "ROLE_TEACHER" && (
              <>
                <NavLink to="/teacher/create-quiz" className="nav-link">
                  Add Quiz
                </NavLink>
                <NavLink to="/teacher/question-sets" className="nav-link">
                  Question Set List
                </NavLink>
                <NavLink to="/teacher/create-question-set" className="nav-link">
                  Add Question Set
                </NavLink>
                <NavLink to="/teacher/create-question" className="nav-link">
                  Add Question
                </NavLink>
              </>
            )}

            {/* Menu for ROLE_ADMIN */}
            {authData?.role === "ROLE_ADMIN" && (
              <>
                <NavLink to="/admin/statistics" className="nav-link">
                  Statistics
                </NavLink>
                <NavLink to="/admin/students" className="nav-link">
                  Manage Students
                </NavLink>
                <NavLink to="/admin/teachers" className="nav-link">
                  Manage Teachers
                </NavLink>
              </>
            )}
          </Nav>

          <Nav>
            {/* Show Login Button when not logged in */}
            {!isLogin ? (
              <Button
                variant="primary"
                onClick={() => navigate("/login")}
                className="me-2"
              >
                Log In
              </Button>
            ) : (
              // Show Account dropdown when logged in
              <NavDropdown title="Account" id="account-dropdown">
                <NavDropdown.Item onClick={() => navigate("/profile")}>
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Item onClick={handleLogout}>
                  Log Out
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
