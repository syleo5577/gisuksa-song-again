import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// import {getAuth} from 'firebase/auth';
import 'firebase/database';
import {getFirestore} from 'firebase/firestore';
import {getStorage} from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBgoBEvAhLJiQXuKYMNYIpzoQQrv8HNys4",
    authDomain: "ssm-qwer.firebaseapp.com",
    projectId: "ssm-qwer",
    storageBucket: "ssm-qwer.appspot.com",
    messagingSenderId: "743782546124",
    appId: "1:743782546124:web:e5f7557081d365b034e069"
};

const app = initializeApp(firebaseConfig);
// export const authService = getAuth();
export const db = getFirestore();
export const storage = getStorage();