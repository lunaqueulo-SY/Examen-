// 1. VARIABLES PROPIAS Y DE CONTROL 

let estado = 1;             // Controla las 3 escenas lógicas del examen (1: Inicio/Orden, 2: Interactivo, 3: Fin/Caos)
let cantidadElementos = 10; // Controla las filas y columnas de la malla (Genera una matriz de 10x10 = 100 elementos)
let grosorLinea;            // Variable para cambiar dinámicamente el grosor del trazo (strokeWeight) según el mouse
let colorFondo = 0;         // Alterna el fondo de la pantalla (0: Negro absoluto, 245: Blanco casi perfecto)
let oscilador;              // Objeto de sonido tipo p5.Oscillator
let botonInicio;            // Almacena el elemento de interfaz (DOM) del botón que inicia la experiencia

function setup() {
  createCanvas(600, 600);   // Define el lienzo de dibujo de 600x600 píxeles
  rectMode(CENTER);         // Cambia el punto de anclaje de los rectángulos: las coordenadas X e Y ahora serán su centro
  noFill();                 // Desactiva el relleno por defecto para que las figuras sean transparentes

  //  CONFIGURACIÓN DEL RECURSO MULTIMEDIA DE AUDIO 
  oscilador = new p5.Oscillator('sine');
  oscilador.amp(0);         // Inicializa el volumen/amplitud del oscilador en cero absoluto para que parta en silencio

  //  INTERFAZ DE USUARIO (DOM) 
  botonInicio = createButton('ACTIVAR ILUSIÓN CINÉTICA'); // Crea el botón con texto en pantalla
  botonInicio.position(width / 2 - 95, height / 2 + 50); // Posiciona el botón centrado horizontalmente debajo del título
  botonInicio.mousePressed(iniciarExperiencia);           // Vincula el evento de clic en el botón con la función de transición
}

function draw() {
  background(colorFondo);   // Redibuja el fondo en cada fotograma para limpiar el lienzo

  //  EVALUACIÓN DE LA MÁQUINA DE ESTADOS 
  // Dependiendo del valor de la variable 'estado', el programa renderiza una escena completamente diferente
  if (estado === 1) {
    dibujarEstado1();       // Renderiza la pantalla de bienvenida estática
  } else if (estado === 2) {
    dibujarEstado2();       // Renderiza la experiencia cinética interactiva y sonora
  } else if (estado === 3) {
    dibujarEstado3();       // Renderiza la pantalla final de pausa o congelamiento
  }
}

// ESTADO 1: ORDEN ABSOLUTO (PANTALLA DE INICIO) 

function dibujarEstado1() {
  background(0);            // Asegura un fondo negro estático para la introducción
  stroke(100);              // Configura un color de línea gris medio para la malla de fondo
  strokeWeight(1);          // Trazo fino para no saturar la visual inicial
  
  // Calcula el tamaño de cada celda de la malla dividiendo el ancho total por la cantidad de elementos (600/10 = 60px)
  let tamañoCelda = width / cantidadElementos;
  
  //  BUCLES ANIDADOS PARA LA MALLA ESTÁTICA 
  for (let i = 0; i < cantidadElementos; i++) {       // Recorre las columnas de izquierda a derecha (0 a 9)
    for (let j = 0; j < cantidadElementos; j++) {     // Recorre las filas de arriba a abajo (0 a 9)
      // Calcula el centro exacto (X, Y) de cada celda aplicando el desplazamiento (offset) de media celda
      let x = i * tamañoCelda + tamañoCelda / 2;
      let y = j * tamañoCelda + tamañoCelda / 2;
      // Dibuja una elipse concéntrica perfecta en cada celda, escalada al 75% del tamaño total del espacio
      ellipse(x, y, tamañoCelda * 0.75, tamañoCelda * 0.75);
    }
  }
  
  // BLOQUE TEXTO DE BIENVENIDA 
  rectMode(CENTER);
  fill(0, 220);             // Rectángulo negro semi-transparente (canal alfa 220) para crear un fondo que aísle el texto
  noStroke();               // Quita el borde al rectángulo contenedor del texto
  rect(width / 2, height / 2 - 40, 420, 120); // Dibuja la caja del título en el centro
  
  // Renderizado del título principal
  fill(255);                // Texto blanco puro
  textAlign(CENTER, CENTER);// Alinea el texto tanto horizontal como verticalmente en sus coordenadas
  textSize(24);             // Tamaño de fuente grande para jerarquía visual
  text("ILUSIÓN CINÉTICA INTERACTIVA", width / 2, height / 2 - 60);
  
  // Subtítulo
  textSize(14);             // Tamaño de fuente menor
  fill(180);                // Color gris claro
  text("Estudio sistémico de Op Art", width / 2, height / 2 - 25);
}

