// Variables globales
let favoritosContactos = [];
let fotosGuardadas = [];

// Inicializar cuando carga el DOM
document.addEventListener('DOMContentLoaded', function() {
  cargarFavoritos();
  inicializarEventos();
  actualizarContadores();
});

// ============ FUNCIONES GENERALES ============

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${tipo}`;
  notification.textContent = mensaje;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Actualizar contadores en la navegación
function actualizarContadores() {
  cargarFavoritos();
  const totalFavoritos = favoritosContactos.length + fotosGuardadas.length;
  const badges = document.querySelectorAll('#favoritosCount');
  badges.forEach(badge => {
    badge.textContent = totalFavoritos;
  });
}

// Cargar favoritos desde localStorage
function cargarFavoritos() {
  const storedContactos = localStorage.getItem('favoritosContactos');
  const storedFotos = localStorage.getItem('fotosGuardadas');
  
  favoritosContactos = storedContactos ? JSON.parse(storedContactos) : [];
  fotosGuardadas = storedFotos ? JSON.parse(storedFotos) : [];
}

// Guardar favoritos en localStorage
function guardarFavoritos() {
  localStorage.setItem('favoritosContactos', JSON.stringify(favoritosContactos));
  localStorage.setItem('fotosGuardadas', JSON.stringify(fotosGuardadas));
  actualizarContadores();
}

// ============ EVENTOS GENERALES ============

function inicializarEventos() {
  // Like en fotos
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const fotoId = this.getAttribute('data-foto-id');
      darLike(fotoId, this);
    });
  });

  // Agregar fotos a favoritos
  document.querySelectorAll('.favorito-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const fotoId = this.getAttribute('data-foto-id');
      const titulo = this.getAttribute('data-titulo');
      agregarFotoFavorito(fotoId, titulo);
    });
  });

  // Contactos - AJAX
  if (document.getElementById('searchContactos')) {
    inicializarContactosAJAX();
  }

  // Página de favoritos
  if (document.getElementById('contactosFavoritosContainer')) {
    cargarContactosFavoritos();
    cargarFotosGuardadas();
  }
}

// ============ LIKES EN FOTOS ============

function darLike(fotoId, btn) {
  fetch('/api/fotos/like', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fotoId: parseInt(fotoId) })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const countSpan = btn.querySelector('.like-count');
      countSpan.textContent = data.newLikes;
      btn.classList.add('liked');
      mostrarNotificacion('¡Te ha gustado esta foto!');
      
      setTimeout(() => {
        btn.classList.remove('liked');
      }, 500);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    mostrarNotificacion('Error al dar like', 'error');
  });
}

// ============ FOTOS EN FAVORITOS ============

function agregarFotoFavorito(fotoId, titulo) {
  const existe = fotosGuardadas.find(f => f.id === parseInt(fotoId));
  
  if (!existe) {
    fotosGuardadas.push({
      id: parseInt(fotoId),
      titulo: titulo,
      url: document.querySelector(`[data-foto-id="${fotoId}"] img`).src,
      agregadoEn: new Date().toLocaleString()
    });
    guardarFavoritos();
    mostrarNotificacion(`📸 "${titulo}" agregada a favoritos`);
  } else {
    mostrarNotificacion('Esta foto ya está en favoritos', 'info');
  }
}

// ============ CONTACTOS CON AJAX ============

function inicializarContactosAJAX() {
  const btnBuscar = document.getElementById('btnBuscar');
  const searchInput = document.getElementById('searchContactos');

  // Buscar al escribir
  searchInput.addEventListener('keyup', function() {
    if (this.value.length > 0) {
      buscarContactos(this.value);
    } else {
      cargarContactos();
    }
  });

  // Buscar al hacer clic
  btnBuscar.addEventListener('click', function() {
    if (searchInput.value.length > 0) {
      buscarContactos(searchInput.value);
    } else {
      cargarContactos();
    }
  });

  // Agregar contacto a favoritos
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('agregar-favorito-btn')) {
      const contactoId = parseInt(e.target.getAttribute('data-contacto-id'));
      const nombre = e.target.getAttribute('data-nombre');
      agregarContactoFavorito(contactoId, nombre);
    }
    
    if (e.target.classList.contains('enviar-mensaje-btn')) {
      const contactoId = parseInt(e.target.getAttribute('data-contacto-id'));
      const nombre = e.target.getAttribute('data-nombre');
      abrirModalMensaje(contactoId, nombre);
    }
  });

  cargarContactos();
}

// Cargar todos los contactos
function cargarContactos() {
  fetch('/api/contactos')
    .then(response => response.json())
    .then(contactos => {
      mostrarContactos(contactos);
      document.getElementById('sinResultados').style.display = 'none';
    })
    .catch(error => {
      console.error('Error al cargar contactos:', error);
      mostrarNotificacion('Error al cargar contactos', 'error');
    });
}

// Mostrar contactos en la página
function mostrarContactos(contactos) {
  const container = document.getElementById('contactosContainer');
  
  if (contactos.length === 0) {
    container.innerHTML = '';
    document.getElementById('sinResultados').style.display = 'block';
    return;
  }

  container.innerHTML = contactos.map(contacto => `
    <div class="col-md-6 mb-4 contacto-item fade-in">
      <div class="card shadow-sm border-0 h-100 contacto-card" data-contacto-id="${contacto.id}">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h5 class="card-title mb-0">${contacto.nombre}</h5>
              <small class="text-muted">Contacto</small>
            </div>
            <span class="badge bg-primary contacto-badge">ID: ${contacto.id}</span>
          </div>

          <div class="contact-info mb-3">
            <p class="mb-2">
              <strong>📧 Email:</strong><br>
              <a href="mailto:${contacto.email}">${contacto.email}</a>
            </p>
            <p class="mb-2">
              <strong>📞 Teléfono:</strong><br>
              <a href="tel:${contacto.telefono}">${contacto.telefono}</a>
            </p>
          </div>

          <div class="d-grid gap-2">
            <button class="btn btn-outline-primary btn-sm enviar-mensaje-btn" data-contacto-id="${contacto.id}" data-nombre="${contacto.nombre}">
              ✉️ Enviar Mensaje
            </button>
            <button class="btn btn-outline-warning btn-sm agregar-favorito-btn" data-contacto-id="${contacto.id}" data-nombre="${contacto.nombre}">
              ⭐ Agregar a Favoritos
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  document.getElementById('sinResultados').style.display = 'none';
}

