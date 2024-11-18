import { SnakeRaceVista } from './vista.js'

class SnakeRaceControlador {
	constructor() {
		this.view = new SnakeRaceVista(this)
		
		this.vel = 0.2 //Velocidad del juego (inverso)
		//Posición inicial de la cabeza
		this.cabeza = {
			//Posición de tablero a la que vamos
			x: parseInt(this.view.ancho / 2),
			y: parseInt(this.view.alto / 2),
			dir: 1, //0:arriba, 1:derecha, 2:abajo, 3:izquierda
			giro: 1, //dirección del siguiente giro
			vel: 0.2,
			//Posición del canvas
			posX: null,
			posY: null,
			estela: [],
		}
		//Objetos
		this.estrella = { x: null, y: null }
		this.rueda = { x: null, y: null }
		this.lata = { x: null, y: null }
		this.barreras = []
		//Estado del juego	
		this.puntos = 0
		this.neumaticos = 100
		this.combustible = 100
		//Inicializar vista
		this.view.iniciar()
		//Centrar coche
		this.cabeza.posX = this.cabeza.x * this.view.ladoX
		this.cabeza.posY = this.cabeza.y * this.view.ladoY
		
		// Inicializar SpeechRecognition
		this.reconocimiento = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
		this.reconocimiento.lang = 'es-ES'; // Configurar idioma
		this.reconocimiento.interimResults = false; // Solo resultados finales
		// Asociar el evento onresult a la función que maneja los comandos de voz
		this.reconocimiento.onresult = this.manejarResultado;
		// Agregar eventos de depuración
		//this.reconocimiento.onstart = () => console.log("Reconocimiento de voz iniciado.");
		this.reconocimiento.onend = () => this.iniciarReconocimiento();
		this.reconocimiento.onerror = (event) => console.error("Error en el reconocimiento de voz:", event.error);
	}

	iniciar = () => {
		this.crear(this.estrella)
		this.crear(this.rueda)
		this.crear(this.lata)
		document.addEventListener('keydown', this.teclaPulsada)
		this.interval = setInterval(this.actualizar, this.vel)
		this.bucle()
		console.log("Controlador Iniciado")
		// Solicitar permiso y comenzar reconocimiento de voz
		this.solicitarPermisoMicrofono();
	}

	crear = (objeto) => {
		let x, y, flagOcupado = false
		do {
			x = parseInt(Math.random() * this.view.ancho)
			y = parseInt(Math.random() * this.view.alto)
			flagOcupado = (x === this.cabeza.x && y === this.cabeza.y)
			this.barreras.forEach((barrera) => {
				flagOcupado ||= (x === barrera.x && y === barrera.y)
			})
		} while (flagOcupado)
		objeto.x = x
		objeto.y = y
	}

	bucle = () => {
		this.view.dibujar(this.cabeza, this.cabeza.estela, this.estrella, this.rueda, this.lata, this.barreras)
		this.animationFrameId = requestAnimationFrame(this.bucle)
	}

	// Método que escucha las teclas pulsadas y llama a ordenarMovimiento
	teclaPulsada = (evento) => {
		console.log("Tecla pulsada = ", evento.key);
		
		const key = evento.key.toLowerCase();
		const keys = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
		
		// Comprobamos que la tecla pulsada esté en las teclas válidas
		if (!keys.includes(key)) return;

		// Llamamos a ordenarMovimiento con la dirección correspondiente
		if (key === keys[0]) {
			this.ordenarMovimiento('arriba');
		} else if (key === keys[1]) {
			this.ordenarMovimiento('abajo');
		} else if (key === keys[2]) {
			this.ordenarMovimiento('izquierda');
		} else if (key === keys[3]) {
			this.ordenarMovimiento('derecha');
		}

		// Evitar la acción predeterminada del navegador
		evento.preventDefault();
	}

	// Método que recibe la dirección como string y ordena el movimiento
	ordenarMovimiento = (direccion) => {
		const direcciones = ['arriba', 'derecha', 'abajo', 'izquierda'];
		
		const index = direcciones.indexOf(direccion); // Encuentra el índice de la dirección, devuelve -1 si no está
		if (index === -1) return; // Si la dirección no es válida, salimos del método

		// Controlamos el giro basado en la dirección actual y la nueva dirección
		if (direccion === 'arriba' && this.cabeza.dir !== 2) {
			this.cabeza.giro = 0;
		} else if (direccion === 'abajo' && this.cabeza.dir !== 0) {
			this.cabeza.giro = 2;
		} else if (direccion === 'izquierda' && this.cabeza.dir !== 1) {
			this.cabeza.giro = 3;
		} else if (direccion === 'derecha' && this.cabeza.dir !== 3) {
			this.cabeza.giro = 1;
		}
	}

