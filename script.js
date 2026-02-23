const messages = [
  "Dime la idea de la app y la edad de los ninos.",
  "Tambien necesito saber si quieres juegos, cuentos o aprendizaje.",
  "Cuando me des eso, te construyo la pagina completa.",
];

const button = document.querySelector("#idea-btn");
const output = document.querySelector("#next-step");
let index = 0;

if (button && output) {
  button.addEventListener("click", () => {
    index = (index + 1) % messages.length;
    output.textContent = messages[index];
  });
}

