CREATE DATABASE IF NOT EXISTS bondian_platform
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE bondian_platform;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE,
  nickname VARCHAR(50),
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  avatar_url VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bondian_types (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  color_code VARCHAR(20),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bondians (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  type_id BIGINT,
  region VARCHAR(50),
  material VARCHAR(50),
  craftsmanship VARCHAR(50),
  color_description TEXT,
  pattern_description TEXT,
  image_url VARCHAR(255),
  origin_description TEXT,
  cultural_significance TEXT,
  usage_scenario VARCHAR(100),
  popularity INT DEFAULT 0,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
  author_id BIGINT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bondians_type FOREIGN KEY (type_id) REFERENCES bondian_types(id) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_bondians_author FOREIGN KEY (author_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS comments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  bondian_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  parent_id BIGINT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comments_bondian FOREIGN KEY (bondian_id) REFERENCES bondians(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favorites (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  bondian_id BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_favorites_user_bondian (user_id, bondian_id),
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_favorites_bondian FOREIGN KEY (bondian_id) REFERENCES bondians(id) ON UPDATE CASCADE ON DELETE CASCADE
);

INSERT IGNORE INTO bondian_types (name, category, description, color_code) VALUES
('查青', 'color', '宽条纹彩虹色彩邦典', '#FF6B6B'),
('噶察', 'color', '白底间色邦典', '#FFFFFF'),
('降查', 'color', '蓝绿冷色调邦典', '#4ECDC4'),
('欧穷', 'color', '蓝棕对比色调邦典', '#45B7D1'),
('色夏', 'color', '黄色主调邦典', '#FFE66D'),
('那松', 'color', '三色邦典', '#96CEB4');

INSERT IGNORE INTO users (username, password_hash, email, nickname, role) VALUES
('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', 'admin@example.com', '管理员', 'admin'),
('123', '$2b$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', '123@example.com', '普通用户', 'user');