	actualizar = () => {
		//	Cálculo de posición actual
		const x = Math.round(this.cabeza.posX / this.view.ladoX)
		const y = Math.round(this.cabeza.posY / this.view.ladoY)
		//Comprobar colisiones
		// colisión con estrella
		if (x === this.estrella.x && y === this.estrella.y) {
			this.cabeza.estela.push([x, y, this.cabeza.dir])
			this.puntuar()
		}
		// colisión con barreras	
		this.barreras.forEach((barrera) => {
			if (x === barrera.x && y === barrera.y) this.finalizar(1)
		})
		// colisión con bordes
		if (x < 0 || y < 0 || x >= this.view.ancho || y >= this.view.alto) this.finalizar(0)
		// colisión con rueda	
		if (x === this.rueda.x && y === this.rueda.y) {
			this.neumaticos = 100
			this.crear(this.rueda)
		}
		// colisión con lata
		if (x === this.lata.x && y === this.lata.y) {
			this.combustible = 100
			this.crear(this.lata)
		}
		//Comprobar estado
		this.neumaticos -= this.vel / 1000 * 30
		this.combustible -= this.vel / 1000 * 20
		if (this.neumaticos < 0 || this.combustible < 0) this.finalizar(2)

		this.view.actualizarIndicadores(this.neumaticos, this.combustible)
		this.actualizarMovimientoCabeza()
	}

	actualizarMovimientoCabeza() {
		let hemosLlegado = false
		const x = Math.round(this.cabeza.posX / this.view.ladoX)
		const y = Math.round(this.cabeza.posY / this.view.ladoY)
	
		if (this.cabeza.dir === 0) { // Arriba
			this.cabeza.posY -= this.cabeza.vel
			hemosLlegado = this.cabeza.posY < this.cabeza.y * this.view.ladoY
			if (hemosLlegado) this.cabeza.y--
		} else if (this.cabeza.dir === 1) { // Derecha
			this.cabeza.posX += this.cabeza.vel
			hemosLlegado = this.cabeza.posX > this.cabeza.x * this.view.ladoX
			if (hemosLlegado) this.cabeza.x++
		} else if (this.cabeza.dir === 2) { // Abajo
			this.cabeza.posY += this.cabeza.vel
			hemosLlegado = this.cabeza.posY > this.cabeza.y * this.view.ladoY
			if (hemosLlegado) this.cabeza.y++
		} else if (this.cabeza.dir === 3) { // Izquierda
			this.cabeza.posX -= this.cabeza.vel
			hemosLlegado = this.cabeza.posX < this.cabeza.x * this.view.ladoX
			if (hemosLlegado) this.cabeza.x--
		}
	
		if (hemosLlegado) {
	 
			this.cabeza.estela.push([x, y])//Añadimos el cuadro a la estela
			this.cabeza.estela.shift()//Quitamos el primer elemento
	
			if (this.cabeza.giro !== null) {//Si estamos girando
				console.log("Girando!")
				this.cabeza.dir = this.cabeza.giro
				this.cabeza.giro = null
			}
		}
	}

	puntuar = () => {
		this.puntos++
		this.view.actualizarPuntos(this.puntos)
		this.crear(this.estrella)
		const barrera = { x: null, y: null }
		this.barreras.push(barrera)
		this.crear(barrera)
	}

	// Solicitar permiso para acceder al micrófono
	solicitarPermisoMicrofono() {
		navigator.mediaDevices.getUserMedia({ audio: true })
			.then(stream => {
			console.log("Acceso al micrófono permitido.");
		})
			.catch(error => {
			console.error("Acceso al micrófono denegado o no disponible:", error);
			alert("No se puede acceder al micrófono. Asegúrate de que está habilitado en tu navegador.");
		});
		// Iniciar el reconocimiento de voz
		this.iniciarReconocimiento();
	}

	// Iniciar el reconocimiento de voz
	iniciarReconocimiento() {
		if (this.reconocimiento === undefined) {
			alert("Tu navegador no soporta Speech Recognition. Por favor, prueba a utilizar Chrome.");
		} else {
			this.reconocimiento.start();
		}
	}

	// Función para manejar los resultados del reconocimiento de voz
	manejarResultado = (evento) => {
		const resultado = evento.results[evento.results.length - 1][0].transcript.trim().toLowerCase();
		console.log("Comando de voz detectado:", resultado);
		const comandos = ['arriba', 'derecha', 'abajo', 'izquierda']
		comandos.forEach( (comando) => {
			if (resultado.includes(comando)){
				this.ordenarMovimiento(comando);
			}
		})
		//Reiniciamos el reconocimiento una vez terminada la orden
	}

	leerMensaje = ( msj ) => {
    	const voz = new SpeechSynthesisUtterance(msj);

        // Opcional: Configurar el idioma
        voz.lang = 'es-ES'; // Cambia 'es-ES' a tu idioma preferido

        // Opcional: Configurar el volumen, velocidad y tono
        voz.volume = 1; // Rango de 0 a 1
        voz.rate = 1;   // Rango de 0.1 a 10
        voz.pitch = 1;  // Rango de 0 a 2

        // Reproducir el mensaje
        if("speechSynthesis" in window){
            window.speechSynthesis.speak(voz);
        }else console.log("EL navegador no soporta la síntesis de vod de web speech")
	}

	finalizar = (tipo) => {
		console.log('FIN ' + tipo)
		cancelAnimationFrame(this.animationFrameId)
		clearInterval(this.interval)
		document.removeEventListener('keydown', this.teclaPulsada)
		this.view.mostrarFinal(tipo)
	}
}

export default SnakeRaceControlador
window.onload = () => { new SnakeRaceControlador() }
