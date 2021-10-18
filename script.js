// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import * as rtdb from "https://www.gstatic.com/firebasejs/9.1.3/firebase-database.js";
import { getAuth, signInWithRedirect, getRedirectResult, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBa2L9IA6mT7PvpTXv4vy4XCFKKMleYQI4",
  authDomain: "ictochat-28b45.firebaseapp.com",
  databaseURL: "https://ictochat-28b45-default-rtdb.firebaseio.com",
  projectId: "ictochat-28b45",
  storageBucket: "ictochat-28b45.appspot.com",
  messagingSenderId: "913846922731",
  appId: "1:913846922731:web:55fa87198c9f05425e3dae",
  measurementId: "G-E9BL4YCX4S"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();
let username = "";
let avatar = "";
let email = "";
let initialize = true;
let db = rtdb.getDatabase(app);
let chatRef = rtdb.ref(db, "/chats");
//let userRef = rtdb.ref(db, "/users");
const auth = getAuth();

getRedirectResult(auth)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access Google APIs.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    username = user["displayName"];
    avatar = user["photoURL"];
    email = user["email"];
    document.getElementById("signIn").style.visibility = 'hidden';
    for (let elt of document.getElementsByClassName("loggedIn")) elt.style.visibility = 'visible';
    document.getElementById('loginText').innerHTML += username + ' ('+ email +')';
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });

const scrollToBottom = (node) => {
	node.scrollTop = node.scrollHeight;
}
rtdb.onValue(chatRef, ss=>{
  let obj = ss.val();
  let backload = 0
  if (initialize) {
    let histLen = Object.keys(obj).length;
    if (histLen < 50) {
      backload = histLen - 1;
    } else {
      backload = 50;
    }
    initialize = false;  
  }
  for (let x = backload; x > -1; x--) {
    let msgID = Object.keys(obj).reverse()[x];
    let author = obj[msgID]["author"];
    let pfp = obj[msgID]["avatar"]
    let msg = obj[msgID]["message"];
    try {
      document.getElementById(msgID).innerHTML = ('<div class="pfp"><img src='+pfp+' alt='+author+' style="width:32px;height:32px;"></div><div class="msgText"><p class="author">'+author+'</p><p class="message">'+msg+'</p></div>');  
    } catch {
      let newMsg = document.createElement("div");
      newMsg.setAttribute("class","message");
      newMsg.setAttribute("id",msgID);
      document.getElementById("chatBox").appendChild(newMsg);
      document.getElementById(msgID).innerHTML = ('<div class="pfp"><img src='+pfp+' alt='+author+' style="width:32px;height:32px;"></div><div class="msgText"><p class="author">'+author+'</p><p class="message">'+msg+'</p></div>');
    }
  }
  scrollToBottom(document.getElementById('chatBox'));
});

const chatHandler = function(){
  if (username && avatar) { 
    let chat = document.querySelector("#chatInput").value.trim();
    if (chat.length < 256 && chat) {
      rtdb.push(chatRef, {'author':username,'message':chat,'avatar':avatar});
    } else {
      alert("Too long/short!");
    }
    document.querySelector("#chatInput").value = "";
  } else {
    alert("Sign in to join the conversation!");
  }
}

const signInRedirect = function() {
  signInWithRedirect(auth,provider); //this function frustrated me for a good 3 minutes
}

document.querySelector("#chatSubmit").addEventListener("click", chatHandler);
document.querySelector('#chatInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      chatHandler();
    }
});
document.querySelector("#signIn").addEventListener("click", signInRedirect);
