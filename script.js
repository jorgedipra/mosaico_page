// Referencias
const sw = document.getElementById("sw");
const Allsw = document.querySelector(".sw");
const addPageBtn = document.getElementById("addPageBtn");
const changeBackgroundBtn = document.getElementById("changeBackgroundBtn");
const modal = document.getElementById("modal");
const imageURL = document.getElementById("imageURL");
const preview = document.getElementById("vistaprevia"); 
const closeModal = document.getElementById("closeModal");
const addPageForm = document.getElementById("addPageForm");
const groupContainer = document.getElementById("groupContainer");
const viewGroupModal = document.getElementById("viewGroupModal");
const closeViewGroupModal = document.getElementById("closeViewGroupModal");
const groupElementsContainer = document.getElementById("groupElementsContainer");
const viewGroupTitle = document.getElementById("viewGroupTitle");
const changeBackgroundModal = document.getElementById("changeBackgroundModal");
const closeChangeBackgroundModal = document.getElementById("closeChangeBackgroundModal");
const backgroundForm = document.getElementById("backgroundForm");
const editGroupModal = document.getElementById("editGroupModal");
const closeEditGroupModal = document.getElementById("closeEditGroupModal");
const editGroupForm = document.getElementById("editGroupForm");
const newGroupNameInput = document.getElementById("newGroupName");
const editGroupTitle = document.getElementById("editGroupTitle");
let currentEditGroup = "";

// Obtener buscador
const customSelect = document.querySelector('.custom-select');
const selectedOption = customSelect.querySelector('.selected-option');
const options = customSelect.querySelector('.options');
const buscador = document.getElementById('buscador');
const time = document.getElementById('time');

// Variables
let data = JSON.parse(localStorage.getItem("pageGroups")) || {};
let backgroundColor = localStorage.getItem("backgroundColor") || "#1a1a1a";
let backgroundImage = localStorage.getItem("backgroundImage") || "";

// Aplicar fondo
document.body.style.backgroundColor = backgroundColor;
if (backgroundImage) {
    document.body.style.backgroundImage = `url(${backgroundImage})`;
    document.body.style.backgroundSize = "cover";
}

/// Variable para verificar si estamos en modo de edición
let isEditMode = false;