// --- ESTADO 2: EXPERIENCIA INTERACTIVA CON SONIDO ---

function dibujarEstado2() {
  // MAPEO DINÁMICO: Transforma la posición X del mouse (0 a 600) en un grosor de línea útil (de 1.5 a 4 píxeles)
  grosorLinea = map(mouseX, 0, width, 1.5, 4);
  strokeWeight(grosorLinea); // Aplica el grosor calculado globalmente a este fotograma

  // CONTROL DE COLOR INTELIGENTE PARA EL CONTRASTE 
  if (mouseX > width / 2) {
    stroke(255, 60, 60);    // Si el cursor cruza a la mitad derecha, las líneas cambian a rojo coral
  } else {
    // Si está en la mitad izquierda, evalúa el color de fondo actual para mantener legibilidad (contraste invertido)
    if (colorFondo === 0) stroke(255); // Si el fondo es negro, pinta líneas blancas
    else stroke(0);                    // Si el fondo es blanco, pinta líneas negras
  }

  let tamañoCelda = width / cantidadElementos; // Vuelve a calcular el paso de la malla (60px)
  let alguienCercaDelMouse = false;            // Bandera (flag) booleana para saber si hay figuras sufriendo la deformación
  let menorDistancia = 999;                    // Centinela con valor muy alto para capturar el elemento más cercano al cursor

  //  MATRIZ DE ELEMENTOS DINÁMICOS (BUCLES ANIDADOS) 
  for (let i = 0; i < cantidadElementos; i++) {
    for (let j = 0; j < cantidadElementos; j++) {
      
      // Obtiene la coordenada base/reposo del elemento en la malla
      let x = i * tamañoCelda + tamañoCelda / 2;
      let y = j * tamañoCelda + tamañoCelda / 2;

      // GEOMETRÍA ANALÍTICA: Calcula la distancia euclidiana entre el mouse y el centro de la figura actual
      let distanciaMouse = dist(mouseX, mouseY, x, y);

      // Evalúa si el puntero se encuentra dentro de un radio de acción e influencia de 70 píxeles
      if (distanciaMouse < 70) {
        alguienCercaDelMouse = true; // Activa la bandera: hay un elemento alterado en este cuadro
        if (distanciaMouse < menorDistancia) {
          menorDistancia = distanciaMouse; // Actualiza el registro con la distancia más corta encontrada hasta ahora
        }
      }

      // Invoca a la función especializada enviando las coordenadas, distancias e índices de posición
      dibujarElementoOpArtAvanzado(x, y, tamañoCelda, distanciaMouse, i, j);
    }
  }
  
  //  LÓGICA DEL RECURSO MULTIMEDIA (INTEGRACIÓN TOTAL Y SÍNTESIS) 
  if (alguienCercaDelMouse) {
    // MAPEO DE FRECUENCIA: Si está más cerca (distancia -> 0) sube a 440Hz (La). Si se aleja (distancia -> 70) baja a 220Hz (La bajo)
    let frecuencia = map(menorDistancia, 0, 70, 440, 220);
    oscilador.freq(frecuencia); // Inyecta la frecuencia calculada en tiempo real al oscilador
    
    // VOLUMEN SEGURO Y SUAVE: Traduce la cercanía en intensidad. Cerca = 0.05 (5% volumen), Lejos = 0.01 (1% volumen)
    // El segundo parámetro (0.1) genera una rampa de desvanecimiento en segundos para evitar chasquidos de audio (clicks analógicos)
    let volumenSuave = map(menorDistancia, 0, 70, 0.05, 0.01);
    oscilador.amp(volumenSuave, 0.1); 
  } else {
    oscilador.amp(0, 0.1);  // Si el mouse no altera a ninguna figura, el audio decae suavemente a cero
  }
  
  //  INSTRUCCIONES EN PANTALLA 
  noStroke();
  // El texto cambia de color dinámicamente según el fondo para no quedar invisible (operador ternario)
  fill(colorFondo === 0 ? 200 : 50); 
  textSize(12);
  textAlign(CENTER, CENTER);
  text("Haz CLICK para alternar fondo. Presiona ESPACIO para pausar la obra.", width / 2, height - 30);
}


