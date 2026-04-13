document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('equipos-tbody');

  function cargarEquipos() {
    fetch('/api/equipos')
      .then(res => res.json())
      .then(data => {
        tbody.innerHTML = '';
        data.forEach((eq) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${eq.marca}</td>
            <td>${eq.modelo}</td>
            <td>${eq.tipo}</td>
            <td>${eq.cantidad}</td>
            <td><button class="btn-eliminar" data-id="${eq.id}">Eliminar</button></td>
          `;
          tbody.appendChild(tr);
        });
      })
      .catch(err => {
        tbody.innerHTML = '<tr><td colspan="5">Error al cargar los datos</td></tr>';
      });
  }

  cargarEquipos();

  tbody.addEventListener('click', async function(e) {
    if (e.target.classList.contains('btn-eliminar')) {
      const id = e.target.getAttribute('data-id');
      if (confirm('¿Seguro que deseas eliminar este equipo?')) {
        try {
          const res = await fetch(`/api/equipos/${id}`, { method: 'DELETE' });
          if (res.ok) {
            mostrarNotificacion('Equipo eliminado correctamente.');
            cargarEquipos();
          } else {
            mostrarNotificacion('Error al eliminar el equipo.', true);
          }
        } catch {
          mostrarNotificacion('Error de red al eliminar.', true);
        }
      }
    }
  });

  function mostrarNotificacion(msg, error = false) {
    let notif = document.getElementById('notificacion-equipos');
    if (!notif) {
      notif = document.createElement('div');
      notif.id = 'notificacion-equipos';
      notif.style.position = 'fixed';
      notif.style.top = '20px';
      notif.style.right = '20px';
      notif.style.padding = '12px 20px';
      notif.style.borderRadius = '8px';
      notif.style.zIndex = '9999';
      notif.style.color = '#fff';
      notif.style.fontWeight = 'bold';
      document.body.appendChild(notif);
    }
    notif.textContent = msg;
    notif.style.background = error ? '#c0392b' : '#27ae60';
    notif.style.display = 'block';
    setTimeout(() => { notif.style.display = 'none'; }, 2000);
  }
});
