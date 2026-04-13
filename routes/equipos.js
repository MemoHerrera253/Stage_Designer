const express = require('express');
const router = express.Router();
const equiposController = require('../controllers/equiposController');

// Ruta para obtener los equipos
router.get('/', equiposController.getEquipos);
// Ruta para crear un equipo
router.post('/', equiposController.createEquipo);

// Ruta para eliminar un equipo por ID
router.delete('/:id', equiposController.deleteEquipo);

module.exports = router;
