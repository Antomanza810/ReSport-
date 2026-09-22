// Referencias a los elementos del DOM
const profileBtn = document.getElementById('profileBtn');
const defaultAvatar = document.getElementById('defaultAvatar');
const userPhoto = document.getElementById('userPhoto');
const userNameDisplay = document.getElementById('userNameDisplay');

const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const closeLoginBtn = document.getElementById('closeLoginBtn');
const emailInput = document.getElementById('emailInput'); // Referencia al input de correo

const editProfileModal = document.getElementById('editProfileModal');
const editProfileForm = document.getElementById('editProfileForm');
const closeEditBtn = document.getElementById('closeEditBtn');

const editNameInput = document.getElementById('editNameInput');
const editPhotoUrlInput = document.getElementById('editPhotoUrlInput');
const settingsBtn = document.getElementById('settingsBtn');

// Estado del usuario
let isLoggedIn = false;
let userData = {
  name: "",
  photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
};

// Evento al hacer clic en la foto/icono de perfil
profileBtn.addEventListener('click', () => {
  if (!isLoggedIn) {
    // Si no está logueado, se abre el modal de login
    loginModal.classList.remove('hidden');
  } else {
    // Si ya está logueado, abre el modal para editar perfil
    editNameInput.value = userData.name;
    editPhotoUrlInput.value = userData.photoUrl;
    editProfileModal.classList.remove('hidden');
  }
});

// Enviar formulario de inicio de sesión
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Extraer el email ingresado
  const emailValue = emailInput.value.trim();
  
  // Extraer la primera parte del email (antes del '@')
  const usernameFromEmail = emailValue.split('@')[0];
  
  // Guardar en userData
  userData.name = usernameFromEmail;

  isLoggedIn = true;

  // Actualizar la interfaz con los nuevos datos
  defaultAvatar.classList.add('hidden');
  userPhoto.src = userData.photoUrl;
  userPhoto.classList.remove('hidden');
  userNameDisplay.textContent = userData.name;

  // Cerrar ventana modal y limpiar campos
  loginModal.classList.add('hidden');
  loginForm.reset();
});

// Enviar formulario de edición de perfil
editProfileForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  userData.name = editNameInput.value;
  userData.photoUrl = editPhotoUrlInput.value;

  // Aplicar los cambios en pantalla
  userNameDisplay.textContent = userData.name;
  userPhoto.src = userData.photoUrl;

  // Cerrar modal
  editProfileModal.classList.add('hidden');
});

// Botones para cancelar y cerrar modales
closeLoginBtn.addEventListener('click', () => {
  loginModal.classList.add('hidden');
});

closeEditBtn.addEventListener('click', () => {
  editProfileModal.classList.add('hidden');
});

// Evento para el botón de ajustes
settingsBtn.addEventListener('click', () => {
  alert("Abriendo panel de Ajustes...");
});