// Renderizar grupos y habilitar funcionalidad draggable solo en modo edición
function renderGroups() {
    groupContainer.innerHTML = "";
    Object.keys(data).forEach((groupName, index) => {
        const group = document.createElement("div");
        group.className = "group";
        // if (groupName === "IA") {
        //     group.classList.add("ia-group");
        // }
        group.setAttribute("draggable", "true"); // Hacer el grupo arrastrable
        group.dataset.index = index; // Guardar el índice para manejar el orden
        group.innerHTML = `
            <h3>${groupName}</h3>
            <div class="page-preview">
                ${data[groupName].slice(0, 4).map(page => `
                    <img src="${page.image}" alt="${page.title}">
                `).join("")}
                ${data[groupName].length > 4 ? `<span>+${data[groupName].length - 4}</span>` : ""}
            </div>
            <button class="edit-btn sw" onclick="editGroup('${groupName}')">
                <i class="fas fa-edit"></i>
            </button>
            <button class="delete-btn sw" onclick="deleteGroup('${groupName}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        group.addEventListener("click", () => openGroupModal(groupName));
        groupContainer.appendChild(group);
    });

    enableDragAndDrop(); // Habilitar funcionalidad drag-and-drop solo si isEditMode es true
}
// Drag-and-Drop para los grupos (habilitado solo en modo edición)

// Obtener el elemento después del cual se soltará el grupo
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".group:not(.dragging)")];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Guardar el nuevo orden de los grupos en localStorage
function saveGroupOrder() {
    const newOrder = [...document.querySelectorAll(".group")].map(group => group.querySelector("h3").textContent);
    const newData = {};
    newOrder.forEach(groupName => {
        newData[groupName] = data[groupName];
    });
    data = newData;
    localStorage.setItem("pageGroups", JSON.stringify(data));
}

// Drag-and-Drop para las páginas dentro de un grupo
function enablePageDragAndDrop(groupName) {
    const pageItems = groupElementsContainer.querySelectorAll(".page-item");
    let draggedPage = null;

    pageItems.forEach(item => {
        item.addEventListener("dragstart", (e) => {
            draggedPage = item;
            item.classList.add("dragging");
        });

        item.addEventListener("dragend", () => {
            item.classList.remove("dragging");
            draggedPage = null;
        });

        item.addEventListener("dragover", (e) => {
            e.preventDefault();
            const afterElement = getDragAfterPageElement(groupElementsContainer, e.clientY);
            if (afterElement == null) {
                groupElementsContainer.appendChild(draggedPage);
            } else {
                groupElementsContainer.insertBefore(draggedPage, afterElement);
            }
        });

        item.addEventListener("drop", (e) => {
            e.preventDefault();
            if (!draggedPage) return;

            const oldIndex = parseInt(draggedPage.dataset.index);
            const newIndex = [...groupElementsContainer.querySelectorAll(".page-item")].indexOf(draggedPage);

            // Update data array
            const pageData = data[groupName];
            const [movedPage] = pageData.splice(oldIndex, 1);
            pageData.splice(newIndex, 0, movedPage);

            // Save and re-render
            localStorage.setItem("pageGroups", JSON.stringify(data));
            openGroupModal(groupName); // Re-render the modal
        });
    });
}

function getDragAfterPageElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".page-item:not(.dragging)")];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Eliminar grupo
function deleteGroup(groupName) {
    if (confirm(`¿Estás seguro de eliminar el grupo "${groupName}"?`)) {
        delete data[groupName];
        localStorage.setItem("pageGroups", JSON.stringify(data));
        renderGroups();
    }
}

// Editar grupo
function editGroup(groupName) {
    currentEditGroup = groupName;
    newGroupNameInput.value = groupName;
    editGroupTitle.textContent = `Editar: ${groupName}`;
    editGroupModal.classList.remove("hidden");
}

function saveGroupRename() {
    const newGroupName = newGroupNameInput.value.trim();

    if (newGroupName && newGroupName !== currentEditGroup) {
        const newData = {};
        Object.keys(data).forEach(key => {
            if (key === currentEditGroup) {
                newData[newGroupName] = data[currentEditGroup];
            } else {
                newData[key] = data[key];
            }
        });
        
        data = newData;
        localStorage.setItem("pageGroups", JSON.stringify(data));
        renderGroups();
        showToast(`Grupo renombrado a "${newGroupName}"`, "success");
    }
    editGroupModal.classList.add("hidden");
    currentEditGroup = "";
}


// Eliminar página
function deletePage(groupName, pageIndex) {
    if (confirm("¿Estás seguro de eliminar esta página?")) {
        data[groupName].splice(pageIndex, 1);
        localStorage.setItem("pageGroups", JSON.stringify(data));
        renderGroups();
        openGroupModal(groupName);
    }
}

// Eliminar página internamente
function deletePageDitect(groupName, pageIndex) {
    data[groupName].splice(pageIndex, 1);
    localStorage.setItem("pageGroups", JSON.stringify(data));
    renderGroups();
}

// Función para editar páginas
function editPage(groupName, pageIndex) {
    const page = data[groupName][pageIndex];

    const groupNameInput = document.getElementById("groupNameInput");
    groupNameInput.value = groupName;
    groupNameInput.readOnly = true;
    document.getElementById("pageTitle").value = page.title;
    document.getElementById("pageURL").value = page.url;
    document.getElementById("imageURL").value = page.image;
    document.getElementById("vistaprevia").src = page.image;
    document.getElementById("modalTitle").textContent = "Editar Página";

    modal.classList.remove("hidden");
    localStorage.setItem('pageIndex', pageIndex);
    localStorage.setItem('groupName', groupName);
    viewGroupModal.classList.add("hidden");
}


imageURL.addEventListener("input", () => {
    img_loader()
});

pageURL.addEventListener("input", () => {
    img_loader();
    suggestPageName();
});

function suggestPageName() {
    const url = pageURL.value.trim();
    const pageTitleInput = document.getElementById("pageTitle");
    
    if (!url) return;
    
    try {
        const urlObj = new URL(url);
        let name = urlObj.hostname.replace('www.', '');
        name = name.split('.')[0];
        name = name.charAt(0).toUpperCase() + name.slice(1);
        
        if (pageTitleInput.value === "" || pageTitleInput.dataset.suggested === "true") {
            pageTitleInput.value = name;
            pageTitleInput.dataset.suggested = "true";
        }
    } catch {
        // URL inválida
    }
}

document.getElementById("pageTitle").addEventListener("input", function() {
    if (this.dataset.suggested === "true" && this.value !== "") {
        this.dataset.suggested = "false";
    }
});

async function loadImagePreviews(url, domain) {
    const previewContainer = document.getElementById("previewImages");
    
    const previewSources = [
        `https://api.faviconkit.com/${domain}/64`,
        `https://logo.clearbit.com/${domain}`,
        `https://www.favicon.im/real/${domain}.png`
    ];
    
    previewContainer.innerHTML = "";
    
    for (let i = 0; i < previewSources.length; i++) {
        const div = document.createElement("div");
        div.className = "preview-item";
        div.dataset.url = previewSources[i];
        
        const img = document.createElement("img");
        img.src = previewSources[i];
        img.alt = `Preview ${i + 1}`;
        
        img.onerror = () => {
            div.style.display = "none";
        };
        
        div.appendChild(img);
        previewContainer.appendChild(div);
        
        div.addEventListener("click", () => {
            document.querySelectorAll(".preview-item").forEach(p => p.classList.remove("selected"));
            div.classList.add("selected");
            document.getElementById("imageURL").value = previewSources[i];
            img_loader();
        });
    }
}

pageURL.addEventListener("input", () => {
    const url = pageURL.value.trim();
    if (url) {
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname.replace('www.', '');
            loadImagePreviews(url, domain);
        } catch {
            // URL inválida
        }
    }
});

