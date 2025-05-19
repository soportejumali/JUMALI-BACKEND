const Loan = require('../models/Loan');
const Book = require('../models/Book');
const User = require('../models/User');
const Copy = require('../models/Copy');
const Fine = require('../models/Fine');

exports.createLoan = async (req, res) => {
  try {
    const { libro } = req.body;
    const userId = req.user._id;

    if (!libro) {
      return res.status(400).json({ message: 'El ID del libro es requerido' });
    }

    // Verificar si el usuario está bloqueado
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.estado === 'bloqueado' || user.blocked) {
      return res.status(400).json({ message: 'No puedes solicitar préstamos porque tu cuenta está bloqueada' });
    }

    // Verificar si el usuario tiene multas pendientes
    if (user.multas > 0) {
      return res.status(400).json({ message: 'No puedes solicitar préstamos porque tienes multas pendientes' });
    }

    // Verificar si el libro existe y tiene copias disponibles
    const book = await Book.findById(libro);
    if (!book) {
      return res.status(404).json({ message: 'Libro no encontrado' });
    }

    if (book.cantidad === 0) {
      return res.status(400).json({ message: 'No hay copias disponibles de este libro' });
    }

    // Verificar si el usuario ya tiene un préstamo activo de este libro
    const existingLoan = await Loan.findOne({
      usuario: userId,
      libro: libro,
      estado: { $in: ['activo', 'vencido'] }
    });

    if (existingLoan) {
      return res.status(400).json({ message: 'Ya tienes un préstamo activo o vencido de este libro' });
    }

    // Buscar una copia disponible
    const copy = await Copy.findOneAndUpdate(
      { 
        libro: libro, 
        estado: 'disponible'
      },
      { 
        estado: 'prestado',
        $setOnInsert: {
          ubicacion: 'Prestado',
          notas: `Prestado a ${user.nombreCompleto}`
        }
      },
      { 
        new: true,
        upsert: false
      }
    );

    if (!copy) {
      return res.status(400).json({ message: 'No hay copias disponibles para préstamo' });
    }

    // Calcular fecha de devolución (15 días desde hoy)
    const fechaPrestamo = new Date();
    const fechaDevolucion = new Date(fechaPrestamo);
    fechaDevolucion.setDate(fechaDevolucion.getDate() + 15);

    // Crear el préstamo
    const loan = new Loan({
      usuario: userId,
      libro: libro,
      copia: copy._id,
      fechaPrestamo,
      fechaDevolucion,
      estado: 'activo'
    });

    await loan.save();

    // Actualizar la cantidad de copias disponibles
    book.cantidad -= 1;
    await book.save();

    // Poblar los datos del libro y la copia para la respuesta
    await loan.populate([
      { path: 'libro', select: 'titulo autor foto' },
      { path: 'copia', select: 'codigo' }
    ]);

    res.status(201).json({
      message: 'Préstamo creado exitosamente',
      loan
    });
  } catch (error) {
    console.error('Error al crear préstamo:', error);
    res.status(500).json({ 
      message: 'Error al crear el préstamo', 
      error: error.message 
    });
  }
};

exports.getUserLoans = async (req, res) => {
  try {
    const userId = req.user._id;
    const loans = await Loan.find({ usuario: userId })
      .populate([
        { path: 'libro', select: 'titulo autor foto' },
        { path: 'copia', select: 'codigo' }
      ])
      .sort({ fechaPrestamo: -1 });

    // Verificar préstamos vencidos
    const now = new Date();
    for (const loan of loans) {
      if (loan.estado === 'activo' && loan.fechaDevolucion < now) {
        loan.estado = 'vencido';
        await loan.save();
      }
    }

    res.json(loans);
  } catch (error) {
    console.error('Error al obtener préstamos:', error);
    res.status(500).json({ 
      message: 'Error al obtener los préstamos', 
      error: error.message 
    });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const { id } = req.params;
    const loan = await Loan.findById(id);

    if (!loan) {
      return res.status(404).json({ message: 'Préstamo no encontrado' });
    }

    if (loan.estado === 'devuelto') {
      return res.status(400).json({ message: 'Este libro ya ha sido devuelto' });
    }

    const fechaDevolucionReal = new Date();
    const diasRetraso = Math.max(0, Math.floor((fechaDevolucionReal - loan.fechaDevolucion) / (1000 * 60 * 60 * 24)));
    
    // Actualizar el estado del préstamo
    loan.estado = 'devuelto';
    loan.fechaDevolucionReal = fechaDevolucionReal;
    await loan.save();

    // Actualizar la cantidad de copias disponibles
    const book = await Book.findById(loan.libro);
    if (book) {
      book.cantidad += 1;
      await book.save();
    }

    // Actualizar el estado de la copia
    await Copy.findByIdAndUpdate(loan.copia, { 
      estado: 'disponible',
      ubicacion: 'Disponible',
      notas: 'Devuelto y disponible para préstamo'
    });

    let multa = 0;
    // Crear multa si hay retraso
    if (diasRetraso > 0) {
      multa = diasRetraso * 1; // $1 por día de retraso
      
      // Crear registro de multa
      const fine = new Fine({
        prestamo: loan._id,
        monto: multa,
        descripcion: `Multa por retraso de ${diasRetraso} días en la devolución del libro "${book.titulo}"`,
        fecha: fechaDevolucionReal
      });
      await fine.save();

      // Actualizar multas del usuario
      await User.findByIdAndUpdate(loan.usuario, { 
        $inc: { multas: multa },
        $set: { 
          estado: multa >= 10 ? 'bloqueado' : 'activo' // Bloquear si la multa es mayor o igual a $10
        }
      });
    }

    // Poblar los datos del libro y la copia para la respuesta
    await loan.populate([
      { path: 'libro', select: 'titulo autor foto' },
      { path: 'copia', select: 'codigo' }
    ]);

    res.json({
      message: 'Libro devuelto exitosamente',
      loan,
      diasRetraso,
      multa
    });
  } catch (error) {
    console.error('Error al devolver libro:', error);
    res.status(500).json({ 
      message: 'Error al devolver el libro', 
      error: error.message 
    });
  }
};