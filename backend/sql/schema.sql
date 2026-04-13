CREATE DATABASE IF NOT EXISTS bizflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bizflow;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 0,
  unit VARCHAR(50) DEFAULT 'pcs',
  category VARCHAR(100) DEFAULT 'General',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  phone VARCHAR(20),
  gstin VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_no VARCHAR(50) NOT NULL UNIQUE,
  party_id INT,
  user_id INT NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  cgst_rate DECIMAL(5,2) NOT NULL DEFAULT 9,
  sgst_rate DECIMAL(5,2) NOT NULL DEFAULT 9,
  cgst_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  sgst_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method ENUM('cash','upi') DEFAULT 'cash',
  status ENUM('paid','unpaid','partial') DEFAULT 'unpaid',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  product_id INT,
  product_name VARCHAR(200) NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  unit VARCHAR(50) DEFAULT 'pcs',
  line_total DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  method ENUM('cash','upi') NOT NULL DEFAULT 'cash',
  reference VARCHAR(100),
  paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Default owner account (password: admin123)
-- To change password: node -e "require('bcrypt').hash('newpass',10).then(h=>console.log(h))"
-- Then: UPDATE users SET password_hash='<hash>' WHERE username='admin';
INSERT IGNORE INTO users (username, password_hash) VALUES
('admin', '$2b$10$BuHT8hPWJqhKKnEwWgxwaOHRrRGW20vAtKf2ewiB0n42uelj0BYt6');
