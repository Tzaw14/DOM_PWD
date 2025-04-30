// Obtener referencias a los elementos del DOM
const formMadera = document.getElementById('form-madera');
const tipoSelect = document.getElementById('tipo');
const cantidadInput = document.getElementById('cantidad');
const precioInput = document.getElementById('precio');
const calidadInput = document.getElementById('calidad');
const filtroSelect = document.getElementById('filtro');
const inventarioContainer = document.getElementById('inventario-container');
const btnBorrarTodo = document.getElementById('btn-borrar-todo');
const notificacion = document.getElementById('notificacion');

// Sistema de calificación con estrellas
const estrellas = document.querySelectorAll('.star');
estrellas.forEach(estrella => {
  estrella.addEventListener('mouseover', function() {
    const valor = parseInt(this.dataset.value);
    
    // Marcar estrellas hasta la que está el cursor
    estrellas.forEach(e => {
      if (parseInt(e.dataset.value) <= valor) {
        e.classList.add('active');
      } else {
        e.classList.remove('active');
      }
    });
  });
  
  estrella.addEventListener('mouseout', function() {
    const valorActual = parseInt(calidadInput.value);
    
    // Restaurar a la selección actual al quitar el cursor
    estrellas.forEach(e => {
      if (parseInt(e.dataset.value) <= valorActual) {
        e.classList.add('active');
      } else {
        e.classList.remove('active');
      }
    });
  });
  
  estrella.addEventListener('click', function() {
    const valor = parseInt(this.dataset.value);
    calidadInput.value = valor;
    
    // Actualizar todas las estrellas
    estrellas.forEach(e => {
      if (parseInt(e.dataset.value) <= valor) {
        e.classList.add('active');
      } else {
        e.classList.remove('active');
      }
    });
  });
});

// Función para abrir o crear la base de datos
function abrirBaseDeDatos() {
  return new Promise(function(resolve, reject) {
    // Comprobar si IndexedDB está disponible
    if (!window.indexedDB) {
      mostrarNotificacion("Tu navegador no soporta IndexedDB. Algunas funciones no estarán disponibles.", "error");
      reject("IndexedDB no está disponible");
      return;
    }
    
    try {
      const request = indexedDB.open("AserraderoDB", 1);

      request.onerror = function(event) {
        console.error("Error IndexedDB:", event);
        mostrarNotificacion("Error al acceder a la base de datos", "error");
        reject("Error al abrir la base de datos: " + (event.target.error ? event.target.error : "Desconocido"));
      };

      request.onsuccess = function(event) {
        resolve(event.target.result);
      };

      request.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("Inventario")) {
          db.createObjectStore("Inventario", { keyPath: "id", autoIncrement: true });
        }
      };
    } catch (error) {
      console.error("Error al inicializar IndexedDB:", error);
      mostrarNotificacion("Error al inicializar la base de datos", "error");
      reject(error);
    }
  });
}

// Función para agregar madera al inventario
function agregarMadera(tipo, cantidad, precio, calidad) {
  // Convertir a números
  cantidad = parseFloat(cantidad);
  precio = parseFloat(precio);
  calidad = parseInt(calidad);
  
  const fecha = new Date();
  const total = cantidad * precio;
  
  const madera = {
    tipo,
    cantidad,
    precio,
    calidad,
    total,
    fecha: fecha.toISOString()
  };
  
  abrirBaseDeDatos()
    .then(function(db) {
      const transaction = db.transaction(["Inventario"], "readwrite");
      const store = transaction.objectStore("Inventario");
      return store.add(madera);
    })
    .then(function() {
      mostrarNotificacion(`${cantidad} m³ de ${tipo} agregado al inventario`, "exito");
      mostrarInventario();
    })
    .catch(function(error) {
      console.error(error);
      mostrarNotificacion("Error al guardar en la base de datos", "error");
    });
}

