-- ============================================================
--  Create database
-- ============================================================
CREATE DATABASE IF NOT EXISTS workshop_customer
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE workshop_customer;

-- ============================================================
--  Table: customers
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
    id            BIGINT          NOT NULL AUTO_INCREMENT,
    customer_id   VARCHAR(20)     NOT NULL,          -- Auto-generated: CUST-001, CUST-002 …
    first_name    VARCHAR(100)    NOT NULL,           -- was: name VARCHAR(150)
    last_name     VARCHAR(100)    NOT NULL,           -- NEW
    phone         VARCHAR(20)     NOT NULL,
    license       VARCHAR(50)     NULL,
    email         VARCHAR(150)    NULL,
    city          VARCHAR(150)    NULL,               -- NEW
    address       VARCHAR(255)    NULL,
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_customer_id (customer_id),
    UNIQUE KEY uq_phone       (phone),
    UNIQUE KEY uq_license     (license)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  If you already have the table, run these ALTER statements
--  instead of recreating it:
-- ============================================================
-- ALTER TABLE customers
--   DROP   COLUMN  name,
--   ADD    COLUMN  customer_id  VARCHAR(20)  NOT NULL UNIQUE   AFTER id,
--   ADD    COLUMN  first_name   VARCHAR(100) NOT NULL          AFTER customer_id,
--   ADD    COLUMN  last_name    VARCHAR(100) NOT NULL          AFTER first_name,
--   ADD    COLUMN  city         VARCHAR(150) NULL              AFTER email;

-- ============================================================
--  Sample seed data
-- ============================================================
INSERT INTO customers (customer_id, first_name, last_name, phone, license, email, city, address) VALUES
  ('CUST-001', 'Jan',    'de Vries', '+31612345678', 'LIC-NL-001', 'jan.devries@email.com', 'Amsterdam', 'Damrak 1'),
  ('CUST-002', 'Anna',   'Bakker',   '+31623456789', 'LIC-NL-002', 'anna.bakker@email.com', 'Rotterdam', 'Coolsingel 40'),
  ('CUST-003', 'Pieter', 'Smit',     '+31634567890', NULL,         'p.smit@email.com',      'Utrecht',   'Vredenburg 15'),
  ('CUST-004', 'Maria',  'Jansen',   '+31645678901', 'LIC-NL-004', 'maria.j@email.com',     'Den Haag',  'Hofweg 12'),
  ('CUST-005', 'Thomas', 'Visser',   '+31656789012', NULL,         'thomas.v@email.com',    'Eindhoven', 'Vestdijk 9');