// Buscar contactos
function buscarContactos(termino) {
  fetch('/api/contactos')
    .then(response => response.json())
    .then(contactos => {
      const filtrados = contactos.filter(c => 
        c.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        c.email.toLowerCase().includes(termino.toLowerCase())
      );
      
      if (filtrados.length === 0) {
        document.getElementById('contactosContainer').innerHTML = '';
        document.getElementById('sinResultados').style.display = 'block';
      } else {
        mostrarContactos(filtrados);
      }
    });
}

// Agregar contacto a favoritos
function agregarContactoFavorito(contactoId, nombre) {
  fetch('/api/contactos/agregar-favorito', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: contactoId })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const existe = favoritosContactos.find(f => f.id === contactoId);
      if (!existe) {
        favoritosContactos.push({ id: contactoId, nombre: nombre });
        guardarFavoritos();
      }
      mostrarNotificacion(`📞 "${nombre}" agregado a favoritos`);
    } else {
      mostrarNotificacion(data.mensaje, 'info');
    }
  });
}

// Modal para mensajes
function abrirModalMensaje(contactoId, nombre) {
  document.getElementById('nombreContacto').textContent = nombre;
  const modal = new bootstrap.Modal(document.getElementById('modalMensaje'));
  
  document.getElementById('btnEnviarMensaje').onclick = function() {
    const asunto = document.getElementById('asunto').value;
    const mensaje = document.getElementById('mensaje').value;
    
    if (asunto && mensaje) {
      mostrarNotificacion(`✉️ Mensaje enviado a ${nombre}`);
      document.getElementById('formularioMensaje').reset();
      modal.hide();
    } else {
      mostrarNotificacion('Por favor completa todos los campos', 'error');
    }
  };
  
  modal.show();
}