// --- ESTADO 3: CAOS CONGELADO / EQUILIBRIO ABSOLUTO ---

function dibujarEstado3() {
  background(20, 0, 0);      // Cambia el fondo a un tono rojo oscuro/mutilado que evoca alerta o congelamiento
  
  // PROTECCIÓN Y DESCONEXIÓN MULTIMEDIA 
  // Al ingresar a este estado de equilibrio estático se anula inmediatamente el audio para evitar persistencias sonoras
  oscilador.amp(0, 0.2);     // Baja el volumen a 0 en 0.2 segundos
  oscilador.stop();          // Apaga por completo el motor del oscilador

  stroke(255, 50, 50);       // Líneas rojas intensas y puras
  strokeWeight(2);           // Grosor constante, rompiendo la interactividad del ratón
  let tamañoCelda = width / cantidadElementos;
  
  //  RECONSTRUCCIÓN DE LA MALLA EN RECTÁNGULOS ROTADOS
  for (let i = 0; i < cantidadElementos; i++) {
    for (let j = 0; j < cantidadElementos; j++) {
      let x = i * tamañoCelda + tamañoCelda / 2;
      let y = j * tamañoCelda + tamañoCelda / 2;
      
      rectMode(CENTER);
      push();                // Aísla el sistema de coordenadas
      translate(x, y);       // Desplaza el origen (0,0) local al centro de la celda actual
      rotate(QUARTER_PI);    // Aplica rotación constante de 45 grados (PI / 4 radianes) convirtiendo cuadrados en rombos
      rect(0, 0, tamañoCelda * 0.5, tamañoCelda * 0.5); // Dibuja el rombo al 50% de tamaño de celda
      pop();                 // Restaura las coordenadas globales de p5
    }
  }

  // CARTEL EXPLICATIVO FINAL 
  fill(0, 240);              // Fondo negro sólido con mínima transparencia
  noStroke();
  rect(width / 2, height / 2, 450, 140);
  
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(26);
  text("SISTEMA VISUAL EN EQUILIBRIO", width / 2, height / 2 - 30);
  
  textSize(14);
  fill(200, 50, 50);
  text("La ilusión óptica y sonora ha finalizado.", width / 2, height / 2 + 10);
  
  fill(150);
  text("Presiona 'R' para restablecer el sistema.", width / 2, height / 2 + 40);
}


// FUNCIÓN PROPIA REUTILIZABLE (MÓDULO DE DIBUJO AVANZADO)