function img_loader(){
    const imageUrl = imageURL.value.trim(); // Obtiene el valor actual del input, eliminando espacios

    if (imageUrl) {
        vistaprevia.src = imageUrl; // Actualiza la vista previa con la URL ingresada
    } else {
        let  domain = pageURL.value.trim() || "example.com"; // Usa el dominio ingresado o un predeterminado
        domain = domain.replace(/^https?:\/\//, ""); // Elimina 'http://' o 'https/'
        const faviconURL = `https://api.faviconkit.com/${domain}/64`; // Genera la URL del favicon
        vistaprevia.src = faviconURL; // Actualiza la vista previa con el favicon
    }

    // Manejador de errores
    vistaprevia.onerror = () => {
        vistaprevia.src = "./img/ico.png"; // Carga la imagen por defecto si falla
        console.error("No se pudo cargar la imagen. Se usará la imagen por defecto.");
    };
}



// Agregar o editar página
addPageForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const groupNameInput = document.getElementById("groupNameInput");
    const groupName = groupNameInput.value;
    const pageTitle = document.getElementById("pageTitle").value;
    const pageURL = document.getElementById("pageURL").value;
    let  imageURL = document.getElementById("imageURL").value;
    if(!imageURL){
        imageURL=vistaprevia.src;
    }

    const editIndex = localStorage.getItem("pageIndex");
    const editGroup = localStorage.getItem("groupName");

    if (!data[groupName]) {
        data[groupName] = [];
    }

    if (editIndex !== "" && editGroup !== "") {
        data[editGroup][editIndex] = { title: pageTitle, url: pageURL, image: imageURL };
    } else {
        data[groupName].push({ title: pageTitle, url: pageURL, image: imageURL });
    }

    localStorage.setItem("pageGroups", JSON.stringify(data));
    renderGroups();
    modal.classList.add("hidden");
    groupNameInput.readOnly = false;
    localStorage.setItem('pageIndex', "");
    localStorage.setItem('groupName', "");
});

const searchURLs = {
    google: 'https://www.google.com/search?q=',
    chatgpt: 'https://chat.openai.com/?q=',
    duckduckgo: 'https://duckduckgo.com/?q='
};

// Abrir y cerrar el menú
selectedOption.addEventListener('click', () => {
    customSelect.classList.toggle('active');
});

// Seleccionar opción
options.addEventListener('click', (e) => {
    if (e.target.closest('.option')) {
        const option = e.target.closest('.option');
        const img = option.querySelector('img').src;
        const value = option.dataset.value;

        // Cambiar la selección
        selectedOption.innerHTML = `<img src="${img}" alt="${value}" data-value="${value}">`;
        customSelect.dataset.value = value;

        // Cerrar el menú
        customSelect.classList.remove('active');
    }
});

