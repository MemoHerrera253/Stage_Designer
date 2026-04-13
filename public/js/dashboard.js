// Dashboard del usuario
// Este archivo maneja la logica del dashboard para usuarios autenticados

document.addEventListener('DOMContentLoaded', () => {
  // Verificar si el usuario tiene un token valido
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  // Obtener informacion del usuario y mostrarla
  fetch('/api/protected', {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.user) {
        document.getElementById('user-info').textContent = `Bienvenido, ${data.user.id}`;
      } else {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
      }
    });
});
