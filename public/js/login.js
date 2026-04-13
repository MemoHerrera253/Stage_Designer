// login.js
// Lógica básica para el formulario de login (frontend)
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const user = document.getElementById('loginUser').value;
  const password = document.getElementById('loginPassword').value;
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, password })
  });
  const data = await res.json();
  if (data.success) {
    alert('Login exitoso');
    // Redirigir o guardar token
  } else {
    alert(data.message || 'Credenciales incorrectas');
  }
});
