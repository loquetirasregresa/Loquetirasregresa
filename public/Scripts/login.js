import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgaiQDFtx2IGviiepkWODRy_D_N-3o0QA",
  authDomain: "moovo-16a2e.firebaseapp.com",
  projectId: "moovo-16a2e",
  storageBucket: "moovo-16a2e.firebasestorage.app",
  messagingSenderId: "835927562635",
  appId: "1:835927562635:web:7c607169bb8f46ec78778e",
  measurementId: "G-CM1SBP592Q"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("¡Bienvenido!");
      window.location.href = "index.html";
    })
    .catch((error) => {
      // Mostrar mensaje personalizado según el error
      switch (error.code) {
        case "auth/user-not-found":
          alert("Error: Usuario no registrado.");
          break;
        case "auth/wrong-password":
          alert("Error: Contraseña incorrecta.");
          break;
        case "auth/invalid-email":
          alert("Error: Correo inválido.");
          break;
        default:
          alert("Error al iniciar sesión:\n" + error.message);
      }
    });
});
