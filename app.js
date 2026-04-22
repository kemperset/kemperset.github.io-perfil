const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Configurar EJS como motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Datos simulados
const datos = {
  perfil: {
    nombre: 'Juan Carlos',
    apellido: 'López García',
    descripcion: 'Desarrollador web apasionado por la tecnología. Me encanta crear aplicaciones interactivas y aprender nuevas tecnologías.',
    foto: 'https://via.placeholder.com/200?text=Juan+Carlos',
    ciudad: 'Madrid',
    profesion: 'Desarrollador Web',
    email: 'juan@example.com'
  },
  
  albumes: [
    {
      id: 1,
      nombre: 'Vacaciones 2025',
      descripcion: 'Fotos de mis vacaciones de verano',
      fotos: [
        { id: 1, url: 'https://via.placeholder.com/300?text=Playa+1', titulo: 'Playa hermosa', likes: 12 },
        { id: 2, url: 'https://via.placeholder.com/300?text=Playa+2', titulo: 'Atardecer', likes: 25 },
        { id: 3, url: 'https://via.placeholder.com/300?text=Playa+3', titulo: 'Puesta de sol', likes: 18 }
      ]
    },
    {
      id: 2,
      nombre: 'Viaje a Barcelona',
      descripcion: 'Fotos de mi viaje a Barcelona',
      fotos: [
        { id: 4, url: 'https://via.placeholder.com/300?text=Barcelona+1', titulo: 'Sagrada Familia', likes: 42 },
        { id: 5, url: 'https://via.placeholder.com/300?text=Barcelona+2', titulo: 'Park Güell', likes: 35 },
        { id: 6, url: 'https://via.placeholder.com/300?text=Barcelona+3', titulo: 'Playa Barceloneta', likes: 28 }
      ]
    },
    {
      id: 3,
      nombre: 'Actividades',
      descripcion: 'Fotos de mis actividades favoritas',
      fotos: [
        { id: 7, url: 'https://via.placeholder.com/300?text=Senderismo', titulo: 'Senderismo en la montaña', likes: 31 },
        { id: 8, url: 'https://via.placeholder.com/300?text=Ciclismo', titulo: 'Ruta en bicicleta', likes: 22 },
        { id: 9, url: 'https://via.placeholder.com/300?text=Camping', titulo: 'Camping bajo las estrellas', likes: 45 }
      ]
    }
  ],
  
  contactos: [
    { id: 1, nombre: 'María', email: 'maria@example.com', telefono: '123-456-7890', favorito: false },
    { id: 2, nombre: 'Pedro', email: 'pedro@example.com', telefono: '123-456-7891', favorito: false },
    { id: 3, nombre: 'Ana', email: 'ana@example.com', telefono: '123-456-7892', favorito: false },
    { id: 4, nombre: 'Luis', email: 'luis@example.com', telefono: '123-456-7893', favorito: false },
    { id: 5, nombre: 'Sofia', email: 'sofia@example.com', telefono: '123-456-7894', favorito: false }
  ]
};

// Variables para almacenar favoritos y likes
let favoritos = [];
let likes = new Map();

// Rutas
app.get('/', (req, res) => {
  res.render('index', { datos });
});

app.get('/perfil', (req, res) => {
  res.render('perfil', { datos });
});

app.get('/album', (req, res) => {
  res.render('album', { datos });
});

app.get('/contactos', (req, res) => {
  res.render('contactos', { contactos: datos.contactos });
});

app.get('/favoritos', (req, res) => {
  res.render('favoritos', { favoritos });
});

// AJAX API Endpoints
app.get('/api/contactos', (req, res) => {
  res.json(datos.contactos);
});

app.post('/api/contactos/agregar-favorito', (req, res) => {
  const { id } = req.body;
  const contacto = datos.contactos.find(c => c.id === id);
  
  if (contacto) {
    const existe = favoritos.find(f => f.id === id);
    if (!existe) {
      favoritos.push({ ...contacto, agregadoEn: new Date() });
      res.json({ success: true, mensaje: 'Agregado a favoritos' });
    } else {
      res.json({ success: false, mensaje: 'Ya está en favoritos' });
    }
  } else {
    res.json({ success: false, mensaje: 'Contacto no encontrado' });
  }
});

app.post('/api/contactos/eliminar-favorito', (req, res) => {
  const { id } = req.body;
  favoritos = favoritos.filter(f => f.id !== id);
  res.json({ success: true, mensaje: 'Eliminado de favoritos' });
});

app.post('/api/fotos/like', (req, res) => {
  const { fotoId } = req.body;
  const currentLikes = likes.get(fotoId) || 0;
  likes.set(fotoId, currentLikes + 1);
  res.json({ success: true, newLikes: currentLikes + 1 });
});

app.get('/api/fotos/likes/:fotoId', (req, res) => {
  const { fotoId } = req.params;
  const fotoLikes = likes.get(parseInt(fotoId)) || 0;
  res.json({ fotoId: parseInt(fotoId), likes: fotoLikes });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log('Presiona Ctrl+C para detener el servidor');
});
