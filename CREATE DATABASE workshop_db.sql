CREATE DATABASE workshop_db;

CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50),
    license VARCHAR(20),
    customer_name VARCHAR(100),
    customer_number VARCHAR(20),
    car_mileage INT,
    car_make VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE order_parts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT,
    part_no VARCHAR(50),
    description VARCHAR(200),
    quantity INT,
    price DECIMAL(10,2),



    CONSTRAINT fk_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE
);