// Función para mostrar el inventario en la página
function mostrarInventario(filtro = "todos") {
  abrirBaseDeDatos()
    .then(function(db) {
      const transaction = db.transaction(["Inventario"], "readonly");
      const store = transaction.objectStore("Inventario");
      const request = store.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = function(event) {
          resolve(event.target.result);
        };
        
        request.onerror = function(event) {
          reject("Error al obtener datos: " + event.target.errorCode);
        };
      });
    })
    .then(function(maderas) {
      inventarioContainer.innerHTML = "";
      
      // Filtrar si es necesario
      if (filtro !== "todos") {
        maderas = maderas.filter(madera => madera.tipo === filtro);
      }
      
      if (maderas.length === 0) {
        const mensaje = document.createElement('p');
        mensaje.textContent = "No hay maderas en el inventario";
        mensaje.style.textAlign = "center";
        mensaje.style.padding = "20px";
        mensaje.style.gridColumn = "1 / -1";
        inventarioContainer.appendChild(mensaje);
        return;
      }
      
      // Mostrar cada madera
      maderas.forEach(madera => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'inventario-item';
        itemDiv.dataset.id = madera.id;
        
        const tipoDiv = document.createElement('div');
        tipoDiv.className = 'inventario-tipo';
        tipoDiv.textContent = madera.tipo;
        
        const cantidadDiv = document.createElement('div');
        cantidadDiv.className = 'inventario-info';
        cantidadDiv.textContent = `Cantidad: ${madera.cantidad} m³`;
        
        const precioDiv = document.createElement('div');
        precioDiv.className = 'inventario-info';
        precioDiv.textContent = `Precio: $${madera.precio}/m³`;
        
        const calidadDiv = document.createElement('div');
        calidadDiv.className = 'inventario-calidad';
        calidadDiv.textContent = '★'.repeat(madera.calidad) + '☆'.repeat(5 - madera.calidad);
        
        const totalDiv = document.createElement('div');
        totalDiv.className = 'inventario-total';
        totalDiv.textContent = `Total: $${madera.total.toFixed(2)}`;
        
        const fechaDiv = document.createElement('div');
        fechaDiv.className = 'inventario-info';
        fechaDiv.textContent = `Fecha: ${new Date(madera.fecha).toLocaleDateString()}`;
        
        const btnEliminar = document.createElement('button');
        btnEliminar.className = 'btn-eliminar';
        btnEliminar.textContent = 'X';
        btnEliminar.addEventListener('click', function() {
          eliminarMadera(madera.id);
        });
        
        // Agregar todos los elementos al item
        itemDiv.appendChild(tipoDiv);
        itemDiv.appendChild(cantidadDiv);
        itemDiv.appendChild(precioDiv);
        itemDiv.appendChild(calidadDiv);
        itemDiv.appendChild(totalDiv);
        itemDiv.appendChild(fechaDiv);
        itemDiv.appendChild(btnEliminar);
        
        // Agregar el item al contenedor
        inventarioContainer.appendChild(itemDiv);
      });
    })
    .catch(function(error) {
      console.error(error);
      mostrarNotificacion("Error al cargar el inventario", "error");
    });
}

// Función para eliminar una madera del inventario
function eliminarMadera(id) {
  abrirBaseDeDatos()
    .then(function(db) {
      const transaction = db.transaction(["Inventario"], "readwrite");
      const store = transaction.objectStore("Inventario");
      return store.delete(id);
    })
    .then(function() {
      mostrarNotificacion("Madera eliminada del inventario", "exito");
      mostrarInventario(filtroSelect.value);
    })
    .catch(function(error) {
      console.error(error);
      mostrarNotificacion("Error al eliminar la madera", "error");
    });
}

