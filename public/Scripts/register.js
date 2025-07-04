import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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
const db = getFirestore(app);

const registerForm = document.getElementById("registerForm");
const nameInput = document.getElementById("name");
const registerEmailInput = document.getElementById("registerEmail");
const birthdateInput = document.getElementById("birthdate");
const registerPasswordInput = document.getElementById("registerPassword");

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = registerEmailInput.value.trim();
    const birthdate = birthdateInput.value;
    const password = registerPasswordInput.value;

    if (!birthdate) {
        alert("Por favor, introduce tu fecha de nacimiento.");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });

        await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
            birthdate: birthdate,
            createdAt: serverTimestamp()
        });

        alert("¡Cuenta creada con éxito!");
        window.location.href = "index.html";

    } catch (error) {
        let errorMessage = "Error desconocido al registrar.";
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = "El correo electrónico ya está en uso.";
                break;
            case 'auth/invalid-email':
                errorMessage = "El formato del correo electrónico es inválido.";
                break;
            case 'auth/weak-password':
                errorMessage = "La contraseña debe tener al menos 6 caracteres.";
                break;
            default:
                errorMessage = "Error al registrar: " + error.message;
        }
        alert(errorMessage);
        console.error("Error de registro:", error);
    }
});

// Función para alternar visibilidad de contraseña
function togglePassword(id) {
    const input = document.getElementById(id);
    const icon = input.nextElementSibling;

    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}