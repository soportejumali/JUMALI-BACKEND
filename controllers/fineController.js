const Fine = require('../models/Fine');
const Loan = require('../models/Loan');

exports.getAllFines = async (req, res) => {
  try {
    const fines = await Fine.find()
      .populate({
        path: 'prestamo',
        populate: [
          { path: 'libro' },
          { path: 'usuario', select: 'nombreCompleto' }
        ]
      });
    res.json(fines);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las multas', error: error.message });
  }
};

exports.createFine = async (req, res) => {
  try {
    const { prestamoId, monto, descripcion } = req.body;

    const loan = await Loan.findById(prestamoId)
      .populate('libro')
      .populate('usuario');

    if (!loan) {
      return res.status(404).json({ message: 'Préstamo no encontrado' });
    }

    const fine = new Fine({
      prestamo: prestamoId,
      monto,
      descripcion,
      fecha: new Date(),
      pagado: false
    });

    await fine.save();
    res.status(201).json(fine);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la multa', error: error.message });
  }
};

exports.payFine = async (req, res) => {
  try {
    const { id } = req.params;
    const fine = await Fine.findById(id);

    if (!fine) {
      return res.status(404).json({ message: 'Multa no encontrada' });
    }

    if (fine.pagado) {
      return res.status(400).json({ message: 'La multa ya fue pagada' });
    }

    fine.pagado = true;
    await fine.save();

    res.json(fine);
  } catch (error) {
    res.status(500).json({ message: 'Error al procesar el pago', error: error.message });
  }
};