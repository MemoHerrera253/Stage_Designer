document.getElementById('form-equipo').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    marca: form.marca.value,
    modelo: form.modelo.value,
    tipo: form.tipo.value,
    cantidad: form.cantidad.value
  };
  try {
    const res = await fetch('/api/equipos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      document.getElementById('mensaje').textContent = 'Equipo creado correctamente.';
      setTimeout(() => window.location.href = 'equipos.html', 1200);
    } else {
      const error = await res.text();
      document.getElementById('mensaje').textContent = 'Error: ' + error;
    }
  } catch (err) {
    document.getElementById('mensaje').textContent = 'Error de red.';
  }
});
