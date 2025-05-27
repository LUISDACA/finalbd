// Configuration
const CONFIG = {
  API_URL: "http://127.0.0.1:8000",
  TOAST_DURATION: 4000,
  LOADING_DELAY: 300,
  TIMEZONE: "America/Bogota" // Cambia por tu zona horaria
};

// Utility Functions
const utils = {
  serializeForm(form) {
    const data = new FormData(form);
    return Object.fromEntries(data.entries());
  },

  // Función para formatear fechas a zona horaria local
  formatDateToLocal(dateString) {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-CO', {
        timeZone: CONFIG.TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return dateString;
    }
  },

  // Función para obtener fecha actual en zona horaria local
  getCurrentLocalDate() {
    const now = new Date();
    return now.toISOString().split('T')[0]; // Solo fecha YYYY-MM-DD
  },

  // Función para obtener fecha y hora actual en formato local
  getCurrentLocalDateTime() {
    const now = new Date();
    return now.toLocaleString('es-CO', {
      timeZone: CONFIG.TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  },

  showLoading(containerId) {
    const container = document.querySelector(`#${containerId} tbody`);
    if (container) {
      container.innerHTML = `
        <tr>
          <td colspan="100%" class="loading">
            <div class="spinner"></div>
            Cargando datos...
          </td>
        </tr>
      `;
    }
  },

  showEmptyState(containerId, message = "No hay datos disponibles") {
    const container = document.querySelector(`#${containerId} tbody`);
    if (container) {
      container.innerHTML = `
        <tr>
          <td colspan="100%" class="empty-state">
            <i class="fas fa-inbox"></i>
            <div>${message}</div>
          </td>
        </tr>
      `;
    }
  },

  showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fas fa-${this.getToastIcon(type)}"></i>
      ${message}
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "slideIn 0.3s ease reverse";
      setTimeout(() => toast.remove(), 300);
    }, CONFIG.TOAST_DURATION);
  },

  getToastIcon(type) {
    const icons = {
      success: "check-circle",
      error: "exclamation-circle",
      warning: "exclamation-triangle",
      info: "info-circle"
    };
    return icons[type] || "info-circle";
  },

  async apiRequest(endpoint, options = {}) {
    try {
      const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  },

  renderTable(headers, rows, tableId) {
    const table = document.getElementById(tableId);
    const thead = table.querySelector("thead tr");
    const tbody = table.querySelector("tbody");

    // Clear existing content
    thead.innerHTML = "";
    tbody.innerHTML = "";

    // Render headers
    headers.forEach(header => {
      const th = document.createElement("th");
      th.textContent = header;
      thead.appendChild(th);
    });

    // Render rows
    if (rows.length === 0) {
      this.showEmptyState(tableId);
      return;
    }

    rows.forEach(row => {
      const tr = document.createElement("tr");
      headers.forEach(header => {
        const td = document.createElement("td");
        let value = row[header] ?? "";
        
        // Formatear fechas si la columna contiene 'fecha' o 'date'
        if ((header.toLowerCase().includes('fecha') || header.toLowerCase().includes('date')) && value) {
          value = this.formatDateToLocal(value);
        }
        
        td.textContent = value;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  },

  // Función para ordenar datos por una columna específica
  sortData(data, column, order = 'desc') {
    return [...data].sort((a, b) => {
      let valueA = a[column];
      let valueB = b[column];
      
      // Convertir a números si es posible
      if (!isNaN(valueA) && !isNaN(valueB)) {
        valueA = Number(valueA);
        valueB = Number(valueB);
      }
      
      // Ordenar fechas
      if (column.toLowerCase().includes('fecha')) {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
      }
      
      if (order === 'desc') {
        return valueB > valueA ? 1 : valueB < valueA ? -1 : 0;
      } else {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      }
    });
  },

  validateForm(form) {
    const inputs = form.querySelectorAll("input[required], select[required]");
    let isValid = true;

    inputs.forEach(input => {
      if (!input.value.trim()) {
        input.style.borderColor = "var(--error)";
        isValid = false;
      } else {
        input.style.borderColor = "var(--border)";
      }
    });

    return isValid;
  }
};

// API Functions
const api = {
  async loadCategorias() {
    try {
      const data = await utils.apiRequest("/categorias");
      const select = document.getElementById("categoria_id");
      select.innerHTML = '<option value="">Seleccionar categoría...</option>';
      
      data.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = `${cat.id} - ${cat.nombre}`;
        select.appendChild(option);
      });
      
      return data;
    } catch (error) {
      utils.showToast("Error al cargar categorías", "error");
      return [];
    }
  },

  async loadProveedores() {
    try {
      const data = await utils.apiRequest("/proveedores");
      
      // Update proveedor select
      const proveedorSelect = document.getElementById("proveedor_id");
      proveedorSelect.innerHTML = '<option value="">Seleccionar proveedor...</option>';
      
      // Update cliente select (for compras)
      const clienteSelect = document.getElementById("cliente_proveedor");
      clienteSelect.innerHTML = '<option value="">Seleccionar proveedor...</option>';
      
      data.forEach(prov => {
        const provOption = document.createElement("option");
        provOption.value = prov.id;
        provOption.textContent = `${prov.id} - ${prov.nombre}`;
        proveedorSelect.appendChild(provOption);

        const clienteOption = document.createElement("option");
        clienteOption.value = prov.nombre;
        clienteOption.textContent = `${prov.id} - ${prov.nombre}`;
        clienteSelect.appendChild(clienteOption);
      });
      
      return data;
    } catch (error) {
      utils.showToast("Error al cargar proveedores", "error");
      return [];
    }
  },

  async loadProductos() {
    try {
      const data = await utils.apiRequest("/productos/raw");
      
      const ventaSelect = document.getElementById("venta_producto_id");
      const compraSelect = document.getElementById("producto_id");
      
      ventaSelect.innerHTML = '<option value="">Seleccionar producto...</option>';
      compraSelect.innerHTML = '<option value="">Seleccionar producto...</option>';

      data.forEach(prod => {
        const ventaOption = document.createElement("option");
        ventaOption.value = prod.id;
        ventaOption.textContent = `${prod.id} - ${prod.nombre} (Stock: ${prod.stock})`;
        ventaSelect.appendChild(ventaOption);

        const compraOption = document.createElement("option");
        compraOption.value = prod.id;
        compraOption.textContent = `${prod.id} - ${prod.nombre}`;
        compraSelect.appendChild(compraOption);
      });
      
      return data;
    } catch (error) {
      utils.showToast("Error al cargar productos", "error");
      return [];
    }
  }
};

// Data Loading Functions
async function cargarProductos(tableId = "tabla-productos") {
  utils.showLoading(tableId);
  try {
    const data = await utils.apiRequest("/productos");
    
    // Ordenar por stock de mayor a menor
    const sortedData = utils.sortData(data, 'stock', 'desc');
    
    utils.renderTable(["nombre", "precio", "stock", "categoria", "proveedor"], sortedData, tableId);
    
    // Update stats only when loading in dashboard
    if (tableId === "tabla-productos") {
      document.getElementById("total-productos").textContent = data.length;
    }
  } catch (error) {
    utils.showToast("Error al cargar productos", "error");
    utils.showEmptyState(tableId, "Error al cargar productos");
  }
}

async function cargarMasVendidos() {
  utils.showLoading("tabla-reportes");
  try {
    const data = await utils.apiRequest("/analytics/mas-vendidos");
    
    // Ordenar por total vendido de mayor a menor
    const sortedData = utils.sortData(data, 'total_vendido', 'desc');
    
    utils.renderTable(["categoria", "producto", "total_vendido"], sortedData, "tabla-reportes");
  } catch (error) {
    utils.showToast("Error al cargar productos más vendidos", "error");
    utils.showEmptyState("tabla-reportes");
  }
}

async function cargarStockProveedor() {
  utils.showLoading("tabla-reportes");
  try {
    const data = await utils.apiRequest("/analytics/stock-por-proveedor");
    
    // Ordenar por stock total de mayor a menor
    const sortedData = utils.sortData(data, 'stock_total', 'desc');
    
    utils.renderTable(["proveedor", "categoria", "stock_total"], sortedData, "tabla-reportes");
  } catch (error) {
    utils.showToast("Error al cargar stock por proveedor", "error");
    utils.showEmptyState("tabla-reportes");
  }
}

async function cargarEstadisticas() {
  try {
    // Cargar estadísticas sin mostrar en tablas
    const [productos, stockBajo, categorias] = await Promise.all([
      utils.apiRequest("/productos"),
      utils.apiRequest("/analytics/stock-bajo"),
      utils.apiRequest("/categorias")
    ]);
    
    document.getElementById("total-productos").textContent = productos.length;
    document.getElementById("stock-bajo").textContent = stockBajo.length;
    document.getElementById("total-categorias").textContent = categorias.length;
    
    // Para ventas hoy, cargar y filtrar usando fecha local
    const ventas = await utils.apiRequest("/ventas");
    const hoy = utils.getCurrentLocalDate();
    
    // Filtrar ventas de hoy considerando zona horaria local
    const ventasHoy = ventas.filter(venta => {
      if (!venta.fecha) return false;
      const fechaVenta = new Date(venta.fecha);
      const fechaVentaLocal = fechaVenta.toLocaleDateString('es-CO', {
        timeZone: CONFIG.TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).split('/').reverse().join('-'); // Convertir a YYYY-MM-DD
      
      return fechaVentaLocal === hoy;
    });
    
    document.getElementById("total-ventas").textContent = ventasHoy.length;
    
  } catch (error) {
    console.error("Error al cargar estadísticas:", error);
  }
}

async function cargarStockBajo(tableId = "tabla-reportes") {
  utils.showLoading(tableId);
  try {
    const data = await utils.apiRequest("/analytics/stock-bajo");
    
    // Ordenar por stock de menor a mayor (para ver los más críticos primero)
    const sortedData = utils.sortData(data, 'stock', 'asc');
    
    utils.renderTable(["nombre", "stock"], sortedData, tableId);
    
    // Update stats when loading in table
    document.getElementById("stock-bajo").textContent = data.length;
  } catch (error) {
    utils.showToast("Error al cargar stock bajo", "error");
    utils.showEmptyState(tableId);
  }
}

async function cargarVentasMensuales() {
  utils.showLoading("tabla-compras");
  try {
    const data = await utils.apiRequest("/analytics/ventas-mensuales");
    
    // Ordenar por total comprado de mayor a menor
    const sortedData = utils.sortData(data, 'total_comprado', 'desc');
    
    utils.renderTable(["cliente", "mes", "total_comprado"], sortedData, "tabla-compras");
  } catch (error) {
    utils.showToast("Error al cargar compras mensuales", "error");
    utils.showEmptyState("tabla-compras");
  }
}

async function cargarVentasMensualesFiltradas() {
  const mes = document.getElementById("mes_filtrado").value;
  if (!mes) {
    utils.showToast("Selecciona un mes para filtrar", "warning");
    return;
  }

  utils.showLoading("tabla-compras");
  try {
    const data = await utils.apiRequest(`/analytics/ventas-mensuales?mes=${mes}`);
    
    // Ordenar por total comprado de mayor a menor
    const sortedData = utils.sortData(data, 'total_comprado', 'desc');
    
    utils.renderTable(["cliente", "mes", "total_comprado"], sortedData, "tabla-compras");
    
    if (data.length === 0) {
      utils.showToast("No hay datos para el mes seleccionado", "info");
    }
  } catch (error) {
    utils.showToast("Error al filtrar compras mensuales", "error");
    utils.showEmptyState("tabla-compras");
  }
}

async function cargarHistorialVentas() {
  utils.showLoading("tabla-ventas");
  try {
    const data = await utils.apiRequest("/ventas");
    
    // Ordenar por fecha más reciente primero
    const sortedData = utils.sortData(data, 'fecha', 'desc');
    
    utils.renderTable(["producto", "cantidad", "cliente", "fecha"], sortedData, "tabla-ventas");
  } catch (error) {
    utils.showToast("Error al cargar historial de ventas", "error");
    utils.showEmptyState("tabla-ventas");
  }
}

async function cargarHistorialVentasFiltrado() {
  const mes = document.getElementById("mes_historial").value;
  if (!mes) {
    utils.showToast("Selecciona un mes para filtrar", "warning");
    return;
  }

  utils.showLoading("tabla-ventas");
  try {
    const data = await utils.apiRequest(`/ventas?mes=${mes}`);
    
    // Ordenar por fecha más reciente primero
    const sortedData = utils.sortData(data, 'fecha', 'desc');
    
    utils.renderTable(["producto", "cantidad", "cliente", "fecha"], sortedData, "tabla-ventas");
    
    if (data.length === 0) {
      utils.showToast("No hay ventas en ese mes", "info");
    }
  } catch (error) {
    utils.showToast("Error al filtrar historial", "error");
    utils.showEmptyState("tabla-ventas");
  }
}

// Form Handlers
document.getElementById("form-categoria").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  if (!utils.validateForm(e.target)) {
    utils.showToast("Por favor completa todos los campos", "error");
    return;
  }

  try {
    const data = utils.serializeForm(e.target);
    await utils.apiRequest("/categorias", {
      method: "POST",
      body: JSON.stringify(data)
    });
    
    utils.showToast("Categoría guardada exitosamente", "success");
    e.target.reset();
    api.loadCategorias();
    cargarEstadisticas(); // Actualizar estadísticas
  } catch (error) {
    utils.showToast("Error al guardar categoría", "error");
  }
});

document.getElementById("form-proveedor").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  if (!utils.validateForm(e.target)) {
    utils.showToast("Por favor completa todos los campos obligatorios", "error");
    return;
  }

  try {
    const data = utils.serializeForm(e.target);
    await utils.apiRequest("/proveedores", {
      method: "POST",
      body: JSON.stringify(data)
    });
    
    utils.showToast("Proveedor guardado exitosamente", "success");
    e.target.reset();
    api.loadProveedores();
  } catch (error) {
    utils.showToast("Error al guardar proveedor", "error");
  }
});

