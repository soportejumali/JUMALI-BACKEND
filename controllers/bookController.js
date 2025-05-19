const Book = require('../models/Book');
const Copy = require('../models/Copy');

exports.getAllBooks = async (req, res) => {
    try {
      const { estado } = req.query;
      const query = estado ? { estado } : {};
      const books = await Book.find(query);
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los libros', error: error.message });
    }
  };

exports.createBook = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);

    const { titulo, autor, año, editorial, tipoLiteratura, cantidad } = req.body;
    
    // Validar que todos los campos requeridos estén presentes
    if (!titulo || !autor || !año || !editorial || !tipoLiteratura || !cantidad) {
      return res.status(400).json({
        message: 'Faltan campos requeridos',
        receivedData: req.body
      });
    }

    // Crear el libro
    const book = new Book({
      titulo: titulo.trim(),
      autor: autor.trim(),
      año: parseInt(año),
      editorial: editorial.trim(),
      tipoLiteratura: tipoLiteratura.trim(),
      cantidad: parseInt(cantidad),
      foto: req.body.foto || ''
    });

    const savedBook = await book.save();

    // Crear las copias del libro
    const copies = [];
    for (let i = 0; i < cantidad; i++) {
      const copy = new Copy({
        libro: savedBook._id,
        copyId: `${savedBook._id}-${i + 1}`,
        estado: 'disponible'
      });
      copies.push(copy);
    }

    await Copy.insertMany(copies);

    res.status(201).json(savedBook);
  } catch (error) {
    console.error('Error completo:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Error: Ya existe un libro con los mismos datos',
        error: error.message
      });
    }

    res.status(500).json({ 
      message: 'Error al crear el libro', 
      error: error.message,
      receivedData: req.body
    });
  }
};



exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convertir año y cantidad a números si están presentes
    if (updateData.año) updateData.año = parseInt(updateData.año);
    if (updateData.cantidad) updateData.cantidad = parseInt(updateData.cantidad);

    // Obtener el libro actual para comparar la cantidad
    const currentBook = await Book.findById(id);
    if (!currentBook) {
      return res.status(404).json({ message: 'Libro no encontrado' });
    }

    // Actualizar el libro
    const updatedBook = await Book.findByIdAndUpdate(id, updateData, { 
      new: true,
      runValidators: true 
    });

    // Manejar las copias si la cantidad ha cambiado
    if (updateData.cantidad !== undefined && updateData.cantidad !== currentBook.cantidad) {
      const difference = updateData.cantidad - currentBook.cantidad;

      if (difference > 0) {
        // Agregar nuevas copias
        const newCopies = [];
        for (let i = 0; i < difference; i++) {
          const copy = new Copy({
            libro: id,
            copyId: `${id}-${currentBook.cantidad + i + 1}`,
            estado: 'disponible'
          });
          newCopies.push(copy);
        }
        await Copy.insertMany(newCopies);
      } else if (difference < 0) {
        // Eliminar copias excedentes
        // Primero obtener las copias disponibles
        const availableCopies = await Copy.find({
          libro: id,
          estado: 'disponible'
        }).sort({ copyId: -1 }).limit(Math.abs(difference));

        // Eliminar las copias disponibles
        if (availableCopies.length > 0) {
          await Copy.deleteMany({
            _id: { $in: availableCopies.map(copy => copy._id) }
          });
        }
      }
    }

    // Obtener el libro actualizado con las copias
    const finalBook = await Book.findById(id);
    res.json(finalBook);
  } catch (error) {
    console.error('Error al actualizar libro:', error);
    res.status(500).json({ 
      message: 'Error al actualizar el libro', 
      error: error.message 
    });
  }
};

// ... existing code ...

// Método para obtener un libro con sus copias
exports.getBookWithCopies = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: 'Libro no encontrado' });
    }

    const copies = await Copy.find({ libro: id });
    res.json({
      ...book.toObject(),
      copies
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el libro', error: error.message });
  }
};

exports.deleteBook = async (req, res) => {
    try {
      const { id } = req.params;
      const book = await Book.findByIdAndUpdate(
        id,
        { estado: 'eliminado' },
        { new: true }
      );
      
      if (!book) {
        return res.status(404).json({ message: 'Libro no encontrado' });
      }
  
      res.json({ message: 'Libro marcado como eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el libro', error: error.message });
    }
  };

  exports.restoreBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByIdAndUpdate(
      id,
      { estado: 'disponible' },
      { new: true }
    );
    
    if (!book) {
      return res.status(404).json({ message: 'Libro no encontrado' });
    }

    res.json({ message: 'Libro restaurado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al restaurar el libro', error: error.message });
  }
}; 