// Función para borrar todo el inventario
function borrarTodoInventario() {
  if (confirm("¿Estás seguro de que deseas borrar todo el inventario?")) {
    abrirBaseDeDatos()
      .then(function(db) {
        const transaction = db.transaction(["Inventario"], "readwrite");
        const store = transaction.objectStore("Inventario");
        return store.clear();
      })
      .then(function() {
        mostrarNotificacion("Inventario completamente borrado", "exito");
        mostrarInventario();
      })
      .catch(function(error) {
        console.error(error);
        mostrarNotificacion("Error al borrar el inventario", "error");
      });
  }
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = "normal") {
  notificacion.textContent = mensaje;
  notificacion.className = "notificacion";
  
  if (tipo === "exito") {
    notificacion.classList.add("exito");
  } else if (tipo === "error") {
    notificacion.classList.add("error");
  }
  
  notificacion.classList.add("mostrar");
  
  // Ocultar después de 3 segundos
  setTimeout(() => {
    notificacion.classList.remove("mostrar");
  }, 3000);
}

// Eventos

// Envío del formulario para agregar madera
formMadera.addEventListener('submit', function(event) {
  event.preventDefault();
  
  const tipo = tipoSelect.value;
  const cantidad = cantidadInput.value;
  const precio = precioInput.value;
  const calidad = calidadInput.value;
  
  // Validar calidad
  if (calidad === "0") {
    mostrarNotificacion("Por favor selecciona una calidad", "error");
    return;
  }
  
  agregarMadera(tipo, cantidad, precio, calidad);
  formMadera.reset();
  
  // Resetear estrellas
  estrellas.forEach(e => e.classList.remove('active'));
  calidadInput.value = "0";
});

// Filtrar inventario
filtroSelect.addEventListener('change', function() {
  mostrarInventario(this.value);
});

// Botón para borrar todo
btnBorrarTodo.addEventListener('click', borrarTodoInventario);

// Versión alternativa sin IndexedDB para casos donde falle
let inventarioLocal = [];

// Función para agregar madera al inventario local
function agregarMaderaLocal(tipo, cantidad, precio, calidad) {
  cantidad = parseFloat(cantidad);
  precio = parseFloat(precio);
  calidad = parseInt(calidad);
  
  const fecha = new Date();
  const total = cantidad * precio;
  
  const madera = {
    id: Date.now(), // Usar timestamp como ID único
    tipo,
    cantidad,
    precio,
    calidad,
    total,
    fecha: fecha.toISOString()
  };
  
  inventarioLocal.push(madera);
  mostrarNotificacion(`${cantidad} m³ de ${tipo} agregado al inventario`, "exito");
  mostrarInventarioLocal(filtroSelect.value);
}

// Función para mostrar el inventario local
function mostrarInventarioLocal(filtro = "todos") {
  inventarioContainer.innerHTML = "";
  
  // Filtrar si es necesario
  let maderasFiltradas = inventarioLocal;
  if (filtro !== "todos") {
    maderasFiltradas = inventarioLocal.filter(madera => madera.tipo === filtro);
  }
  
  if (maderasFiltradas.length === 0) {
    const mensaje = document.createElement('p');
    mensaje.textContent = "No hay maderas en el inventario";
    mensaje.style.textAlign = "center";
    mensaje.style.padding = "20px";
    mensaje.style.gridColumn = "1 / -1";
    inventarioContainer.appendChild(mensaje);
    return;
  }
  
  // Mostrar cada madera
  maderasFiltradas.forEach(madera => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'inventario-item';
    itemDiv.dataset.id = madera.id;
    
    const tipoDiv = document.createElement('div');
    tipoDiv.className = 'inventario-tipo';
    tipoDiv.textContent = madera.tipo;
    
    const cantidadDiv = document.createElement('div');
    cantidadDiv.className = 'inventario-info';
    cantidadDiv.textContent = `Cantidad: ${madera.cantidad} m³`;
    
    const precioDiv = document.createElement('div');
    precioDiv.className = 'inventario-info';
    precioDiv.textContent = `Precio: ${madera.precio}/m³`;
    
    const calidadDiv = document.createElement('div');
    calidadDiv.className = 'inventario-calidad';
    calidadDiv.textContent = '★'.repeat(madera.calidad) + '☆'.repeat(5 - madera.calidad);
    
    const totalDiv = document.createElement('div');
    totalDiv.className = 'inventario-total';
    totalDiv.textContent = `Total: ${madera.total.toFixed(2)}`;
    
    const fechaDiv = document.createElement('div');
    fechaDiv.className = 'inventario-info';
    fechaDiv.textContent = `Fecha: ${new Date(madera.fecha).toLocaleDateString()}`;
    
    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'btn-eliminar';
    btnEliminar.textContent = 'X';
    btnEliminar.addEventListener('click', function() {
      eliminarMaderaLocal(madera.id);
    });
    
    // Agregar todos los elementos al item
    itemDiv.appendChild(tipoDiv);
    itemDiv.appendChild(cantidadDiv);
    itemDiv.appendChild(precioDiv);
    itemDiv.appendChild(calidadDiv);
    itemDiv.appendChild(totalDiv);
    itemDiv.appendChild(fechaDiv);
    itemDiv.appendChild(btnEliminar);
    
    // Agregar el item al contenedor
    inventarioContainer.appendChild(itemDiv);
  });
}

