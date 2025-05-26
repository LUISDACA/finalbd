// frontend/js/main.js
const API = "http://127.0.0.1:8000";

function serializeForm(form) {
  const data = new FormData(form);
  return Object.fromEntries(data.entries());
}

function mostrarToast(mensaje, tipo = "success") {
  const toast = document.createElement("div");
  toast.textContent = mensaje;
  toast.className = `toast toast-${tipo}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

async function cargarOpcionesCategorias() {
  const res = await fetch(`${API}/categorias`);
  const data = await res.json();
  const select = document.getElementById("categoria_id");
  select.innerHTML = "";
  data.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = `${cat.id} - ${cat.nombre}`;
    select.appendChild(opt);
  });
}

async function cargarOpcionesProveedores() {
  const res = await fetch(`${API}/proveedores`);
  const data = await res.json();
  const select = document.getElementById("proveedor_id");
  select.innerHTML = "";
  data.forEach(prov => {
    const opt = document.createElement("option");
    opt.value = prov.id;
    opt.textContent = `${prov.id} - ${prov.nombre}`;
    select.appendChild(opt);
    const clienteSelect = document.getElementById("cliente_proveedor");
  if (clienteSelect) {
    clienteSelect.innerHTML = "";
    data.forEach(prov => {
      const opt = document.createElement("option");
      opt.value = prov.nombre;
      opt.textContent = `${prov.id} - ${prov.nombre}`;
      clienteSelect.appendChild(opt);
    });
  }
  });
}

async function cargarOpcionesProductos() {
  const res = await fetch(`${API}/productos/raw`);
  const data = await res.json();

  const ventaSelect = document.getElementById("venta_producto_id");
  const compraSelect = document.getElementById("producto_id");
  ventaSelect.innerHTML = "";
  compraSelect.innerHTML = "";

  data.forEach(prod => {
    const optionVenta = document.createElement("option");
    optionVenta.value = prod.id;
    optionVenta.textContent = `${prod.id} - ${prod.nombre} (Stock: ${prod.stock})`;
    ventaSelect.appendChild(optionVenta);

    const optionCompra = document.createElement("option");
    optionCompra.value = prod.id;
    optionCompra.textContent = `${prod.id} - ${prod.nombre}`;
    compraSelect.appendChild(optionCompra);
  });
}

function renderTabla(headers, rows, tablaId) {
  const thead = document.querySelector(`#${tablaId} thead tr`);
  const tbody = document.querySelector(`#${tablaId} tbody`);
  thead.innerHTML = "";
  tbody.innerHTML = "";

  headers.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    thead.appendChild(th);
  });

  rows.forEach(obj => {
    const tr = document.createElement("tr");
    tr.innerHTML = headers.map(h => `<td>${obj[h] ?? ""}</td>`).join("");
    tbody.appendChild(tr);
  });
}

async function cargarProductos() {
  const res = await fetch(`${API}/productos`);
  const data = await res.json();
  renderTabla(["nombre", "precio", "stock", "categoria", "proveedor"], data, "tabla-productos");
}

async function cargarMasVendidos() {
  const res = await fetch(`${API}/analytics/mas-vendidos`);
  const data = await res.json();
  renderTabla(["categoria", "producto", "total_vendido"], data, "tabla-productos");
}

async function cargarStockProveedor() {
  const res = await fetch(`${API}/analytics/stock-por-proveedor`);
  const data = await res.json();
  renderTabla(["proveedor", "categoria", "stock_total"], data, "tabla-productos");
}

async function cargarStockBajo() {
  const res = await fetch(`${API}/analytics/stock-bajo`);
  const data = await res.json();
  renderTabla(["nombre", "stock"], data, "tabla-productos");
}

async function cargarVentasMensuales() {
  const res = await fetch(`${API}/analytics/ventas-mensuales`);
  const data = await res.json();
  renderTabla(["cliente", "mes", "total_comprado"], data, "tabla-productos");
}

async function cargarHistorialVentas() {
  const res = await fetch(`${API}/ventas`);
  const data = await res.json();
  renderTabla(["producto", "cantidad", "cliente", "fecha"], data, "tabla-ventas");
}

async function cargarVentasMensualesFiltradas() {
  const mes = document.getElementById("mes_filtrado").value;
  if (!mes) {
    return mostrarToast("Selecciona un mes", "error");
  }

  try {
    const res = await fetch(`${API}/analytics/ventas-mensuales?mes=${mes}`);
    const data = await res.json();
    renderTabla(["cliente", "mes", "total_comprado"], data, "tabla-productos");
  } catch (error) {
    mostrarToast("Error al cargar ventas filtradas", "error");
  }
}


document.getElementById("form-categoria").addEventListener("submit", async e => {
  e.preventDefault();
  const data = serializeForm(e.target);
  const res = await fetch(`${API}/categorias`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  mostrarToast("Categoría guardada ✅");
  e.target.reset();
  cargarOpcionesCategorias();
});

document.getElementById("form-proveedor").addEventListener("submit", async e => {
  e.preventDefault();
  const data = serializeForm(e.target);
  const res = await fetch(`${API}/proveedores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  mostrarToast("Proveedor guardado ✅");
  e.target.reset();
  cargarOpcionesProveedores();
});

document.getElementById("form-producto").addEventListener("submit", async e => {
  e.preventDefault();
  const data = serializeForm(e.target);
  data.precio = parseFloat(data.precio);
  data.stock = parseInt(data.stock);
  data.categoria_id = parseInt(data.categoria_id);
  data.proveedor_id = parseInt(data.proveedor_id);

  const res = await fetch(`${API}/productos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  mostrarToast("Producto guardado ✅");
  e.target.reset();
  cargarProductos();
  cargarOpcionesProductos();
});

document.getElementById("form-compra").addEventListener("submit", async e => {
  e.preventDefault();
  const data = serializeForm(e.target);
  data.producto_id = parseInt(data.producto_id);
  data.cantidad = parseInt(data.cantidad);

  const res = await fetch(`${API}/compras`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  mostrarToast("Compra registrada ✅");
  e.target.reset();
  cargarProductos();
});

document.getElementById("form-venta").addEventListener("submit", async e => {
  e.preventDefault();
  const data = serializeForm(e.target);
  data.producto_id = parseInt(data.producto_id);
  data.cantidad = parseInt(data.cantidad);

  if (data.cantidad <= 0) {
    return mostrarToast("Cantidad debe ser mayor a 0", "error");
  }

  const res = await fetch(`${API}/ventas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (res.ok) {
    mostrarToast("Venta registrada correctamente ✅", "success");
    e.target.reset();
    cargarProductos();
    cargarOpcionesProductos();
  } else {
    const err = await res.json();
    mostrarToast(err.detail || "Error al registrar venta", "error");
  }
});

async function cargarHistorialVentasFiltrado() {
  const mes = document.getElementById("mes_historial").value;
  if (!mes) {
    return mostrarToast("Selecciona un mes", "error");
  }

  try {
    const res = await fetch(`${API}/ventas?mes=${mes}`);
    const data = await res.json();
    if (data.length === 0) {
      mostrarToast("No hay ventas en ese mes", "info");
    }
    renderTabla(["producto", "cantidad", "cliente", "fecha"], data, "tabla-ventas");
  } catch (error) {
    mostrarToast("Error al filtrar historial", "error");
  }
}


document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  cargarOpcionesCategorias();
  cargarOpcionesProveedores();
  cargarOpcionesProductos();
});
