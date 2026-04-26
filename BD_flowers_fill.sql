-- Database: flower_store

-- DROP DATABASE IF EXISTS flower_store;

CREATE DATABASE flower_store
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Russian_Russia.1251'
    LC_CTYPE = 'Russian_Russia.1251'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

-- 1. Users (Пользователи)
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    address TEXT NOT NULL DEFAULT '',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products (Товары/Букеты)
CREATE TABLE Products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_mix BOOLEAN DEFAULT false,
    discount DECIMAL(5,2) DEFAULT 0,
    was_ordered INT DEFAULT 0,
    total_flowers INT NOT NULL DEFAULT 0,
    default_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    image_url VARCHAR(500) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Flowers (Справочник цветов)
CREATE TABLE Flowers (
    flower_id SERIAL PRIMARY KEY,
    flower_name VARCHAR(100) NOT NULL UNIQUE,
    price_per_flower DECIMAL(10,2) NOT NULL,
    in_stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Packaging (Справочник упаковки)
CREATE TABLE Packaging (
    packaging_id SERIAL PRIMARY KEY,
    packaging_name VARCHAR(100) NOT NULL UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Decoration (Справочник декора)
CREATE TABLE Decoration (
    decoration_id SERIAL PRIMARY KEY,
    decoration_name VARCHAR(100) NOT NULL UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    in_stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Product_Flowers (Связь продукт-цветы)
CREATE TABLE Product_Flowers (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES Products(product_id) ON DELETE CASCADE,
    flower_id INT NOT NULL REFERENCES Flowers(flower_id) ON DELETE CASCADE,
    quantity_in_mix INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, flower_id)
);

-- 7. Product_Packaging (Связь продукт-упаковка)
CREATE TABLE Product_Packaging (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES Products(product_id) ON DELETE CASCADE,
    packaging_id INT NOT NULL REFERENCES Packaging(packaging_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, packaging_id)
);

-- 8. Product_Decoration (Связь продукт-декор)
CREATE TABLE Product_Decoration (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES Products(product_id) ON DELETE CASCADE,
    decoration_id INT NOT NULL REFERENCES Decoration(decoration_id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, decoration_id)
);

-- 9. Colors (Справочник цветов букета)
CREATE TABLE Colors (
    color_id SERIAL PRIMARY KEY,
    color_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Product_Colors (Связь продукт-цвета)
CREATE TABLE Product_Colors (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES Products(product_id) ON DELETE CASCADE,
    color_id INT NOT NULL REFERENCES Colors(color_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, color_id)
);

-- 11. Carts (Корзины)
CREATE TABLE Carts (
    cart_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Cart_Items (Товары в корзине)
CREATE TABLE Cart_Items (
    cart_item_id SERIAL PRIMARY KEY,
    cart_id INT NOT NULL REFERENCES Carts(cart_id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES Products(product_id) ON DELETE CASCADE,
    bouquet_count INT NOT NULL DEFAULT 1,
    flowers_per_bouquet INT NOT NULL,
    price_at_time DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Orders (Заказы)
CREATE TABLE Orders (
    order_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    delivery_type VARCHAR(20) NOT NULL CHECK (delivery_type IN ('courier', 'pickup')),
    delivery_price DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    delivery_address TEXT,
    delivery_time_start TIME,
    delivery_time_end TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Order_Items (Товары в заказе)
CREATE TABLE Order_Items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES Orders(order_id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES Products(product_id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    price_per_bouquet DECIMAL(10,2) NOT NULL,
    bouquet_count INT NOT NULL DEFAULT 1,
    flowers_per_bouquet INT NOT NULL,
    is_mix BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ЗАПОЛНЕНИЕ ДАННЫХ
-- =====================================================

-- Пользователь
INSERT INTO Users (email, phone, password_hash, address, status) VALUES 
('example@example.com', '+7 (999) 123-45-67', 'password', 'г. Великий Новгород, ул. Германа, д. 15, кв. 47', 'active');

-- Цветы с остатками на складе
INSERT INTO Flowers (flower_name, price_per_flower, in_stock) VALUES 
('Роза красная', 150, 500),
('Роза белая', 160, 350),
('Роза розовая', 155, 420),
('Тюльпан красный', 80, 1000),
('Тюльпан желтый', 75, 800),
('Пион розовый', 200, 300),
('Пион белый', 210, 250),
('Гортензия голубая', 180, 200),
('Гортензия розовая', 175, 220),
('Хризантема белая', 70, 600),
('Хризантема желтая', 65, 550),
('Лилия оранжевая', 120, 400),
('Лилия белая', 125, 380),
('Орхидея фиолетовая', 300, 150),
('Гвоздика красная', 60, 700);

-- Упаковка
INSERT INTO Packaging (packaging_name, price) VALUES 
('Крафт-бумага', 50),
('Прозрачная пленка', 30),
('Фетр белый', 100),
('Сетка декоративная', 80),
('Корзина плетеная', 200),
('Шляпная коробка', 250);

-- Декор (без веток)
INSERT INTO Decoration (decoration_name, price, in_stock) VALUES 
('Гипсофила', 40, 300),
('Бусины жемчужные', 60, 500),
('Шишки сосновые', 50, 150),
('Эвкалипт', 70, 250),
('Парвифолия', 100, 100),
('Мох декоративный', 45, 400),
('Кружево белое', 55, 300),
('Лента атласная', 45, 400),
('Ягоды декоративные', 65, 200);

-- Цвета букетов
INSERT INTO Colors (color_name) VALUES 
('Красный'), ('Белый'), ('Розовый'), ('Желтый'), ('Оранжевый'), 
('Голубой'), ('Фиолетовый'), ('Микс'), ('Пастельный'), ('Бордовый');

-- =====================================================
-- ТОВАРЫ (с default_price)
-- =====================================================

-- Моно-букеты (14 шт)
INSERT INTO Products (name, is_mix, discount, was_ordered, total_flowers, default_price, image_url, created_at) VALUES 
('Розы красные', false, 0, 45, 15, 2250, '/uploads/products/roses-red.jpg', '2024-01-15 10:00:00'),
('Розы белые', false, 0, 32, 15, 2160, '/uploads/products/roses-white.jpg', '2024-02-20 11:00:00'),
('Розы розовые', false, 0, 28, 15, 2090, '/uploads/products/roses-pink.jpg', '2024-01-25 09:00:00'),
('Тюльпаны красные', false, 0, 56, 21, 1680, '/uploads/products/tulips-red.jpg', '2024-03-01 14:00:00'),
('Тюльпаны желтые', false, 0, 23, 21, 1910, '/uploads/products/tulips-yellow.jpg', '2024-03-10 12:00:00'),
('Пионы розовые', false, 0, 41, 15, 3000, '/uploads/products/peonies-pink.jpg', '2024-02-01 10:00:00'),
('Пионы белые', false, 0, 19, 15, 3360, '/uploads/products/peonies-white.jpg', '2024-03-05 15:00:00'),
('Гортензии голубые', false, 0, 15, 15, 2700, '/uploads/products/hydrangeas-blue.jpg', '2024-01-10 08:00:00'),
('Хризантемы белые', false, 0, 27, 21, 1470, '/uploads/products/chrysanthemums-white.jpg', '2024-02-15 13:00:00'),
('Лилии оранжевые', false, 0, 22, 15, 1800, '/uploads/products/lilies-orange.jpg', '2024-03-12 16:00:00'),
('Орхидеи фиолетовые', false, 0, 12, 15, 4500, '/uploads/products/orchids-purple.jpg', '2024-01-05 11:00:00'),
('Гвоздики красные', false, 0, 34, 15, 900, '/uploads/products/carnations-red.jpg', '2024-02-28 09:00:00'),
('Розы бордовые', false, 0, 18, 15, 2250, '/uploads/products/roses-burgundy.jpg', '2024-03-15 14:00:00'),
('Лилии белые', false, 0, 24, 15, 1875, '/uploads/products/lilies-white.jpg', '2024-02-10 10:00:00');

-- Миксы (6 шт)
INSERT INTO Products (name, is_mix, discount, was_ordered, total_flowers, default_price, image_url, created_at) VALUES 
('Весенний сад', true, 0, 38, 15, 2535, '/uploads/products/spring-mix.jpg', '2024-01-20 12:00:00'),
('Нежный рассвет', true, 15, 29, 21, 3790, '/uploads/products/gentle-mix.jpg', '2024-02-25 09:00:00'),
('Яркое начало', true, 0, 21, 25, 3950, '/uploads/products/bright-mix.jpg', '2024-03-08 11:00:00'),
('Романтическое чудо', true, 10, 33, 15, 3150, '/uploads/products/romantic-mix.jpg', '2024-01-18 14:00:00'),
('Осенний сюрприз', true, 0, 17, 21, 2835, '/uploads/products/autumn-mix.jpg', '2024-02-05 16:00:00'),
('Премиум', true, 20, 14, 35, 7420, '/uploads/products/premium-mix.jpg', '2024-03-18 10:00:00');

-- =====================================================
-- СОСТАВ МОНО-БУКЕТОВ (Product_Flowers)
-- =====================================================

INSERT INTO Product_Flowers (product_id, flower_id, quantity_in_mix) VALUES 
(1, 1, 15), (2, 2, 15), (3, 3, 15), (4, 4, 21), (5, 5, 21),
(6, 6, 15), (7, 7, 15), (8, 8, 15), (9, 10, 21), (10, 12, 15),
(11, 14, 15), (12, 15, 15), (13, 1, 15), (14, 13, 15);

-- =====================================================
-- СОСТАВ МИКСОВ (Product_Flowers)
-- =====================================================

INSERT INTO Product_Flowers (product_id, flower_id, quantity_in_mix) VALUES 
(15, 4, 5), (15, 6, 5), (15, 9, 5),
(16, 2, 10), (16, 3, 6), (16, 5, 5),
(17, 1, 10), (17, 4, 8), (17, 12, 7),
(18, 2, 5), (18, 3, 5), (18, 8, 5),
(19, 4, 7), (19, 11, 7), (19, 12, 7),
(20, 1, 10), (20, 6, 8), (20, 9, 7), (20, 14, 5), (20, 15, 5);

-- =====================================================
-- УПАКОВКА
-- =====================================================

-- Моно-букеты
INSERT INTO Product_Packaging (product_id, packaging_id) VALUES 
(1, 1), (1, 5),
(2, 3), (2, 6),
(3, 2), (3, 4),
(4, 1), (4, 4),
(5, 5), (5, 6),
(6, 3), (6, 1),
(7, 6), (7, 4),
(8, 2), (8, 1),
(9, 5), (9, 3),
(10, 4), (10, 6),
(11, 1), (11, 5), (11, 3),
(12, 2), (12, 4),
(13, 6), (13, 1),
(14, 3), (14, 5);

-- Миксы
INSERT INTO Product_Packaging (product_id, packaging_id) VALUES 
(15, 1), (15, 4),
(16, 3), (16, 6),
(17, 2), (17, 5),
(18, 1), (18, 3),
(19, 4), (19, 6),
(20, 2), (20, 5), (20, 1);

-- =====================================================
-- ДЕКОР
-- =====================================================

-- Моно-букеты
INSERT INTO Product_Decoration (product_id, decoration_id, quantity) VALUES 
(1, 1, 1), (1, 2, 2),
(2, 4, 1), (2, 7, 1),
(3, 6, 1), (3, 8, 2),
(4, 1, 1), (4, 3, 2),
(5, 9, 2), (5, 4, 1),
(6, 7, 1), (6, 2, 2),
(7, 1, 1), (7, 8, 2),
(8, 4, 1), (8, 6, 1),
(9, 9, 2), (9, 3, 1),
(10, 7, 1), (10, 8, 1),
(11, 2, 2), (11, 4, 1),
(12, 1, 1), (12, 9, 1),
(13, 6, 1), (13, 3, 2),
(14, 8, 2), (14, 7, 1);

-- Миксы
INSERT INTO Product_Decoration (product_id, decoration_id, quantity) VALUES 
(15, 1, 1), (15, 4, 1),
(16, 2, 2), (16, 7, 1),
(17, 6, 1), (17, 8, 2),
(18, 9, 1), (18, 3, 1),
(19, 1, 1), (19, 2, 1),
(20, 4, 1), (20, 7, 1), (20, 8, 1);

-- =====================================================
-- ЦВЕТА БУКЕТОВ
-- =====================================================

INSERT INTO Product_Colors (product_id, color_id) VALUES 
(1, 1), (2, 2), (3, 3), (4, 1), (5, 4), (6, 3), (7, 2), 
(8, 6), (9, 2), (10, 5), (11, 7), (12, 1), (13, 10), (14, 2),
(15, 8), (16, 9), (17, 8), (18, 9), (19, 5), (20, 8);

-- =====================================================
-- ЗАКАЗЫ
-- =====================================================

INSERT INTO Orders (user_id, order_number, status, subtotal, delivery_type, delivery_price, total_price, delivery_address, delivery_time_start, delivery_time_end, created_at) VALUES 
(1, 'ORD-20240101-001', 'completed', 2500, 'courier', 300, 2800, 'г. Великий Новгород, ул. Германа, д. 15, кв. 47', '10:00', '12:00', '2024-01-01 09:00:00'),
(1, 'ORD-20240115-002', 'completed', 1800, 'pickup', 0, 1800, NULL, NULL, NULL, '2024-01-15 14:00:00'),
(1, 'ORD-20240201-003', 'completed', 5000, 'courier', 300, 5300, 'г. Великий Новгород, ул. Германа, д. 15, кв. 47', '14:00', '16:00', '2024-02-01 11:00:00'),
(1, 'ORD-20240220-004', 'completed', 6400, 'pickup', 0, 6400, NULL, NULL, NULL, '2024-02-20 16:00:00'),
(1, 'ORD-20240310-005', 'active', 6800, 'courier', 0, 6800, 'г. Великий Новгород, ул. Германа, д. 15, кв. 47', '12:00', '14:00', '2024-03-10 10:00:00'),
(1, 'ORD-20240315-006', 'cancelled', 2100, 'courier', 300, 2400, 'г. Великий Новгород, ул. Германа, д. 15, кв. 47', '16:00', '18:00', '2024-03-15 13:00:00');

-- Товары в заказах (Order_Items)
INSERT INTO Order_Items (order_id, product_id, product_name, price_per_bouquet, bouquet_count, flowers_per_bouquet, is_mix) VALUES 
(1, 1, 'Розы красные', 2500, 1, 15, false),
(2, 4, 'Тюльпаны красные', 1800, 1, 21, false),
(3, 6, 'Пионы розовые', 3200, 1, 15, false),
(3, 15, 'Весенний сад', 1800, 1, 15, true),
(4, 7, 'Пионы белые', 3200, 2, 15, false),
(5, 16, 'Нежный рассвет', 2200, 1, 21, true),
(5, 17, 'Яркое начало', 2500, 1, 25, true),
(5, 18, 'Романтическое чудо', 2100, 1, 15, true),
(6, 10, 'Лилии оранжевые', 2100, 1, 15, false);

-- Корзина
INSERT INTO Carts (user_id, session_id) VALUES (1, NULL);

-- Товары в корзине
INSERT INTO Cart_Items (cart_id, product_id, bouquet_count, flowers_per_bouquet, price_at_time) VALUES 
(1, 1, 1, 15, 2500),
(1, 2, 2, 21, 2880),
(1, 15, 1, 15, 1800);