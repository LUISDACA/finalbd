-- Consulta 1: Productos más vendidos por categoría
SELECT 
    c.nombre AS categoria,
    p.nombre AS producto,
    SUM(v.cantidad) AS total_vendido
FROM venta v
JOIN producto p ON v.producto_id = p.id
JOIN categoria c ON p.categoria_id = c.id
GROUP BY c.nombre, p.nombre
ORDER BY total_vendido DESC;

-- Consulta 2: Stock actual por proveedor y categoría
SELECT 
    pr.nombre AS proveedor,
    c.nombre AS categoria,
    SUM(p.stock) AS stock_total
FROM producto p
JOIN proveedor pr ON p.proveedor_id = pr.id
JOIN categoria c ON p.categoria_id = c.id
GROUP BY pr.nombre, c.nombre
ORDER BY pr.nombre, c.nombre;

-- Consulta 3: Productos con menos de 5 unidades en stock
SELECT 
    p.nombre AS producto,
    p.stock,
    c.nombre AS categoria,
    pr.nombre AS proveedor
FROM producto p
JOIN categoria c ON p.categoria_id = c.id
JOIN proveedor pr ON p.proveedor_id = pr.id
WHERE p.stock < 5
ORDER BY p.stock ASC;

-- Consulta 4: Ventas mensuales por cliente
SELECT 
    v.cliente,
    DATE_FORMAT(v.fecha, '%Y-%m') AS mes,
    SUM(v.cantidad) AS total_comprado
FROM venta v
GROUP BY v.cliente, mes
ORDER BY mes, v.cliente;