// Función para eliminar una madera del inventario local
function eliminarMaderaLocal(id) {
  const index = inventarioLocal.findIndex(madera => madera.id === id);
  if (index !== -1) {
    inventarioLocal.splice(index, 1);
    mostrarNotificacion("Madera eliminada del inventario", "exito");
    mostrarInventarioLocal(filtroSelect.value);
  }
}

// Variable para controlar si usar IndexedDB o almacenamiento local
let usarIndexedDB = true;

// Cargar inventario al iniciar la página
document.addEventListener('DOMContentLoaded', function() {
  // Intentar usar IndexedDB primero
  abrirBaseDeDatos()
    .then(() => {
      mostrarInventario();
      console.log("IndexedDB funcionando correctamente");
    })
    .catch(error => {
      console.error("Error con IndexedDB, usando memoria local:", error);
      usarIndexedDB = false;
      
      // Modificar los eventos para usar almacenamiento local
      formMadera.removeEventListener('submit', handleSubmit);
      formMadera.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const tipo = tipoSelect.value;
        const cantidad = cantidadInput.value;
        const precio = precioInput.value;
        const calidad = calidadInput.value;
        
        if (calidad === "0") {
          mostrarNotificacion("Por favor selecciona una calidad", "error");
          return;
        }
        
        agregarMaderaLocal(tipo, cantidad, precio, calidad);
        formMadera.reset();
        estrellas.forEach(e => e.classList.remove('active'));
        calidadInput.value = "0";
      });
      
      // Cambiar el filtro para usar almacenamiento local
      filtroSelect.removeEventListener('change', handleFilterChange);
      filtroSelect.addEventListener('change', function() {
        mostrarInventarioLocal(this.value);
      });
      
      // Cambiar botón borrar todo para usar almacenamiento local
      btnBorrarTodo.removeEventListener('click', borrarTodoInventario);
      btnBorrarTodo.addEventListener('click', function() {
        if (confirm("¿Estás seguro de que deseas borrar todo el inventario?")) {
          inventarioLocal = [];
          mostrarNotificacion("Inventario completamente borrado", "exito");
          mostrarInventarioLocal();
        }
      });
      
      mostrarInventarioLocal();
    });
});

// Función para manejar el submit del formulario (para poder quitarlo después si es necesario)
function handleSubmit(event) {
  event.preventDefault();
  
  const tipo = tipoSelect.value;
  const cantidad = cantidadInput.value;
  const precio = precioInput.value;
  const calidad = calidadInput.value;
  
  if (calidad === "0") {
    mostrarNotificacion("Por favor selecciona una calidad", "error");
    return;
  }
  
  agregarMadera(tipo, cantidad, precio, calidad);
  formMadera.reset();
  estrellas.forEach(e => e.classList.remove('active'));
  calidadInput.value = "0";
}

// Función para manejar el cambio de filtro (para poder quitarlo después si es necesario)
function handleFilterChange() {
  mostrarInventario(this.value);
}

// Registrar eventos iniciales
formMadera.addEventListener('submit', handleSubmit);
filtroSelect.addEventListener('change', handleFilterChange);