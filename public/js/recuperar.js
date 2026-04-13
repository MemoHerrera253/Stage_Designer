// recuperar.js
// Lógica para solicitar recuperación de contraseña por email
let userEmail = null;
document.getElementById('recoverForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  userEmail = document.getElementById('recoverEmail').value;
  document.getElementById('recoverForm').style.display = 'none';
  document.getElementById('recoverOptions').style.display = 'block';
  document.getElementById('recoverResult').innerHTML = '';
});

// Opción: Email
document.getElementById('option-email').addEventListener('click', async function(e) {
  e.preventDefault();
  const res = await fetch('/api/recover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userEmail })
  });
  const data = await res.json();
  const resultDiv = document.getElementById('recoverResult');
  if (data.success) {
    const absLink = window.location.origin + data.link;
    resultDiv.innerHTML = `<p style='color:green;'>${data.message}<br>Enlace simulado: <a href='${absLink}'>${absLink}</a></p>`;
  } else {
    resultDiv.innerHTML = `<p style='color:red;'>${data.message}</p>`;
  }
});

// Opción: Preguntas Secretas
document.getElementById('option-secret').addEventListener('click', async function(e) {
  e.preventDefault();
  // Solicitar la pregunta secreta al backend
  const res = await fetch('/api/secret-question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userEmail })
  });
  const data = await res.json();
  const resultDiv = document.getElementById('recoverResult');
  if (data.success) {
    resultDiv.innerHTML = `
      <form id="secretForm" class="form">
        <label>${data.question}</label>
        <input type="password" id="secretAnswer" required />
        <button type="submit">Validar respuesta</button>
      </form>
      <div id="secretResult"></div>
    `;
    document.getElementById('secretForm').addEventListener('submit', async function(ev) {
      ev.preventDefault();
      const answer = document.getElementById('secretAnswer').value;
      const res2 = await fetch('/api/validate-secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, answer })
      });
      const data2 = await res2.json();
      const secretResult = document.getElementById('secretResult');
      if (data2.success) {
        secretResult.innerHTML = `<p style='color:green;'>Respuesta correcta. <a href='/reset.html?token=${data2.token}'>Restablecer contraseña</a></p>`;
      } else {
        secretResult.innerHTML = `<p style='color:red;'>${data2.message}</p>`;
      }
    });
  } else {
    resultDiv.innerHTML = `<p style='color:red;'>${data.message}</p>`;
  }
});

// Opción: SMS
document.getElementById('option-sms').addEventListener('click', function(e) {
  e.preventDefault();
  // Aquí se mostraría el formulario de SMS (a implementar)
  document.getElementById('recoverResult').innerHTML = '<p>Funcionalidad de recuperación por SMS próximamente...</p>';
});

// Opción: Llamada
document.getElementById('option-call').addEventListener('click', function(e) {
  e.preventDefault();
  // Aquí se mostraría el formulario de llamada (a implementar)
  document.getElementById('recoverResult').innerHTML = '<p>Funcionalidad de recuperación por llamada próximamente...</p>';
});
