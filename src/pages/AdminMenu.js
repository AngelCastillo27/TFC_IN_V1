import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Button, Input } from '../components';

const AdminMenu = () => {
  const [platos, setPlatos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [alergenos, setAlergenos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlato, setEditingPlato] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    idCategoria: '',
    descripcion: '',
    precio: '',
    alergenos: [],
    imagen: null,
    imagenPreview: null
  });
  const [uploading, setUploading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [excludedAlergenos, setExcludedAlergenos] = useState([]);

  const { currentUser, loading: authLoading } = useAuth();

  const filteredPlatos = platos.filter(plato => {
    if (selectedCategoryFilter && plato.idCategoria !== selectedCategoryFilter) {
      return false;
    }

    if (excludedAlergenos.length > 0) {
      const platoAlergenos = Array.isArray(plato.alergenos) ? plato.alergenos : [];
      return !excludedAlergenos.some(alergenoId => platoAlergenos.includes(alergenoId));
    }

    return true;
  });

  const toggleExcludedAlergeno = (alergenoId) => {
    setExcludedAlergenos(prev =>
      prev.includes(alergenoId)
        ? prev.filter(id => id !== alergenoId)
        : [...prev, alergenoId]
    );
  };

  const resetFilters = () => {
    setSelectedCategoryFilter('');
    setExcludedAlergenos([]);
  };

  const fetchCollection = useCallback(async (collectionNames) => {
    for (const collectionName of collectionNames) {
      const snap = await getDocs(collection(db, collectionName));
      if (snap.size > 0) {
        return { docs: snap.docs, collectionName };
      }
    }
    return { docs: [], collectionName: collectionNames[0] };
  }, []);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);

      // Cargar platos de la colección 'plate'
      const platosResult = await fetchCollection(['plate', 'plates']);
      const platosData = platosResult.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlatos(platosData);
      console.log(`Platos cargados desde colección '${platosResult.collectionName}':`, platosData.length);

      // Cargar categorías de la colección 'category'
      const categoriasResult = await fetchCollection(['category', 'categories']);
      const categoriasData = categoriasResult.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          nombre: data.nombre || data.name || doc.id,
          imagen: data.imagen || data.icono || '',
          ...data
        };
      });
      setCategorias(categoriasData);
      console.log(`Categorías cargadas desde colección '${categoriasResult.collectionName}':`, categoriasData.length, categoriasData);

      // Cargar alergenos de la colección 'allergen'
      const alergenosResult = await fetchCollection(['allergen', 'allergens']);
      const alergenosData = alergenosResult.docs.map(doc => {
        const data = doc.data();
        const nombre = data.nombre || data.name || doc.id;
        let imagen = data.imagen || data.icono || '';

        // Asignar emoji por defecto si no hay imagen
        if (!imagen) {
          const emojiMap = {
            'Gluten': '🌾',
            'Lácteos': '🥛',
            'Huevos': '🥚',
            'Frutos secos': '🥜',
            'Mariscos': '🦐',
            'Soja': '🫘'
          };
          imagen = emojiMap[nombre] || '⚠️';
        }

        return {
          id: data.id != null ? data.id : doc.id,
          nombre: nombre,
          imagen: imagen,
          ...data
        };
      });
      setAlergenos(alergenosData);
      console.log(`Alérgenos cargados desde colección '${alergenosResult.collectionName}':`, alergenosData.length, alergenosData);

      console.log('🔍 Verificando datos existentes...');
      console.log('📊 Categorías:', categoriasData.length, '📊 Alérgenos:', alergenosData.length);

      // Mostrar datos existentes en consola
      if (categoriasData.length > 0) {
        console.log('📋 Categorías existentes:', categoriasData.map(c => `${c.nombre} (${c.id})`));
      }
      if (alergenosData.length > 0) {
        console.log('🥜 Alérgenos existentes:', alergenosData.map(a => `${a.nombre} (${a.id})`));
      }

      // Crear datos de ejemplo si no existen (más agresivo)
      if (categoriasData.length === 0 || alergenosData.length === 0) {
        console.log('⚠️ No hay categorías o alergenos, creando datos de ejemplo...');
        await crearDatosEjemplo();
        await cargarDatos();
        return;
      } else {
        console.log('✅ Ya existen datos en ambas colecciones');
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      setLoadError(error.message || 'Error desconocido al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [fetchCollection]);

  useEffect(() => {
    if (!authLoading && currentUser) {
      cargarDatos();
    } else if (!authLoading && !currentUser) {
      setLoading(false);
      setLoadError('Debes iniciar sesión para cargar datos.');
    }
  }, [authLoading, currentUser, cargarDatos]);


  const crearDatosEjemplo = async () => {
    try {
      console.log('🚀 Iniciando creación de datos de ejemplo...');

      // Crear categorías de ejemplo en colección 'category'
      const categoriasEjemplo = [
        { nombre: 'Entrantes', imagen: '🍽️' },
        { nombre: 'Principales', imagen: '🍖' },
        { nombre: 'Postres', imagen: '🍰' },
        { nombre: 'Bebidas', imagen: '🥤' }
      ];

      console.log('📝 Creando categorías...');
      for (const categoria of categoriasEjemplo) {
        const docRef = await addDoc(collection(db, 'category'), categoria);
        console.log('✅ Categoría creada:', categoria.nombre, 'ID:', docRef.id);
      }

      // Crear alergenos de ejemplo en colección 'allergen'
      const alergenosEjemplo = [
        { nombre: 'Gluten', imagen: '🌾' },
        { nombre: 'Lácteos', imagen: '🥛' },
        { nombre: 'Huevos', imagen: '🥚' },
        { nombre: 'Frutos secos', imagen: '🥜' },
        { nombre: 'Mariscos', imagen: '🦐' },
        { nombre: 'Soja', imagen: '🫘' }
      ];

      console.log('🥜 Creando alergenos...');
      for (const alergeno of alergenosEjemplo) {
        const docRef = await addDoc(collection(db, 'allergen'), alergeno);
        console.log('✅ Alergeno creado:', alergeno.nombre, 'ID:', docRef.id);
      }

      console.log('🎉 Datos de ejemplo creados correctamente');
      alert('✅ Datos de ejemplo creados correctamente. Haz clic en "🔍 Verificar Datos" para confirmar.');

      // No recargar automáticamente, dejar que el usuario verifique manualmente
      // await cargarDatos();

    } catch (error) {
      console.error('❌ Error al crear datos de ejemplo:', error);
      alert('Error al crear datos de ejemplo: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'precio' ? parseFloat(value) || '' : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imagen: file,
        imagenPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleCategoriaChange = (categoriaId) => {
    setFormData(prev => ({
      ...prev,
      idCategoria: categoriaId
    }));
  };

  const handleAlergenoToggle = (alergenoId) => {
    setFormData(prev => ({
      ...prev,
      alergenos: prev.alergenos.includes(alergenoId)
        ? prev.alergenos.filter(id => id !== alergenoId)
        : [...prev.alergenos, alergenoId]
    }));
  };

  const uploadImage = async (file) => {
    if (!file) return null;

    const storageRef = ref(storage, `plate/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };

  const deleteImage = async (imageUrl) => {
    if (!imageUrl) return;

    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.idCategoria || !formData.descripcion || !formData.precio) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (formData.precio <= 0) {
      alert('El precio debe ser mayor a 0');
      return;
    }

    setUploading(true);

    try {
      let imageUrl = editingPlato?.imagen || null;

      // Si hay una nueva imagen, subirla
      if (formData.imagen) {
        // Eliminar imagen anterior si existe
        if (editingPlato?.imagen) {
          await deleteImage(editingPlato.imagen);
        }
        imageUrl = await uploadImage(formData.imagen);
      }

      const platoData = {
        nombre: formData.nombre,
        idCategoria: formData.idCategoria,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        alergenos: formData.alergenos,
        imagen: imageUrl,
        updatedAt: new Date().toISOString()
      };

      if (editingPlato) {
        // Actualizar plato existente en colección 'plate'
        await updateDoc(doc(db, 'plate', editingPlato.id), platoData);
        setPlatos(platos.map(p => p.id === editingPlato.id ? { ...p, ...platoData } : p));
      } else {
        // Crear nuevo plato en colección 'plate'
        platoData.createdAt = new Date().toISOString();
        const docRef = await addDoc(collection(db, 'plate'), platoData);
        setPlatos([...platos, { id: docRef.id, ...platoData }]);
      }

      // Resetear formulario
      resetForm();
      alert(editingPlato ? 'Plato actualizado correctamente' : 'Plato creado correctamente');

    } catch (error) {
      console.error('Error al guardar plato:', error);
      alert('Error al guardar el plato');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      idCategoria: '',
      descripcion: '',
      precio: '',
      alergenos: [],
      imagen: null,
      imagenPreview: null
    });
    setEditingPlato(null);
    setShowForm(false);
  };

  const editarPlato = (plato) => {
    setEditingPlato(plato);
    setFormData({
      nombre: plato.nombre || '',
      idCategoria: plato.idCategoria || '',
      descripcion: plato.descripcion || '',
      precio: plato.precio || '',
      alergenos: plato.alergenos || [],
      imagen: null,
      imagenPreview: plato.imagen || null
    });
    setShowForm(true);
  };

  const eliminarPlato = async (plato) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar "${plato.nombre}"?`)) {
      return;
    }

    try {
      // Eliminar imagen del storage
      if (plato.imagen) {
        await deleteImage(plato.imagen);
      }

      // Eliminar documento de la colección 'plate'
      await deleteDoc(doc(db, 'plate', plato.id));

      setPlatos(platos.filter(p => p.id !== plato.id));
      alert('Plato eliminado correctamente');

    } catch (error) {
      console.error('Error al eliminar plato:', error);
      alert('Error al eliminar el plato');
    }
  };

  const getCategoriaNombre = (categoriaId) => {
    const categoria = categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.nombre : 'Sin categoría';
  };

  const getCategoriaImagen = (categoriaId) => {
    const categoria = categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.imagen : null;
  };

  const renderIcon = (imagen, label) => {
    if (!imagen) return null;

    const isUrl = typeof imagen === 'string' && (
      imagen.startsWith('http') ||
      imagen.startsWith('https') ||
      imagen.startsWith('data:') ||
      imagen.startsWith('/') ||
      /\/.+\.[a-zA-Z]{2,5}(\?.*)?$/.test(imagen)
    );

    return isUrl ? (
      <img src={imagen} alt={label} className="icon-image" />
    ) : (
      <span className="icon-emoji">{imagen}</span>
    );
  };

  const getAlergenosNombres = (alergenosIds) => {
    return alergenos
      .filter(a => alergenosIds?.includes(a.id))
      .map(a => a.nombre)
      .join(', ');
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-pearl flex items-center justify-center"
      >
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-lg text-stone-gray"
        >
          Cargando menú...
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-pearl px-4 py-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <h2 className="text-4xl font-serif font-bold text-dark">Gestión de Carta</h2>
          <Button
            variant={showForm ? "secondary" : "primary"}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '❌ Cancelar' : '➕ Nuevo Plato'}
          </Button>
        </motion.div>

        {/* Error */}
        {loadError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-sm mb-6"
          >
            Error al cargar datos: {loadError}
          </motion.div>
        )}

        {/* Formulario */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white border-2 border-gold rounded-sm p-8 mb-8 shadow-soft"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nombre del Plato *"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Paella Valenciana"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-dark mb-3">Categoría *</label>
                  <div className="flex flex-wrap gap-2">
                    {categorias.map(categoria => (
                      <motion.button
                        key={categoria.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => handleCategoriaChange(categoria.id)}
                        className={`px-3 py-2 rounded-sm text-sm font-medium transition-all border-2 ${
                          formData.idCategoria === categoria.id
                            ? "border-gold bg-gold text-dark"
                            : "border-gold bg-white text-dark hover:bg-pearl"
                        }`}
                      >
                        {renderIcon(categoria.imagen, categoria.nombre)} {categoria.nombre}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Descripción *</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    placeholder="Describe los ingredientes y características del plato..."
                    rows="4"
                    className="w-full px-4 py-2.5 border-2 border-gold rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-gold"
                    required
                  />
                </div>

                <Input
                  label="Precio (€) *"
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Alérgenos</label>
                  <div className="flex flex-wrap gap-2 border-2 border-gold rounded-sm p-3 bg-pearl">
                    {alergenos.map(alergeno => (
                      <label
                        key={alergeno.id}
                        className={`flex items-center gap-1 px-2 py-1 rounded-xs cursor-pointer text-sm transition-all ${
                          formData.alergenos.includes(alergeno.id)
                            ? "bg-gold text-dark border-2 border-dark"
                            : "bg-white border-2 border-gold text-dark"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.alergenos.includes(alergeno.id)}
                          onChange={() => handleAlergenoToggle(alergeno.id)}
                          className="hidden"
                        />
                        {renderIcon(alergeno.imagen, alergeno.nombre)} {alergeno.nombre}
                      </label>
                    ))}
                  </div>
                  {formData.alergenos.length > 0 && (
                    <p className="text-xs text-stone-gray mt-2">
                      Seleccionados: {getAlergenosNombres(formData.alergenos)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Imagen del Plato</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2.5 border-2 border-gold rounded-sm"
                  />
                  {(formData.imagenPreview || editingPlato?.imagen) && (
                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={formData.imagenPreview || editingPlato.imagen}
                      alt="Vista previa"
                      className="mt-3 h-32 object-cover rounded-sm border-2 border-gold"
                    />
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="primary" type="submit" disabled={uploading} className="flex-1">
                    {uploading ? "Guardando..." : (editingPlato ? "Actualizar" : "Crear")}
                  </Button>
                  <Button variant="secondary" type="button" onClick={resetForm} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid de Platos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
        >
          {filteredPlatos.length > 0 ? (
            filteredPlatos.map((plato, idx) => (
              <motion.div
                key={plato.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
                className="bg-white border-2 border-gold rounded-sm overflow-hidden shadow-soft"
              >
                <div className="h-40 bg-pearl flex items-center justify-center overflow-hidden">
                  {plato.imagen ? (
                    <img src={plato.imagen} alt={plato.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">🍽️</span>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-lg font-serif font-bold text-dark">{plato.nombre}</h3>

                  <div className="flex items-center gap-1 text-sm text-stone-gray">
                    <span>{renderIcon(getCategoriaImagen(plato.idCategoria), getCategoriaNombre(plato.idCategoria))}</span>
                    <span>{getCategoriaNombre(plato.idCategoria)}</span>
                  </div>

                  <p className="text-sm text-dark line-clamp-2">{plato.descripcion}</p>

                  <div className="text-lg font-bold text-gold pt-2">€{plato.precio?.toFixed(2)}</div>

                  {plato.alergenos && plato.alergenos.length > 0 && (
                    <p className="text-xs text-stone-gray">
                      🥜 {getAlergenosNombres(plato.alergenos)}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 p-4 border-t border-gold bg-pearl">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => editarPlato(plato)}
                    className="flex-1 px-3 py-2 bg-gold text-dark rounded-xs font-medium hover:bg-gold-light transition-all"
                  >
                    ✏️ Editar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => eliminarPlato(plato)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-xs font-medium hover:bg-red-700 transition-all"
                  >
                    🗑️ Eliminar
                  </motion.button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-12 text-stone-gray"
            >
              <div className="text-4xl mb-2">🍽️</div>
              <p className="text-lg font-medium">No hay platos que coincidan con los filtros</p>
              <p className="text-sm">Limpia los filtros o prueba con otra categoría.</p>
            </motion.div>
          )}
        </motion.div>

        {/* Panel de Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-gold rounded-sm p-6 shadow-soft"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-serif font-bold text-dark">Filtrar Carta</h3>
            <Button variant="secondary" size="sm" onClick={resetFilters}>
              Limpiar filtros
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-dark block mb-2">Filtrar por categoría:</label>
              <div className="flex flex-wrap gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  type="button"
                  onClick={() => setSelectedCategoryFilter('')}
                  className={`px-3 py-2 rounded-xs text-sm font-medium transition-all border-2 ${
                    selectedCategoryFilter === ''
                      ? "border-gold bg-gold text-dark"
                      : "border-gold bg-white text-dark hover:bg-pearl"
                  }`}
                >
                  Todas
                </motion.button>
                {categorias.map(categoria => (
                  <motion.button
                    key={categoria.id}
                    whileHover={{ scale: 1.05 }}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(categoria.id)}
                    className={`px-3 py-2 rounded-xs text-sm font-medium transition-all border-2 ${
                      selectedCategoryFilter === categoria.id
                        ? "border-gold bg-gold text-dark"
                        : "border-gold bg-white text-dark hover:bg-pearl"
                    }`}
                  >
                    {renderIcon(categoria.imagen, categoria.nombre)} {categoria.nombre}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-dark block mb-2">Excluir alérgenos:</label>
              <div className="flex flex-wrap gap-2">
                {alergenos.map(alergeno => (
                  <motion.button
                    key={alergeno.id}
                    whileHover={{ scale: 1.05 }}
                    type="button"
                    onClick={() => toggleExcludedAlergeno(alergeno.id)}
                    className={`px-3 py-2 rounded-xs text-sm font-medium transition-all border-2 ${
                      excludedAlergenos.includes(alergeno.id)
                        ? "border-gold bg-gold text-dark"
                        : "border-gold bg-white text-dark hover:bg-pearl"
                    }`}
                  >
                    {renderIcon(alergeno.imagen, alergeno.nombre)} {alergeno.nombre}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminMenu;
