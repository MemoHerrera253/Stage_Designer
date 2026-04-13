// Administración de recursos (equipos)
// Parte: Administración de recursos
const equipos = [
  { id: 1, marca: 'Shure', modelo: 'SM58', tipo: 'microfono alambrico', cantidad: 10 },
  { id: 2, marca: 'Sennheiser', modelo: 'EW 100 G4', tipo: 'microfono inalambrico', cantidad: 5 },
  { id: 3, marca: 'seElectronics', modelo: 'V7', tipo: 'microfono alambrico', cantidad: 7 },
  { id: 4, marca: 'Phenyx Pro', modelo: 'PTU-5000A', tipo: 'microfono inalambrico', cantidad: 3 },
  { id: 5, marca: 'ProSound', modelo: 'PSW-800', tipo: 'iem system', cantidad: 2 }
];

let nextId = 6;

// Obtener todos los equipos
exports.getEquipos = (req, res) => {
  res.json(equipos);
};

// Crear un nuevo equipo
exports.createEquipo = (req, res) => {
  const { marca, modelo, tipo, cantidad } = req.body;
  if (!marca || !modelo || !tipo || !cantidad) {
    return res.status(400).send('Todos los campos son obligatorios');
  }
  const equipo = { id: nextId++, marca, modelo, tipo, cantidad: Number(cantidad) };
  equipos.push(equipo);
  res.status(201).json({ message: 'Equipo creado', equipo });
};

// Eliminar un equipo por ID
exports.deleteEquipo = (req, res) => {
  const { id } = req.params;
  const idNum = Number(id);
  const idx = equipos.findIndex(eq => eq.id === idNum);
  if (idx === -1) {
    return res.status(404).send('Equipo no encontrado');
  }
  equipos.splice(idx, 1);
  res.json({ message: 'Equipo eliminado' });
};
