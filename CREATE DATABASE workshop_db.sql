DROP DATABASE IF EXISTS workshop_db;

CREATE DATABASE workshop_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE workshop_db;

-- ─────────────────────────────────────────────
--  ORDERS
-- ─────────────────────────────────────────────
CREATE TABLE orders (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    order_number    VARCHAR(50)     NOT NULL UNIQUE,

    -- React frontend fields
    customer_id     VARCHAR(50),
    car_id          VARCHAR(50),
    service_type    VARCHAR(100),
    status          VARCHAR(30)     NOT NULL DEFAULT 'Pending',
    notes           TEXT,
    price           VARCHAR(20),
    created_at      VARCHAR(20),

    -- HTML form / planning flow fields
    license         VARCHAR(20),
    customer_name   VARCHAR(100),
    customer_number VARCHAR(50),
    car_mileage     INT,
    car_make        VARCHAR(100),

    CONSTRAINT chk_status CHECK (status IN (
        'Pending', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'
    ))
);

-- ─────────────────────────────────────────────
--  ORDER_PARTS  (unified — covers React partLines + HTML form parts)
-- ─────────────────────────────────────────────
CREATE TABLE order_parts (
    id           BIGINT          AUTO_INCREMENT PRIMARY KEY,
    order_id     BIGINT          NOT NULL,
    part_number  VARCHAR(50),
    description  VARCHAR(200),
    quantity     INT             DEFAULT 1,
    unit         VARCHAR(20)     DEFAULT 'pcs',
    unit_price   DECIMAL(10,2),

    CONSTRAINT fk_parts_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
--  ORDER_ACTIVITY_LINES  (React activity lines)
-- ─────────────────────────────────────────────
CREATE TABLE order_activity_lines (
    id            BIGINT          AUTO_INCREMENT PRIMARY KEY,
    order_id      BIGINT          NOT NULL,
    activity_code VARCHAR(50),
    description   VARCHAR(200),
    hours         VARCHAR(20),
    hourly_rate   VARCHAR(20),

    CONSTRAINT fk_activitylines_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
--  INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX idx_orders_status       ON orders(status);
CREATE INDEX idx_orders_customer_id  ON orders(customer_id);
CREATE INDEX idx_orders_created_at   ON orders(created_at);
CREATE INDEX idx_orders_license      ON orders(license);
CREATE INDEX idx_parts_order         ON order_parts(order_id);
CREATE INDEX idx_activitylines_order ON order_activity_lines(order_id);