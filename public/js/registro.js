// registro.js
// Lógica básica para el formulario de registro (frontend)
document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const user = document.getElementById('registerUser').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const secretQ = document.getElementById('registerSecretQ').value;
  const secretA = document.getElementById('registerSecretA').value;
  const role = document.getElementById('registerRole').value || 'USER';

  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, email, password, secretQ, secretA, role })
  });

  const data = await res.json();
  
  if (data.success) {
    alert('Registro exitoso, ahora puedes iniciar sesión');
    window.location.href = '/login.html';
  } else {
    alert(data.message || 'Error en el registro');
  }
});
