# Workshop Order Management System

This project is a simple microservice-based workshop order management system built using Java and Spring Boot.  
It demonstrates how to create, search, and manage workshop orders with a basic frontend UI.

---

## Features

- Create a new workshop order
- Add multiple parts to an order
- Save order and parts into MySQL database
- Search order by Order Number or Car License
- Edit existing order from the same screen
- Simple HTML, CSS, and JavaScript UI
- Spring Boot REST APIs
- JPA One-to-Many mapping (Order → Order Parts)

---

## Project Structure

workshop-management-system
|
|-- discovery-server
|
|-- order-service
| |-- src/main/java/com/workshop/order
| | |-- controller
| | |-- service
| | |-- repository
| | |-- entity
| |
| |-- src/main/resources
| |-- static
| |-- order-ui.html
|
|-- planning-service (future)
|-- api-gateway (future)

yaml
Copy code

---

## Technology Stack

- Java 17
- Spring Boot 3
- Spring Data JPA
- MySQL
- Maven
- HTML, CSS, JavaScript
- Eureka Discovery Server

---

## Database Setup

Create database in MySQL:

CREATE DATABASE workshop_db;

yaml
Copy code

Tables will be created automatically by JPA.

---

## Application Configuration

order-service `application.yml`:

server:
port: 8081

spring:
datasource:
url: jdbc:mysql://localhost:3306/workshop_db
username: root
password: root

jpa:
hibernate:
ddl-auto: update
show-sql: true

yaml
Copy code

---

## How to Run

1. Start MySQL and create the database
2. Start Discovery Server (optional)
3. Start Order Service
4. Open browser and go to:

http://localhost:8081/order-ui.html

yaml
Copy code

---

## REST APIs

### Create or Update Order

POST /api/orders

css
Copy code

Example Request Body:

{
"orderNumber": "ORD101",
"license": "MH12AB1234",
"customerName": "Rahul",
"customerNumber": "9999999999",
"carMileage": 45000,
"carMake": "Honda",
"parts": [
{
"partNo": "P101",
"description": "Oil Filter",
"quantity": 1,
"price": 300
}
]
}

yaml
Copy code

---

### Search Order

GET /api/orders/search?orderNumber=ORD101
GET /api/orders/search?license=MH12AB1234

yaml
Copy code

---

## Frontend

- Single page UI: `order-ui.html`
- Search Order section
- Create/Edit Order form
- Dynamic parts table
- Save order directly to backend

---

## Key Concepts Covered

- Microservice project structure
- Spring Boot REST APIs
- JPA One-to-Many relationship
- Cascade save
- JSON serialization handling
- Frontend to backend integration

---

## Future Improvements

- Update order using PUT API
- Delete order
- Order list with pagination
- Planning service integration
- API Gateway routing
- Authentication and authorization

---

## Author

Dipak  
Java and Spring Boot Developer  
Learning microservices with real-world examples