// Enviar búsqueda al presionar Enter
buscador.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = buscador.value.trim();
        const engine = customSelect.dataset.value || 'google'; // Motor por defecto
        if (query) {
            const url = `${searchURLs[engine]}${encodeURIComponent(query)}`;
            window.location.href = url;
        }
    }
});

// Abrir modal para agregar página
addPageBtn.addEventListener("click", () => {
    addPageForm.reset();
    document.getElementById("modalTitle").textContent = "Agregar Página";
    const groupNameInput = document.getElementById('groupNameInput');
    groupNameInput.readOnly = false;
    
    const datalist = document.getElementById('groupDatalist');
    const groupNames = Object.keys(data);
    datalist.innerHTML = groupNames.map(name => `<option value="${name}">`).join('');
    
    modal.classList.remove("hidden");
    groupNameInput.focus();
});

// Abrir modal para mostrar todos los elementos de un grupo
function openGroupModal(groupName) {
    const group = data[groupName]; // Obtener las páginas del grupo

    viewGroupTitle.textContent = `Elementos del Grupo: ${groupName}`;

    groupElementsContainer.innerHTML = group.map((page, index) => {
        return `
        <div id="${page.title}" class="page-item" draggable="true" data-index="${index}">
            <a href="${page.url}" target="_blank" rel="noopener noreferrer">
                <img src="${page.image}" alt="${page.title}" class="page-img">
                <p>${page.title}</p>
            </a>
            <div class="controls">
                <button class="edit-btn sw" onclick="editPage('${groupName}', ${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn sw" onclick="deletePage('${groupName}', ${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        `;
    }).join("");

    // Remove existing button before adding a new one
    const existingBtn = document.getElementById('addPageToGroupBtn');
    if (existingBtn) {
        existingBtn.remove();
    }

    // Add "Add page to this group" button
    const addPageToGroupBtn = document.createElement('button');
    addPageToGroupBtn.innerHTML = '<i class="fas fa-plus"></i> Agregar página a este grupo';
    addPageToGroupBtn.id = 'addPageToGroupBtn'; // give it an id to prevent duplicates
    addPageToGroupBtn.style.marginTop = '15px'; // Add some margin
    addPageToGroupBtn.addEventListener('click', () => {
        viewGroupModal.classList.add('hidden');
        addPageForm.reset();
        const groupNameInput = document.getElementById('groupNameInput');
        document.getElementById('modalTitle').textContent = 'Agregar Página';
        groupNameInput.value = groupName;
        groupNameInput.readOnly = true; // Make it readonly
        modal.classList.remove('hidden');
    });
    
    groupElementsContainer.insertAdjacentElement('afterend', addPageToGroupBtn);

    // Mostrar el modal
    viewGroupModal.classList.remove("hidden");
    sw_();
    enablePageDragAndDrop(groupName);
}


// Cerrar modal de grupo
closeViewGroupModal.addEventListener("click", () => viewGroupModal.classList.add("hidden"));


// Escuchar el clic en el contenedor principal del modal
viewGroupModal.addEventListener("click", (event) => {
    if (event.target === viewGroupModal) {
        //   console.log("Has hecho clic fuera del contenido del modal.");
        viewGroupModal.classList.add("hidden");
    }
});

// Escuchar el clic en el botón para cerrar el modal
closeViewGroupModal.addEventListener("click", (event) => {
    // console.log("Has hecho clic en el botón de cerrar.");
    event.stopPropagation(); // Evita que el evento se propague al contenedor principal
});

// Edit group modal handlers
closeEditGroupModal.addEventListener("click", () => {
    editGroupModal.classList.add("hidden");
    currentEditGroup = "";
});

editGroupModal.addEventListener("click", (event) => {
    if (event.target === editGroupModal) {
        editGroupModal.classList.add("hidden");
        currentEditGroup = "";
    }
});

editGroupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    saveGroupRename();
});


closeModal.addEventListener("click", () => modal.classList.add("hidden"));
// modal.addEventListener("click", () => modal.classList.add("hidden"));