// Encargada de renderizar cada celda del Op Art aplicando trigonometría y perturbación por proximidad
function dibujarElementoOpArtAvanzado(posX, posY, tam, distMouse, i, j) {
  push(); // Crea un contexto matriz propio para que las transformaciones (sin, cos, rotate) no afecten a los demás elementos
  
  // ALGORITMO CINÉTICO (ONDAS MATEMÁTICAS TRIDIMENSIONALES) 
  // Se usa 'frameCount' (tiempo/cuadros transcurridos) + los índices (i, j) para generar un desfase. 
  // Esto simula matemáticamente una ola o "patrón moiré" fluido que recorre el plano de forma armónica.
  let olaX = sin(frameCount * 0.04 + i * 0.5) * 4; // Desplazamiento sutil oscilatorio horizontal (-4 a 4 px)
  let olaY = cos(frameCount * 0.04 + j * 0.5) * 4; // Desplazamiento sutil oscilatorio vertical (-4 a 4 px)
  
  translate(posX + olaX, posY + olaY); // Mueve el centro local sumando la oscilación calculada de la ola
  noFill();

  // SUB-ESTADO A: ELEMENTO BAJO ACCIÓN O INFLUENCIA DEL MOUSE
  if (distMouse < 70) {
    // Ruido visual/vibración: Genera un temblor aleatorio de estrés óptico cuando el cursor acecha la figura
    let vibracionX = random(-2, 2);
    let vibracionY = random(-2, 2);
    translate(vibracionX, vibracionY); // Aplica este sismo localizado
    
    // TRIGONOMETRÍA ARCTANGENTE: Calcula el ángulo exacto entre el centro de la figura y la posición del mouse
    let anguloMouse = atan2(mouseY - posY, mouseX - posX);
    rotate(anguloMouse + frameCount * 0.02); // Rota apuntando al mouse con una aceleración temporal añadida
    
    // DEFORMACIÓN PROPORCIONAL: Modifica el ancho y el alto inversamente usando map(). 
    // Genera un estiramiento elíptico/rectangular reactivo a la proximidad
    let nuevoAncho = map(distMouse, 0, 70, tam * 0.2, tam * 0.9);
    let nuevoAlto = map(distMouse, 0, 70, tam * 0.9, tam * 0.4);
    
    rect(0, 0, nuevoAncho, nuevoAlto); // Dibuja la estructura geométrica deformada (rectángulo mutante)
    
  } else {
    // SUB-ESTADO B: ELEMENTO EN ESTADO REPOSO/NATURAL 
    // Si el mouse está lejos, la figura respira autónomamente mediante pulsaciones sinusoidales continuas
    let pulsacion = sin(frameCount * 0.05 + (i + j)) * (tam * 0.1);
    ellipse(0, 0, (tam * 0.65) + pulsacion, (tam * 0.65) + pulsacion); // Dibuja círculos concéntricos vivos
  }
  
  pop(); // Destruye el contexto local y devuelve la matriz al origen global
}

// EVENTOS DE TRANSICIÓN LÓGICA Y MANEJO DE PERIFÉRICOS

// Se ejecuta al dar click en el botón HTML generado en setup
function iniciarExperiencia() {
  if (estado === 1) {
    estado = 2;             // Cambia el estado para liberar el renderizador interactivo en draw()
    botonInicio.hide();     // Oculta el botón de la pantalla para limpiar el espacio visual
    oscilador.start();      // Enciende físicamente las oscilaciones de audio del hardware de sonido
  }
}

// Se ejecuta automáticamente cada vez que el usuario presiona cualquier botón del mouse
function mousePressed() {
  if (estado === 2) {
    // Alternancia binaria de color: Si es negro pasa a blanco, si es blanco pasa a negro (Inversión cromática Op Art)
    if (colorFondo === 0) colorFondo = 245; 
    else colorFondo = 0;   
  }
}

// Se ejecuta automáticamente cada vez que el usuario presiona una tecla del teclado físico
function keyPressed() {
  // Tecla 32 equivale a la barra espaciadora. Solo funciona mientras estamos jugando en el Estado 2.
  if (keyCode === 32 && estado === 2) {
    estado = 3; // Fuerza el congelamiento del sistema visual saltando al estado 3
  }
  
  // Captura la tecla 'R' o 'r' de reseteo. Solo opera si ya colapsó el sistema en el Estado 3.
  if ((key === 'r' || key === 'R') && estado === 3) {
    estado = 1;                  // Devuelve la máquina lógica al inicio
    window.location.reload();    // Recarga la pestaña del navegador para limpiar completamente la caché y los buffers de audio
  }
}