document.getElementById("form-producto").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  if (!utils.validateForm(e.target)) {
    utils.showToast("Por favor completa todos los campos", "error");
    return;
  }

  try {
    const data = utils.serializeForm(e.target);
    data.precio = parseFloat(data.precio);
    data.stock = parseInt(data.stock);
    data.categoria_id = parseInt(data.categoria_id);
    data.proveedor_id = parseInt(data.proveedor_id);

    await utils.apiRequest("/productos", {
      method: "POST",
      body: JSON.stringify(data)
    });
    
    utils.showToast("Producto guardado exitosamente", "success");
    e.target.reset();
    cargarProductos("tabla-productos");
    api.loadProductos();
    cargarEstadisticas(); // Actualizar estadísticas
  } catch (error) {
    utils.showToast("Error al guardar producto", "error");
  }
});

document.getElementById("form-compra").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  if (!utils.validateForm(e.target)) {
    utils.showToast("Por favor completa todos los campos", "error");
    return;
  }

  try {
    const data = utils.serializeForm(e.target);
    data.producto_id = parseInt(data.producto_id);
    data.cantidad = parseInt(data.cantidad);

    if (data.cantidad <= 0) {
      utils.showToast("La cantidad debe ser mayor a 0", "error");
      return;
    }

    await utils.apiRequest("/compras", {
      method: "POST",
      body: JSON.stringify(data)
    });
    
    utils.showToast("Compra registrada exitosamente", "success");
    e.target.reset();
    cargarProductos("tabla-productos");
    cargarEstadisticas(); // Actualizar estadísticas
  } catch (error) {
    utils.showToast("Error al registrar compra", "error");
  }
});

