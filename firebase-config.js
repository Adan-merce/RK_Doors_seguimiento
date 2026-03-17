// CONFIGURACIÓN FIREBASE - DATOS REALES DEL PROYECTO
const firebaseConfig = {
  apiKey: "AIzaSyQH8dH0buYnThJMclZpLxDCzAtOR42Sek",
  authDomain: "rkdoors-80efb.firebaseapp.com",
  projectId: "rkdoors-80efb",
  storageBucket: "rkdoors-80efb.firebasestorage.app",
  messagingSenderId: "529631700062",
  appId: "1:529631700062:web:b4c1474bddaa0e0a2540cf"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
const db = firebase.firestore(); // ✅ Punto y coma agregado

// CONFIGURACIÓN EMAILJS - DATOS REALES
emailjs.init("8EY_xeQKhFDlEPe8Y"); // ✅ Clave pública correcta