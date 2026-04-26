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

CREATE TABLE IF NOT EXISTS bondian_images (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  bondian_id BIGINT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bondian_images_bondian FOREIGN KEY (bondian_id) REFERENCES bondians(id) ON UPDATE CASCADE ON DELETE CASCADE
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

CREATE TABLE IF NOT EXISTS comments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  bondian_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  parent_id BIGINT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comments_bondian FOREIGN KEY (bondian_id) REFERENCES bondians(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id) REFERENCES comments(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS regions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  province VARCHAR(50),
  description TEXT,
  color_characteristic TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS views (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  bondian_id BIGINT NOT NULL,
  user_id BIGINT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_views_bondian FOREIGN KEY (bondian_id) REFERENCES bondians(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_views_user FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NULL,
  action VARCHAR(120) NOT NULL,
  target_type VARCHAR(50),
  target_id BIGINT,
  details TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL
);

INSERT IGNORE INTO bondian_types (name, category, description, color_code) VALUES
('查青', 'color', '宽条纹彩虹色彩邦典，色彩丰富艳丽', '#FF6B6B'),
('噶察', 'color', '白底间色邦典，清新淡雅', '#FFFFFF'),
('降查', 'color', '蓝绿冷色调邦典', '#4ECDC4'),
('欧穷', 'color', '蓝棕对比色调邦典', '#45B7D1'),
('色夏', 'color', '黄色主调邦典，宗教人士常用', '#FFE66D'),
('那松', 'color', '三色邦典', '#96CEB4');

INSERT IGNORE INTO regions (name, province, description, color_characteristic) VALUES
('拉萨', '西藏自治区', '西藏首府，文化中心', '色彩均衡和谐，纹样精致典雅'),
('山南', '西藏自治区', '邦典织造中心', '色彩鲜艳丰富，纹样多样'),
('日喀则', '西藏自治区', '后藏文化重镇', '偏爱蓝绿冷色调，色彩沉稳'),
('昌都', '西藏自治区', '东部门户', '融合多地特色'),
('那曲', '西藏自治区', '藏北牧区', '粗犷大气风格'),
('阿里', '西藏自治区', '西部高原', '简约质朴风格'),
('牧区', '西藏自治区', '草原地区', '实用耐磨为主');

INSERT IGNORE INTO users (username, password_hash, email, nickname, role) VALUES
('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', 'admin@example.com', '管理员', 'admin'),
('123', '$2b$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', '123@example.com', '普通用户', 'user');