const modalContent = document.querySelector('.modal-content');
if (modalContent) {
    modalContent.addEventListener("click", (event) => {
        // event.preventDefault(); 
        // event.stopPropagation(); 
        // return false; 
    });
}

// Escuchar el clic en el contenedor principal del modal
modal.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.classList.add("hidden");
        document.getElementById('groupNameInput').readOnly = false; // Reset readonly state
    }
});

// Escuchar el clic en el botón para cerrar el modal
closeModal.addEventListener("click", (event) => {
    modal.classList.add("hidden");
    document.getElementById('groupNameInput').readOnly = false; // Reset readonly state
    event.stopPropagation(); // Evita que el evento se propague al contenedor principal
});




// Mostrar modal para cambiar fondo
changeBackgroundBtn.addEventListener("click", () => {
    document.getElementById("backgroundColor").value = backgroundColor;
    document.getElementById("backgroundImage").value = backgroundImage;
    document.getElementById("backgroundImageFile").value = "";
    const preview = document.getElementById("backgroundPreview");
    if (backgroundImage) {
        preview.src = backgroundImage;
        preview.classList.remove("hidden");
        preview.onerror = () => {
            preview.src = "./img/sin_fondo.png";
        };
    } else {
        preview.src = "./img/sin_fondo.png";
        preview.classList.remove("hidden");
    }
    updateClearButton();
    changeBackgroundModal.classList.remove("hidden");
});

const backgroundImageFile = document.getElementById("backgroundImageFile");
const clearImageBtn = document.getElementById("clearImageBtn");
const backgroundPreview = document.getElementById("backgroundPreview");
const backgroundImageInput = document.getElementById("backgroundImage");

backgroundImageFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const imageData = event.target.result;
            backgroundImageInput.value = imageData;
            backgroundPreview.src = imageData;
            backgroundPreview.classList.remove("hidden");
            updateClearButton();
        };
        reader.readAsDataURL(file);
    }
});

backgroundImageInput.addEventListener("input", () => {
    const url = backgroundImageInput.value.trim();
    if (url) {
        backgroundPreview.src = url;
        backgroundPreview.classList.remove("hidden");
        backgroundPreview.onerror = () => {
            preview.src = "./img/sin_fondo.png";
        };
    } else {
        backgroundPreview.src = "./img/sin_fondo.png";
        backgroundPreview.classList.remove("hidden");
    }
    updateClearButton();
});

clearImageBtn.addEventListener("click", () => {
    backgroundImageFile.value = "";
    backgroundImageInput.value = "";
    backgroundPreview.src = "./img/sin_fondo.png";
    updateClearButton();
});

function updateClearButton() {
    const hasImage = document.getElementById("backgroundImage").value || backgroundImageFile.files.length > 0;
    if (hasImage) {
        clearImageBtn.classList.remove("hidden");
    } else {
        clearImageBtn.classList.add("hidden");
    }
}

// Cerrar modal de cambiar fondo
function closeBackgroundModal() {
    changeBackgroundModal.classList.add("hidden");
    document.getElementById("backgroundImageFile").value = "";
}

closeChangeBackgroundModal.addEventListener("click", (event) => {
    closeBackgroundModal();
    event.stopPropagation();
});

changeBackgroundModal.addEventListener("click", (event) => {
    if (event.target === changeBackgroundModal) {
        closeBackgroundModal();
    }
});

// Galería de fondos
const galleryModal = document.getElementById("galleryModal");
const closeGalleryModal = document.getElementById("closeGalleryModal");
const galleryContainer = document.getElementById("galleryContainer");
const openGalleryBtn = document.getElementById("openGalleryBtn");

const galleryImages = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920",
    "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1920",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920",
    "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=1920",
    "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1920",
    "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920",
    "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1920",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920",
    "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1920",
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1920",
    "https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?w=1920"
];

function renderGallery() {
    galleryContainer.innerHTML = galleryImages.map((url, index) => `
        <div class="gallery-item" data-url="${url}">
            <img src="${url}" alt="Fondo ${index + 1}" loading="lazy">
        </div>
    `).join("");

    galleryContainer.querySelectorAll(".gallery-item").forEach(item => {
        item.addEventListener("click", () => {
            const url = item.dataset.url;
            document.getElementById("backgroundImage").value = url;
            document.getElementById("backgroundPreview").src = url;
            document.getElementById("backgroundPreview").classList.remove("hidden");
            galleryModal.classList.add("hidden");
        });
    });
}