// ============ PÁGINA DE FAVORITOS ============

function cargarContactosFavoritos() {
  cargarFavoritos();
  const container = document.getElementById('contactosFavoritosContainer');
  const sinElementos = document.getElementById('sinContactosFav');
  const contador = document.getElementById('countContactosFav');

  if (favoritosContactos.length === 0) {
    container.innerHTML = '';
    sinElementos.style.display = 'block';
    contador.textContent = '0';
    return;
  }

  sinElementos.style.display = 'none';
  contador.textContent = favoritosContactos.length;

  container.innerHTML = '<div class="row">' + favoritosContactos.map(contacto => `
    <div class="col-md-6 mb-4 fade-in">
      <div class="card shadow-sm border-0 h-100">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h5 class="card-title mb-0">${contacto.nombre}</h5>
            <button class="btn btn-sm btn-danger eliminar-contacto-fav" data-contacto-id="${contacto.id}">
              ✕
            </button>
          </div>
          <p class="text-muted">Contacto Favorito</p>
          <p><small>ID: ${contacto.id}</small></p>
          <a href="tel:" class="btn btn-sm btn-primary">📞 Llamar</a>
        </div>
      </div>
    </div>
  `).join('') + '</div>';

  // Agregar evento para eliminar
  document.querySelectorAll('.eliminar-contacto-fav').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.getAttribute('data-contacto-id'));
      favoritosContactos = favoritosContactos.filter(f => f.id !== id);
      guardarFavoritos();
      cargarContactosFavoritos();
      mostrarNotificacion('Contacto eliminado de favoritos');
    });
  });
}

function cargarFotosGuardadas() {
  cargarFavoritos();
  const container = document.getElementById('fotosGuardasContainer');
  const sinElementos = document.getElementById('sinFotosGuardadas');
  const contador = document.getElementById('countFotosGuardadas');

  if (fotosGuardadas.length === 0) {
    container.innerHTML = '';
    sinElementos.style.display = 'block';
    contador.textContent = '0';
    return;
  }

  sinElementos.style.display = 'none';
  contador.textContent = fotosGuardadas.length;

  container.innerHTML = '<div class="row">' + fotosGuardadas.map(foto => `
    <div class="col-md-4 mb-4 fade-in">
      <div class="card shadow-lg hover-card position-relative">
        <img src="${foto.url}" class="card-img-top" alt="${foto.titulo}" style="height: 250px; object-fit: cover;">
        <div class="card-body">
          <h6 class="card-title">${foto.titulo}</h6>
          <small class="text-muted">Guardada: ${foto.agregadoEn}</small>
          <div class="mt-3">
            <button class="btn btn-sm btn-danger eliminar-foto-fav" data-foto-id="${foto.id}">
              🗑️ Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('') + '</div>';

  // Agregar evento para eliminar
  document.querySelectorAll('.eliminar-foto-fav').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.getAttribute('data-foto-id'));
      fotosGuardadas = fotosGuardadas.filter(f => f.id !== id);
      guardarFavoritos();
      cargarFotosGuardadas();
      mostrarNotificacion('Foto eliminada de favoritos');
    });
  });
}

// Reinicializar eventos cuando el DOM cambia
document.addEventListener('DOMContentLoaded', function() {
  inicializarEventos();
});

// Re-inicializar eventos cuando se cambia de tab
document.addEventListener('shown.bs.tab', function() {
  if (document.getElementById('contactosFavoritosContainer')) {
    cargarContactosFavoritos();
    cargarFotosGuardadas();
  }
});
