const AllowedUser = require('../models/AllowedUser');

// Agregar un nuevo usuario permitido
const addAllowedUser = async (req, res) => {
    try {
        const { identifier, type } = req.body;

        // Validar que se proporcionen los campos requeridos
        if (!identifier || !type) {
            return res.status(400).json({ 
                message: 'El identificador y el tipo son requeridos' 
            });
        }

        // Validar el tipo
        if (!['email', 'identification'].includes(type)) {
            return res.status(400).json({ 
                message: 'El tipo debe ser email o identification' 
            });
        }

        // Verificar si ya existe
        const existingUser = await AllowedUser.findOne({ identifier });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'Este usuario ya está en la lista de permitidos' 
            });
        }

        // Crear nuevo usuario permitido
        const allowedUser = new AllowedUser({
            identifier,
            type
        });

        await allowedUser.save();

        res.status(201).json({
            message: 'Usuario permitido agregado exitosamente',
            allowedUser
        });

    } catch (error) {
        console.error('Error al agregar usuario permitido:', error);
        res.status(500).json({ 
            message: 'Error al agregar usuario permitido' 
        });
    }
};

// Obtener todos los usuarios permitidos
const getAllowedUsers = async (req, res) => {
    try {
        // Buscar todos los usuarios permitidos y organizarlos por tipo
        const allUsers = await AllowedUser.find();
        
        // Separar usuarios por tipo
        const emails = allUsers
            .filter(user => user.type === 'email')
            .map(user => user.identifier);
            
        const identifications = allUsers
            .filter(user => user.type === 'identification')
            .map(user => user.identifier);

        res.json({
            emails,
            identifications
        });

    } catch (error) {
        console.error('Error al obtener usuarios permitidos:', error);
        res.status(500).json({ 
            message: 'Error al obtener la lista de usuarios permitidos' 
        });
    }
};

module.exports = {
    addAllowedUser,
    getAllowedUsers
};