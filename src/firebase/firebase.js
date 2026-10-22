import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC5SLxKVEe5AGZC7o3P7biGtyMWheJ8UKM",
  authDomain: "shopease-50ab5.firebaseapp.com",
  projectId: "shopease-50ab5",
  storageBucket: "shopease-50ab5.appspot.com",
  messagingSenderId: "339153626172",
  appId: "1:339153626172:web:be5c541aa1e28cd5e2cf39",
  measurementId: "G-CZ2ZZ3T71V",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);