openGalleryBtn.addEventListener("click", () => {
    renderGallery();
    galleryModal.classList.remove("hidden");
});

closeGalleryModal.addEventListener("click", () => {
    galleryModal.classList.add("hidden");
});

galleryModal.addEventListener("click", (event) => {
    if (event.target === galleryModal) {
        galleryModal.classList.add("hidden");
    }
});


// Validar URL de imagen
function isValidImageUrl(url) {
    if (!url) return true;
    try {
        const valid = /^https?:\/\//.test(url) || /^data:image\//.test(url) || url.startsWith('./') || url.startsWith('img/');
        return valid;
    } catch {
        return false;
    }
}

// Aplicar cambio de fondo
backgroundForm.addEventListener("submit", (e) => {
    e.preventDefault();
    backgroundColor = document.getElementById("backgroundColor").value;
    backgroundImage = document.getElementById("backgroundImage").value;

    if (!isValidImageUrl(backgroundImage)) {
        showToast("URL de imagen inválida", "error");
        return;
    }

    localStorage.setItem("backgroundColor", backgroundColor);
    localStorage.setItem("backgroundImage", backgroundImage);

    document.body.style.backgroundColor = backgroundColor;
    document.body.style.backgroundImage = backgroundImage ? `url(${backgroundImage})` : "none";
    document.body.style.backgroundSize = "cover";

    closeBackgroundModal();
    document.body.style.display = "none";
    document.body.offsetHeight;
    document.body.style.display = "";
});
// TIME

// Función para actualizar el reloj
function updateClock() {
    const timeElement = document.getElementById('time');
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const amPm = hours >= 12 ? 'PM' : 'AM';

    // Convertir al formato de 12 horas
    hours = hours % 12 || 12;

    // Formatear los minutos con dos dígitos
    const formattedMinutes = minutes.toString().padStart(2, '0');

    // Actualizar el contenido del elemento
    timeElement.textContent = `${hours}:${formattedMinutes} ${amPm}`;
}

// Llamar la función inicialmente y luego cada segundo
updateClock();
setInterval(updateClock, 1000);

// Aplicar inicializaciones
document.addEventListener("DOMContentLoaded", () => {
    createToastContainer();
    renderGroups();
    sw_();
    restaurar();
});






function createToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

function showToast(message, type = 'success', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = createToastContainer();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.add('show');
    }, 10); // Small delay to allow CSS transition
    
    setTimeout(() => {
        toast.classList.remove('show');
        // Remove element after transition
        toast.addEventListener('transitionend', () => toast.remove());
    }, duration);
}

function sw_() {
    const sw = document.getElementById("sw"); // Botón o activador
    const Allsw = document.querySelectorAll(".sw"); // Todos los elementos con la clase sw

    // Función para aplicar el estado desde LocalStorage
    const applyState = (state) => {
        Allsw.forEach(element => {
            element.style.display = state === "visible" ? "inline-flex" : "none";
        });
    };

    // Recuperar estado inicial desde LocalStorage
    let initialState = localStorage.getItem("swState") || "hidden";
    applyState(initialState);

    // Cambiar texto del botón
    const changeButtonText = (state) => {
        if (state === "visible") {
            sw.innerHTML = `<i class="fas fa-edit"></i> Editando`; // Cambiar el texto a "Editando"
        } else {
            sw.innerHTML = `<i class="fas fa-edit"></i> Editar`; // Cambiar el texto a "Editar"
        }
    };

    // Aplicar el texto adecuado al cargar la página
    changeButtonText(initialState);

    if (sw) {
        sw.addEventListener("click", () => {
            // Alternar estado y guardarlo en LocalStorage
            const newState = initialState === "hidden" ? "visible" : "hidden";
            applyState(newState);
            localStorage.setItem("swState", newState);

            // Cambiar el texto del botón según el nuevo estado
            changeButtonText(newState);

            // Actualizar el estado inicial para futuras interacciones
            initialState = newState;
            sw_();
        });
    }
}


