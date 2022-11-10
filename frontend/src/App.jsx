import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { PersonCircle } from 'react-bootstrap-icons'
import {
  Row,
  Col,
  Nav,
  Navbar,
  Form,
  Card,
  Container,
  Button,
  Dropdown,
  Alert
} from 'react-bootstrap'

import './App.css'

const API_URL = 'http://localhost:7000';

export function authHeader() {
  let user = JSON.parse(window.localStorage.getItem('user'));
  if (user && user.authdata) {
    return { 'x-access-token': user.token };
  } else {
    return {};
  }
}

function login(e) {
  e.preventDefault();
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "email": e.target.email.value,
      "password": e.target.password.value
    })
  };

  return fetch(`${API_URL}/login`, requestOptions)
    .then(handleResponse)
    .then(token => {
      if (token) {
        window.localStorage.setItem('auth', token);
        window.location.reload();
      }
      return token;
    });
}

function logout() {
  window.localStorage.removeItem('auth');
  window.location.reload();
}

function handleResponse(response) {
  return response.text().then(text => {
    const data = text && JSON.parse(text);
    if (!response.ok) {
      if (response.status === 401) {
        logout();
        window.location.reload();
      }

      const error = (data && data.message) || response.statusText;
      return Promise.reject(error);
    }

    return data;
  });
}

function saveMatchesRequest(matches) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('auth'),
    },
    body: JSON.stringify({
      "matches": matches,
    })
  };

  fetch(`${API_URL}/submit`, requestOptions)
    .then((response) => response.json())
    .then(fixtures => displayFixtures(fixtures));
}

function saveMatches(e) {
  // TODO also handle file uploads in form
  e.preventDefault();
  saveMatchesRequest(e.target.matches.value);
}

function displayFixtures(fixtures) {
  let rank = 1;
  for (let i = 0; i < fixtures.length; i++) {
    if (i === 0) {
      fixtures[i].rank = rank;
    } else {
      if (fixtures[i].score < fixtures[i-1].score) {
        rank = i + 1;
      }
      fixtures[i].rank = rank;
    }
    
  }
  window.localStorage.setItem('fixtures', JSON.stringify(fixtures));
  window.location.reload();
}

const LoginPage = () =>
  <Row>
    <Col sm={12} md={6}>
      <Form onSubmit={login}>
        <Form.Group controlId="email">
          <Form.Label>Email address</Form.Label>
          <Form.Control type="email" placeholder="Enter email" />
        </Form.Group>
        <Form.Group controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" placeholder="Password" />
        </Form.Group>
        <Button variant="dark" type="submit">
          Submit
        </Button>
      </Form>
    </Col>
  </Row>

const MainPage = () => {
  const fixtures = JSON.parse(localStorage.getItem('fixtures'));
  const displayFixtures = fixtures ? fixtures.map(fixture =>
    <p key={fixture._id}>{fixture.rank}. {fixture.team}, {fixture.score} {fixture.score === 1 ? 'pt' : 'pts'}</p>)
    : '...';
  return (
    <Row>
      <Col sm={12} md={6} className="mt-4 mt-sm-4 mt-md-0">
        <h4>Current fixtures</h4>
        <Alert variant="dark">
          {displayFixtures}
        </Alert>
      </Col>
      <Col sm={12} md={6}>
        <Form onSubmit={saveMatches}>
          <Form.Group controlId="matches">
            <Form.Label>Enter Matches</Form.Label>
            <Form.Control as="textarea" placeholder="..." />
          </Form.Group>
          <Button variant="dark" type="submit">
            Submit
          </Button>
        </Form>
      </Col>
    </Row>
  )
}

const Header = () =>
  <Navbar variant="dark" bg="dark" className="mb-3">
    <Navbar.Brand className="mr-auto"><h2><span>MyApp</span></h2></Navbar.Brand>
    <Nav className="text-right">
      <Dropdown as={Nav.NavItem} className="ml-2">
        <Dropdown.Toggle as={Nav.NavLink} variant="dark">
          <h4><PersonCircle /></h4>
        </Dropdown.Toggle>
        <Dropdown.Menu align="right">
          <Dropdown.Item onClick={logout}>Log out</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Nav>
  </Navbar>

const App = () => {
  const authToken = localStorage.getItem('auth');
  return (
    <MemoryRouter>
      <Header />
      <Container>
        <div className="row">
          <div className="col-xl-10 col-md-9 col-12">
            <Card text="dark">
              <Card.Header>
                MyApp
              </Card.Header>
              <Card.Body>
                {authToken ? <MainPage /> : <LoginPage />}
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>
    </MemoryRouter>
  )
}

export default App
