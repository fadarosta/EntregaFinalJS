console.dir(document);
console.dir(document.body);

const DateTime = luxon.DateTime;
const now = DateTime.now()

function obtenerPrimerDiaDelMes(anio, mes) {
    const fecha = DateTime.local(anio, mes, 7);
    return fecha.weekday;
}

function crearDiaHTML(diaInfo) {
    if (!diaInfo.habilitado) {
        return `
        <div class="dia__deshabilitado">
            <span class="dia__nro">${diaInfo.dia}</span>
            <p>No hay clases disponibles</p>
        </div>
        `;
    }

    return `
        <div class="dia">
        <span class="dia__nro">${diaInfo.dia}</span>
        <p>${diaInfo.claseNombre}</p>
        <p>Horario: ${diaInfo.hora}</p>
        <p>Cupos disponibles: <span class="lugares-disponibles">${diaInfo.cupoDisponible || 0}</span></p>
        <form class="registracion-form" onsubmit="unaInscripcion(event, ${diaInfo.dia})">
            <input type="text" class="form-control-inscripciones" placeholder="Tu nombre"/>
            <button type="submit" class="btn btn-primary btn-sm">Inscribirse</button>
        </form>
        </div>
    `;
}

const css = `
    .dia__deshabilitado {
        text-align: center;
    }
    .dia__deshabilitado p {
        color:#eaeaea;
        opacity: 50%;
    }
    `;
const style = document.createElement("style");
style.textContent = css;
document.head.appendChild(style);

function unaInscripcion(event) {
    event.preventDefault();

    const form = event.target;
    const nameInput = form.querySelector("input");
    const name = nameInput.value;

    if (!name.trim()) {
        Swal.fire({
            icon: "warning",
            title: "No ingresaste tu nombre. <br> Por favor ingresalo.",
            confirmButtonColor: "#D9695F",
        });
        return;
    }

    const claseContenedor = form.parentElement;
    const nombreClase = claseContenedor.querySelector("p").textContent;

    Swal.fire({
        icon: "success",
        title: "¡Gracias por inscribirte!",
        text: `${name.toUpperCase()}, te anotaste en la clase de ${nombreClase}.`,
        confirmButtonColor: "#D9695F",
    });

    const cupoDisponibleElement = claseContenedor.querySelector(".lugares-disponibles");
    let cupo = parseInt(cupoDisponibleElement.textContent, 10);
    if (cupo > 0) {
        cupo -= 1;
        cupoDisponibleElement.textContent = cupo;
    } else {
        Swal.fire({
            icon: "error",
            title: "Cupo lleno",
            text: "Mil disculpas, esta clase ya no tiene cupos disponibles.",
            confirmButtonColor: "#D9695F",
        });
    }
    form.reset();
}

function EventListener() {
    const formularios = document.querySelectorAll('.form.registracion');
    formularios.forEach(formulario => {
        formulario.addEventListener('submit', unaInscripcion);  // SUBMIT
    });

    const inputsNombre = document.querySelectorAll('.form-control-inscripciones');
    inputsNombre.forEach(input => {
        input.addEventListener('input', (event) => {
            const value = event.target.value;
            console.log(`Nombre ingresado: ${value}`);
        });
    });
}

function renderClasses(data) {
    const calendar = document.querySelector(".dias");
    const primerDia = obtenerPrimerDiaDelMes(2025, 1);
    for (let i = 0; i < primerDia; i++) {
        const emptyElement = document.createElement("li");
        emptyElement.classList.add("empty-day");
        calendar.appendChild(emptyElement);
    }
    data.forEach((classInfo) => {
        const diaHTML = crearDiaHTML(classInfo);
        const diaElement = document.createElement("li");
        diaElement.innerHTML = diaHTML;
        calendar.appendChild(diaElement);
    });
    EventListener();
}

function guardarClasesEnStorage(clases) {
    localStorage.setItem('clasesDisponibles', JSON.stringify(clases));
}

function obtenerClasesDeStorage() {
    const clasesStorage = localStorage.getItem('clasesDisponibles');
    return clasesStorage ? JSON.parse(clasesStorage) : [];
}

document.addEventListener("DOMContentLoaded", () => {
    const calendarContainer = document.querySelector(".dias");

    if (!localStorage.getItem('clasesDisponibles')) {
        fetch("clases.json")
            .then(response => response.json())
            .then(data => {
                guardarClasesEnStorage(data);
                iniciarRenderizado();
            })
            .catch(error => {
                console.error("Error al cargar clases.json:", error);
                iniciarRenderizado();
            });
    } else {
        iniciarRenderizado();
    }

    function iniciarRenderizado() {
        const spinner = document.createElement("div");
        spinner.classList.add("spinner");
        spinner.innerHTML = `
            <div class="spinner-border text-light" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
        `;
        calendarContainer.appendChild(spinner);

        setTimeout(() => {
            spinner.remove();
            const clases = obtenerClasesDeStorage();
            renderClasses(clases);
        }, 1500);
    }
});

function descargarJSON(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'clasesDisponibles.json';
    link.click();
}

