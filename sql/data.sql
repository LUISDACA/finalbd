USE inventario_tech;

INSERT INTO Categoria (nombre) VALUES ('Laptops'), ('Monitores'), ('Accesorios');

INSERT INTO Proveedor (nombre, telefono, email) VALUES
('TechSupplier', '3001234567', 'contacto@techsupplier.com'),
('GigaTech', '3019876543', 'ventas@gigatech.com');

INSERT INTO Producto (nombre, descripcion, precio, stock, categoria_id, proveedor_id) VALUES
('Laptop Lenovo i5', '14 pulgadas, 8GB RAM', 2200000, 12, 1, 1),
('Monitor LG 24"', 'Full HD', 700000, 7, 2, 2),
('Mouse inalámbrico', 'Conectividad USB', 50000, 4, 3, 2),
('Teclado mecánico', 'RGB, switches azules', 150000, 3, 3, 1);

INSERT INTO Compra (producto_id, cantidad, cliente) VALUES
(1, 2, 'Juan Pérez'),
(2, 1, 'Laura Gómez'),
(3, 2, 'Carlos Díaz'),
(1, 1, 'Ana Torres'),
(4, 1, 'Miguel Soto');
