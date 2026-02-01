-- Main planning table
CREATE TABLE plannings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    planning_number VARCHAR(50) NOT NULL UNIQUE,
    license VARCHAR(20),
    customer_name VARCHAR(100),
    customer_number VARCHAR(20),
    car_mileage INT,
    car_make VARCHAR(50),

    status VARCHAR(30) DEFAULT 'DRAFT',
    order_id BIGINT NULL,   -- reference to order-service order id

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Planning lines (parts / activities)
CREATE TABLE planning_lines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    planning_id BIGINT NOT NULL,

    line_type VARCHAR(20),   -- PART / ACTIVITY
    item_code VARCHAR(50),
    description VARCHAR(200),
    quantity INT,
    price DECIMAL(10,2),

    CONSTRAINT fk_planning
        FOREIGN KEY (planning_id)
        REFERENCES plannings(id)
        ON DELETE CASCADE
);