import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuración de Firebase - CONFIGURACIÓN REAL
const firebaseConfig = {
  apiKey: "AIzaSyBc3vTedJPhgrOz1Hn6nFLWE1HWMGHGVFs",
  authDomain: "departamentoehsmexico.firebaseapp.com",
  projectId: "departamentoehsmexico",
  storageBucket: "departamentoehsmexico.appspot.com",
  messagingSenderId: "303911953682",
  appId: "1:303911953682:web:2a6a0223da6798f7c4bfcb",
  measurementId: "G-T249N71FCL"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore con configuración específica para evitar CORS
export const db = getFirestore(app);

// Inicializar Auth
export const auth = getAuth(app);

// Exportar credenciales necesarias para llamadas REST (API Key y Project ID)
export const FIREBASE_API_KEY = firebaseConfig.apiKey;
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;

export default app;