document.getElementById("form-venta").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  if (!utils.validateForm(e.target)) {
    utils.showToast("Por favor completa todos los campos", "error");
    return;
  }

  try {
    const data = utils.serializeForm(e.target);
    data.producto_id = parseInt(data.producto_id);
    data.cantidad = parseInt(data.cantidad);

    if (data.cantidad <= 0) {
      utils.showToast("La cantidad debe ser mayor a 0", "error");
      return;
    }

    await utils.apiRequest("/ventas", {
      method: "POST",
      body: JSON.stringify(data)
    });
    
    utils.showToast("Venta registrada exitosamente", "success");
    e.target.reset();
    cargarProductos("tabla-productos");
    api.loadProductos();
    cargarHistorialVentas();
    cargarEstadisticas(); // Actualizar estadísticas
  } catch (error) {
    utils.showToast("Error al registrar venta", "error");
  }
});

// Tab Navigation
document.addEventListener("DOMContentLoaded", () => {
  // Initialize tabs
  const tabButtons = document.querySelectorAll(".nav-tab");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      const targetTab = button.dataset.tab;
      
      // Update active tab button
      tabButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      
      // Update active tab content
      tabContents.forEach(content => {
        content.classList.remove("active");
        if (content.id === targetTab) {
          content.classList.add("active");
        }
      });
    });
  });

  // Load initial data
  cargarProductos("tabla-productos");
  cargarEstadisticas();
  api.loadCategorias();
  api.loadProveedores();
  api.loadProductos();
  
  // Mostrar hora actual en consola para verificar zona horaria
  console.log("🕐 Hora actual del sistema:", utils.getCurrentLocalDateTime());
  console.log("🌍 Zona horaria configurada:", CONFIG.TIMEZONE);
  console.log("📊 Ordenamiento automático activado: Mayor a menor");
});