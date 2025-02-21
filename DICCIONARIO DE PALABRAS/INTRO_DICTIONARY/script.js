// 🌙 MODO OSCURO
const toggleSwitch = document.querySelector(".tema .input"); // Selecciona el checkbox dentro de .tema
const body = document.body;

// Función para alternar el modo oscuro
function toggleDarkMode() {
    body.classList.toggle("dark-mode");

    // Guarda el estado en localStorage
    if (body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "enabled");
        toggleSwitch.checked = true;
    } else {
        localStorage.setItem("darkMode", "disabled");
        toggleSwitch.checked = false;
    }
}

// Verifica si el usuario tenía activado el modo oscuro al cargar la página
if (localStorage.getItem("darkMode") === "enabled") {
    body.classList.add("dark-mode");
    toggleSwitch.checked = true; // Asegura que el interruptor refleje el estado guardado
}

// Evento para activar el modo oscuro al hacer clic en el interruptor
toggleSwitch.addEventListener("change", toggleDarkMode);



//bloques para la listas de sugerencias
const busqueda = document.getElementById("busqueda");
const listasugerencias = document.getElementById("lista-sugerencias"); // replica esta linea con busqueda
const resultado = document.getElementById("resultado");
const palabra = document.getElementById("palabra");
const palabra_no_encontrada = document.getElementById("palabra-no-encontrada");
palabra_no_encontrada.style.display="none";
const pronunciacion = document.getElementById("pronunciacion")
const ejemplo = document.getElementById("ejemplo");
const ejemplo_palabra = document.getElementById("ejemplo-palabra");
const buscar = document.getElementById("buscar");

const palabras_sugeridas= document.getElementById("palabras-sugeridas");
const resultado_palabras  = document.getElementById("resultado-palabras");
palabras_sugeridas.style.display="none"; 
ejemplo.style.display="none"; 




busqueda.addEventListener("input", async () => {
    const inputText = busqueda.value.toLowerCase();
    listasugerencias.innerHTML = ""; // Limpia las sugerencias previas

    if (inputText === "") {
        listasugerencias.style.display = "none"; // Oculta la lista si está vacía
        return;
    }

    const data = await fetch("words.json")


    const words = await data.json()


    const filteredWords = words.words.filter(word => word.startsWith(inputText));

    if (filteredWords.length === 0) {
        listasugerencias.style.display = "none"; // Oculta la lista si no hay coincidencias
        return;
    }

    filteredWords.forEach(word => {
        const li = document.createElement("li");
        li.textContent = word;
        li.addEventListener("click", () => {
            busqueda.value = word; // Rellena el input con la palabra seleccionada
            listasugerencias.innerHTML = ""; // Borra las sugerencias
            listasugerencias.style.display = "none";
        });
        listasugerencias.appendChild(li);
    });

    listasugerencias.style.display = "block"; // Muestra las sugerencias si hay coincidencias
});

