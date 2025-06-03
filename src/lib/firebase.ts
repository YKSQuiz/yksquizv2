// Firebase SDK'dan gerekli modülleri içe aktar
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase projenin yapılandırma ayarları (Firebase Console'dan alınan)
const firebaseConfig = {
  apiKey: "AIzaSyC9YcnGxDPYHkJb6FUofcLtNVWQOgO_rys",
  authDomain: "study-arena-akfvn.firebaseapp.com",
  projectId: "study-arena-akfvn",
  storageBucket: "study-arena-akfvn.appspot.com", // DÜZELTİLDİ: firebasestorage.app → appspot.com
  messagingSenderId: "950167487887",
  appId: "1:950167487887:web:b4c24b46ee009c8815f7fa"
};

// Firebase'i daha önce başlatıp başlatmadığımızı kontrol et
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase servislerini başlat ve dışa aktar
export const auth = getAuth(app);         // Kullanıcı girişi ve kimlik doğrulama
export const db = getFirestore(app);      // Firestore veritabanı

export default app;
