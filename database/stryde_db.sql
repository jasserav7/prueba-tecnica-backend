-- ============================================================
--  STRYDE FOOTWEAR – Script de Base de Datos MySQL
--  Arquitectura: Microservicios (auth / catalog / cart / orders)
--  NOTA: El script elimina y recrea la base de datos completa.
-- ============================================================

DROP DATABASE IF EXISTS stryde_db;

CREATE DATABASE stryde_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE stryde_db;

-- ============================================================
-- MICROSERVICIO 1: AUTH
-- ============================================================

CREATE TABLE users (
  id         INT          UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(60)  NOT NULL UNIQUE,
  name       VARCHAR(120) NOT NULL,
  password   VARCHAR(255) NOT NULL,
  role       ENUM('ADMIN','CLIENT') NOT NULL DEFAULT 'CLIENT',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Usuario administrador por defecto (contraseña: admin123, se actualiza con seed.py)
INSERT INTO users (username, name, password, role) VALUES
  ('admin', 'Administrador', '$2b$12$placeholder_hash_reemplazar', 'ADMIN');


-- ============================================================
-- MICROSERVICIO 2: CATÁLOGO (Categorías + Productos)
-- ============================================================

CREATE TABLE categories (
  id          INT          UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE products (
  id           INT            UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(150)   NOT NULL,
  description  TEXT,
  image_url    VARCHAR(500),
  size         VARCHAR(30),
  weight       VARCHAR(20),
  price        DECIMAL(12,2)  NOT NULL,
  iva          DECIMAL(5,2)   NOT NULL DEFAULT 19.00,
  category_id  INT UNSIGNED,
  created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_prod_cat
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Datos iniciales – Categorías
INSERT INTO categories (name, description) VALUES
  ('Deportivo', 'Calzado para actividad física y deporte'),
  ('Casual',    'Zapatos cómodos para el día a día'),
  ('Formal',    'Calzado elegante para ocasiones especiales'),
  ('Outdoor',   'Boots y zapatillas para exterior');

-- Datos iniciales – Productos
INSERT INTO products (name, description, image_url, size, weight, price, iva, category_id) VALUES
  ('Air Runner Pro',   'Zapatilla de alto rendimiento con amortiguación de aire.',   'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', '38-46', '280g', 320000.00, 19, 1),
  ('Urban Stride',     'Estilo moderno y comodidad para el día a día.',               'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&q=80', '36-45', '260g', 210000.00, 19, 2),
  ('Derby Elegance',   'Zapato de cuero genuino con suela de goma antideslizante.',  'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400&q=80', '39-44', '420g', 450000.00, 19, 3),
  ('Trail Blazer GTX', 'Bota outdoor Gore-Tex impermeable para terrenos difíciles.', 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&q=80', '38-46', '560g', 580000.00, 19, 4),
  ('Flex Trainer X',   'Zapatilla de entrenamiento flexible con suela de tracción.', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80', '36-46', '300g', 275000.00, 19, 1),
  ('Slide Comfort',    'Sandalia ergonómica perfecta para climas cálidos.',           'https://images.unsplash.com/photo-1556906781-9a412961a28d?w=400&q=80', '36-44', '180g', 120000.00, 19, 2);


-- ============================================================
-- MICROSERVICIO 3: CARRITO
-- ============================================================

CREATE TABLE cart (
  id         INT      UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT      UNSIGNED NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cart_items (
  id          INT      UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cart_id     INT      UNSIGNED NOT NULL,
  product_id  INT      UNSIGNED NOT NULL,
  quantity    INT      UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT fk_citem_cart FOREIGN KEY (cart_id)    REFERENCES cart(id)     ON DELETE CASCADE,
  CONSTRAINT fk_citem_prod FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_cart_prod (cart_id, product_id)
) ENGINE=InnoDB;


-- ============================================================
-- MICROSERVICIO 4: PEDIDOS
-- ============================================================

CREATE TABLE orders (
  id         INT            UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT            UNSIGNED NOT NULL,
  subtotal   DECIMAL(14,2)  NOT NULL,
  total_iva  DECIMAL(14,2)  NOT NULL,
  total      DECIMAL(14,2)  NOT NULL,
  status     ENUM('PENDING','COMPLETED','CANCELLED') NOT NULL DEFAULT 'COMPLETED',
  created_at DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ord_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id           INT            UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id     INT            UNSIGNED NOT NULL,
  product_id   INT            UNSIGNED,
  product_name VARCHAR(150)   NOT NULL,
  unit_price   DECIMAL(12,2)  NOT NULL,
  iva_pct      DECIMAL(5,2)   NOT NULL,
  quantity     INT            UNSIGNED NOT NULL,
  CONSTRAINT fk_oitem_ord  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  CONSTRAINT fk_oitem_prod FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;


-- ============================================================
-- VISTAS ÚTILES
-- ============================================================

CREATE OR REPLACE VIEW v_order_detail AS
SELECT
  o.id                                                              AS order_id,
  o.created_at,
  o.status,
  u.name                                                            AS client,
  oi.product_name,
  oi.quantity,
  oi.unit_price,
  oi.iva_pct,
  ROUND(oi.unit_price * (1 + oi.iva_pct/100), 2)                   AS price_with_tax,
  ROUND(oi.unit_price * (1 + oi.iva_pct/100) * oi.quantity, 2)     AS line_subtotal,
  o.total
FROM orders o
JOIN users u        ON u.id  = o.user_id
JOIN order_items oi ON oi.order_id = o.id;

CREATE OR REPLACE VIEW v_active_cart AS
SELECT
  c.id                                                           AS cart_id,
  c.user_id,
  p.id                                                           AS product_id,
  p.name,
  p.price,
  p.iva,
  ci.quantity,
  ROUND(p.price * (1 + p.iva/100) * ci.quantity, 2)             AS line_subtotal
FROM cart c
JOIN cart_items ci ON ci.cart_id = c.id
JOIN products p    ON p.id = ci.product_id;