const hacerBusqueda = async () => {
    listasugerencias.style.display = "none"; 
    const word = busqueda.value.trim().toLowerCase();
    palabra.innerHTML = word;
    resultado.innerHTML = ""; 
    pronunciacion.innerHTML = "";
    ejemplo_palabra.innerHTML = "";
    
    if (word === "") return;

    let wordToSearch = word; // Por defecto, buscamos la palabra ingresada
    let traduccionNecesaria = false;

    // 1️⃣ Si el usuario escribe en español, la traducimos al inglés antes de buscar en Wordnik
    let translateUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=es|en`;
    
    try {
        let translateResponse = await fetch(translateUrl);
        let translateData = await translateResponse.json();
        wordToSearch = translateData.responseData.translatedText; // Usamos la traducción para buscar en inglés
        traduccionNecesaria = true; // Necesitamos traducir de vuelta las definiciones
    } catch (error) {
        console.error("Error al traducir la palabra:", error);
    }

    // 2️⃣ Ahora hacemos la búsqueda en Wordnik con la palabra traducida
    const apiUrl = `https://api.wordnik.com/v4/word.json/${wordToSearch}/definitions?limit=5&includeRelated=false&useCanonical=false&includeTags=false&api_key=jpgdtuj97tr6opncyxqffeg9trsj3thxxwu0jocedxzp6931b`;
    
    try {
        let response = await fetch(apiUrl);
        let definitions = await response.json();

        if (!definitions.length) {
            palabra_no_encontrada.style.display = "block";
            return;
        }

        palabra_no_encontrada.style.display = "none";

        // 3️⃣ Traducir cada definición si es necesario
        for (let def of definitions) {
            let textoDefinicion = def.text;

            if (traduccionNecesaria) {
                let translateDefUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textoDefinicion)}&langpair=en|es`;
                try {
                    let translateDefResponse = await fetch(translateDefUrl);
                    let translateDefData = await translateDefResponse.json();
                    textoDefinicion = translateDefData.responseData.translatedText;
                } catch (error) {
                    console.error("Error al traducir la definición:", error);
                }
            }

            let li = document.createElement("li");
            li.textContent = textoDefinicion;
            resultado.appendChild(li);
        }

        // 4️⃣ Obtener y traducir un ejemplo de la palabra
        const exampleUrl = `https://api.wordnik.com/v4/word.json/${wordToSearch}/topExample?useCanonical=false&api_key=jpgdtuj97tr6opncyxqffeg9trsj3thxxwu0jocedxzp6931b`;
        let exampleResponse = await fetch(exampleUrl);
        let exampleData = await exampleResponse.json();

        if (exampleData.text) {
            let textoEjemplo = exampleData.text;

            if (traduccionNecesaria) {
                let translateExampleUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textoEjemplo)}&langpair=en|es`;
                try {
                    let translateExampleResponse = await fetch(translateExampleUrl);
                    let translateExampleData = await translateExampleResponse.json();
                    textoEjemplo = translateExampleData.responseData.translatedText;
                } catch (error) {
                    console.error("Error al traducir el ejemplo:", error);
                }
            }

            ejemplo_palabra.innerHTML = textoEjemplo;
            ejemplo.style.display = "block";
        } else {
            ejemplo.style.display = "none";
        }

    } catch (error) {
        console.error("Error al obtener la palabra:", error);
    }
};

// 🔹 Modificar el evento de búsqueda para llamar a la nueva función
buscar.addEventListener("click", async () => {
    await hacerBusqueda();
});

busqueda.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
        await hacerBusqueda();
    }
});



document.addEventListener("DOMContentLoaded", function() {
    // Palabras y definiciones de ejemplo
    const palabrasEjemplo = [
        { palabra: "Innovación", definicion: "Proceso de introducir algo nuevo o mejorado." },
        { palabra: "Creatividad", definicion: "Capacidad de generar ideas originales y valiosas." },
        { palabra: "Éxito", definicion: "Resultado positivo de una acción o proyecto." },
        { palabra: "Aprendizaje", definicion: "Proceso de adquirir conocimientos o habilidades." },
        { palabra: "Resiliencia", definicion: "Capacidad de adaptarse y superar situaciones adversas." },
        { palabra: "Colaboración", definicion: "Trabajo conjunto para lograr un objetivo común." },
        { palabra: "Liderazgo", definicion: "Habilidad de guiar e influenciar a un grupo de personas." }
    ];

    // Seleccionar una palabra del día aleatoria
    let seleccion = palabrasEjemplo[Math.floor(Math.random() * palabrasEjemplo.length)];
    document.getElementById("palabra-dia-texto").textContent = seleccion.palabra;
    document.getElementById("palabra-dia-definicion").textContent = seleccion.definicion;

    // Juego de adivinanza
    document.getElementById("btn-juego").addEventListener("click", function() {
        document.getElementById("juego-adivinanza").style.display = "block";
        let palabrasJuego = {
            "Computadora": "Dispositivo electrónico para procesar información",
            "Libro": "Objeto que contiene muchas páginas con información escrita",
            "Teléfono": "Dispositivo utilizado para la comunicación a distancia",
            "Internet": "Red global de comunicación que conecta computadoras en todo el mundo",
            "Código": "Conjunto de instrucciones que una computadora puede interpretar y ejecutar",
            "Algoritmo": "Secuencia de pasos organizados para resolver un problema o tarea",
            "Programación": "Proceso de crear software mediante la escritura de código"
        };

        let palabraSeleccionada = Object.keys(palabrasJuego)[Math.floor(Math.random() * Object.keys(palabrasJuego).length)];
        document.getElementById("pista-adivinanza").textContent = palabrasJuego[palabraSeleccionada];

        document.getElementById("btn-verificar").onclick = function() {
            let respuesta = document.getElementById("respuesta-adivinanza").value;
            if (respuesta.toLowerCase() === palabraSeleccionada.toLowerCase()) {
                document.getElementById("resultado-adivinanza").textContent = "✅ ¡Correcto!";
            } else {
                document.getElementById("resultado-adivinanza").textContent = "❌ Intenta de nuevo.";
            }
        };
    });
});


//boton de traduccion//
document.getElementById("translate-btn").addEventListener("click", async () => {
    let elementosATraducir = document.querySelectorAll("#palabra, #resultado li, #ejemplo-palabra");
    let boton = document.getElementById("translate-btn");

    // Detectar el idioma actual basado en el botón
    let traducirAEspañol = boton.innerText.includes("Español");
    let langPair = traducirAEspañol ? "en|es" : "es|en"; // Alternar idiomas
    let nuevoTextoBoton = traducirAEspañol ? "Traducir a Inglés" : "Traducir a Español";

    elementosATraducir.forEach(async (elemento) => {
        let textoOriginal = elemento.innerText;

        if (textoOriginal.trim() !== "") {
            let url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textoOriginal)}&langpair=${langPair}`;
            
            try {
                let respuesta = await fetch(url);
                let datos = await respuesta.json();
                elemento.innerText = datos.responseData.translatedText;
            } catch (error) {
                console.error("Error al traducir:", error);
            }
        }
    });

    // Cambiar el texto del botón
    boton.innerText = nuevoTextoBoton;
});






