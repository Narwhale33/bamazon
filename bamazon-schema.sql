-- For Customer View, populates starting items

DROP DATABASE IF EXISTS bamazon_db;
CREATE DATABASE bamazon_db;

USE bamazon_db;

CREATE TABLE products (
    item_id INTEGER (10) AUTO_INCREMENT NOT NULL,
    product_name VARCHAR (100) NOT NULL,
    department_name VARCHAR (100) NOT NULL,
    price DECIMAL (15,2) NOT NULL,
    stock_quantity INTEGER (60) NOT NULL,
    product_sales INTEGER (60) NOT NULL
    PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Blue Jeans", "Apparel", "20", "30");

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Striped Shirt", "Apparel", "10", "30");

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Graphic Tee", "Apparel", "15", "30");

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Toaster", "Appliances", "50", "15");

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Blender", "Appliances", "80", "10");

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Vacuum", "Appliances", "180", "20");

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Microwave", "Appliances", "70", "10");

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Speakers", "Electronics", "100", "10");

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Microphone", "Electronics", "35", "40");

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("VR Headset", "Electronics", "250", "30");

SELECT * FROM products;