function restaurar() {
    // Referencias
    const exportBtn = document.getElementById("exportBtn");
    const importBtn = document.getElementById("importBtn");
    const importFileInput = document.getElementById("importFileInput");

    // Exportar datos de pageGroups a un archivo .txt
    exportBtn.addEventListener("click", () => {
        const pageGroupsData = JSON.stringify(data, null, 2);
        const blob = new Blob([pageGroupsData], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "pageGroups.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Importar datos desde un archivo .txt al localStorage
    importBtn.addEventListener("click", () => {
        importFileInput.click(); // Abrir el selector de archivos
    });

    importFileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);

                    // Validar que los datos sean un objeto válido
                    if (typeof importedData === "object" && importedData !== null) {
                        data = importedData;
                        localStorage.setItem("pageGroups", JSON.stringify(data));
                        renderGroups(); // Renderizar los grupos actualizados
                        showToast("Datos importados correctamente.", "success");
                    } else {
                        throw new Error("Formato de datos inválido.");
                    }
                } catch (error) {
                    showToast("Error al importar los datos: " + error.message, "error");
                }
            };
            reader.readAsText(file);
        }
    });

}

// Habilitar funcionalidad de arrastrar y soltar solo cuando el modo de edición está activo
function enableDragAndDrop() {
    if (!isEditMode) return; // Si no estamos en modo de edición, no habilitar arrastre

    const groups = document.querySelectorAll(".group");

    let draggedElement = null;

    groups.forEach(group => {
        // Evento al iniciar el arrastre
        group.addEventListener("dragstart", (e) => {
            draggedElement = group;
            e.dataTransfer.effectAllowed = "move";
            setTimeout(() => group.classList.add("hidden"), 0); // Ocultar temporalmente el elemento arrastrado
        });

        // Evento al terminar el arrastre
        group.addEventListener("dragend", () => {
            draggedElement.classList.remove("hidden");
            draggedElement = null;
        });

        // Permitir soltar en otros elementos
        group.addEventListener("dragover", (e) => {
            e.preventDefault(); // Necesario para permitir el evento drop
        });

        // Manejar el evento drop
        group.addEventListener("drop", (e) => {
            e.preventDefault();

            if (draggedElement && draggedElement !== group) {
                const draggedIndex = parseInt(draggedElement.dataset.index);
                const targetIndex = parseInt(group.dataset.index);

                // Cambiar el orden en el objeto data
                const keys = Object.keys(data);
                const draggedKey = keys[draggedIndex];
                keys.splice(draggedIndex, 1);
                keys.splice(targetIndex, 0, draggedKey);

                // Reconstruir el objeto data con el nuevo orden
                const newData = {};
                keys.forEach(key => {
                    newData[key] = data[key];
                });
                data = newData;

                // Guardar en localStorage y volver a renderizar
                localStorage.setItem("pageGroups", JSON.stringify(data));
                renderGroups();
            }
        });
    });
}

// Cambiar entre modo de edición y no edición
function toggleEditMode() {
    isEditMode = !isEditMode;
    const sw = document.getElementById("sw");

    // Cambiar texto del botón según el modo
    if (isEditMode) {
        sw.innerHTML = `<i class="fas fa-edit"></i> Editando`; // Cambiar a "Editando"
    } else {
        sw.innerHTML = `<i class="fas fa-edit"></i> Editar`; // Cambiar a "Editar"
    }

    renderGroups(); // Volver a renderizar los grupos
}

function copyToClipboard(inputId) {
    const e = event;
    e.preventDefault(); 
    e.stopPropagation(); 

    const input = document.getElementById(inputId);
    const textToCopy = input.value;

    navigator.clipboard.writeText(textToCopy).then(() => {
        const button = e.target.closest('.copy-btn');
        if (!button) return;

        const icon = button.querySelector('i');
        if (icon) {
            const originalClass = icon.className;
            icon.className = 'fas fa-check';
            icon.style.color = '#28a745';

            setTimeout(() => {
                icon.className = originalClass;
                icon.style.color = '';
            }, 1500);
        }
    }).catch(err => {
        console.error('Error al copiar texto: ', err);
    });

    return false; 
}


// Evento al hacer clic en el botón de editar
document.getElementById("sw").addEventListener("click", toggleEditMode);