// Verifica si localStorage está disponible antes de guardar
function guardarEstado() {
    try {
        localStorage.setItem("palabraBuscada", document.getElementById("palabra-dia-texto").textContent);
        localStorage.setItem("definicionPalabra", document.getElementById("palabra-dia-definicion").textContent);
        localStorage.setItem("estadoJuego", document.getElementById("juego-adivinanza").style.display);
        localStorage.setItem("pistaJuego", document.getElementById("pista-adivinanza").textContent);
        localStorage.setItem("respuestaUsuario", document.getElementById("respuesta-adivinanza").value);
    } catch (e) {
        console.error("Error al guardar en localStorage:", e);
    }
}

// Verifica si los datos existen antes de cargarlos
function recuperarEstado() {
    try {
        let palabra = localStorage.getItem("palabraBuscada");
        let definicion = localStorage.getItem("definicionPalabra");
        if (palabra && definicion) {
            document.getElementById("palabra-dia-texto").textContent = palabra;
            document.getElementById("palabra-dia-definicion").textContent = definicion;
        }

        let estadoJuego = localStorage.getItem("estadoJuego");
        if (estadoJuego) {
            document.getElementById("juego-adivinanza").style.display = estadoJuego;
        }

        let pistaJuego = localStorage.getItem("pistaJuego");
        if (pistaJuego) {
            document.getElementById("pista-adivinanza").textContent = pistaJuego;
        }

        let respuesta = localStorage.getItem("respuestaUsuario");
        if (respuesta) {
            document.getElementById("respuesta-adivinanza").value = respuesta;
        }
    } catch (e) {
        console.error("Error al recuperar de localStorage:", e);
    }
}


