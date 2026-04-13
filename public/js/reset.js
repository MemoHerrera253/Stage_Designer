// reset.js
// Lógica para restablecer contraseña usando token de recuperación
function getTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('token');
}

document.getElementById('resetForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const password = document.getElementById('resetPassword').value;
  const token = getTokenFromUrl();
  const res = await fetch('/api/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password })
  });
  const data = await res.json();
  const resultDiv = document.getElementById('resetResult');
  if (data.success) {
    resultDiv.innerHTML = `<p style='color:green;'>${data.message}</p>`;
  } else {
    resultDiv.innerHTML = `<p style='color:red;'>${data.message}</p>`;
  }
});
