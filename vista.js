class SnakeRaceView {
	constructor(controller) {
		this.controller = controller
		this.contenedor = document.getElementById('fondo')
		this.canvas = document.getElementsByTagName('canvas')[0]
		this.ctx = this.canvas.getContext('2d')
		this.spanPuntos = document.querySelector('div#puntos > span')
		this.divNeumaticos = document.querySelector('div#neumaticos > div > div')
		this.divCombustible = document.querySelector('div#combustible > div > div')
		this.divDialogo = document.querySelector('div#dialogo')
		//Número de posiciones	
		this.ancho = 15
		this.alto = 10
		//Redimensionamiento del área de juego
		this.lado = 60
		this.ladoX = null
		this.ladoY = null
		this.contenedor.style.width = `${this.lado * this.ancho}px`
		this.contenedor.style.height = `${this.lado * this.alto}px`
		document.getElementById('estado').style.width = `${this.lado * this.ancho}px`

		this.imgCoche = new Image()
		this.imgEstrella = new Image()
		this.imgRueda = new Image()
		this.imgLata = new Image()
		this.imgBarrera = new Image()
		this.imgFondo = new Image()
		this.imgChoque1 = new Image()
		this.imgChoque2 = new Image()
		this.imgAbandono = new Image()

		this.cargarImagenes()
	}

	init() {
		//Calculamos el tamaño de celda
		this.canvas.width = this.contenedor.getBoundingClientRect().width
		this.canvas.height = this.contenedor.getBoundingClientRect().height
		this.ladoX = this.canvas.width / this.ancho
		this.ladoY = this.canvas.height / this.alto
		
		this.controller.iniciar()
		console.log("Vista iniciada")
	}

	cargarImagenes() {
		this.imgCoche.src = './img/coche.png'
		this.imgEstrella.src = './img/estrella.svg'
		this.imgRueda.src = './img/rueda.png'
		this.imgLata.src = './img/lata.png'
		this.imgBarrera.src = './img/barrera.png'
		this.imgFondo.src = './img/logo_v_str.png'
		this.imgChoque1.src = './img/choque1.jpeg'
		this.imgChoque2.src = './img/choque2.jpeg'
		this.imgAbandono.src = './img/abandono1.jpeg'
	}

	actualizarIndicadores(neumaticos, combustible) {
		this.divNeumaticos.style.marginRight = `${100 - neumaticos}%`
		this.divCombustible.style.marginRight = `${100 - combustible}%`
	}

	actualizarPuntos(puntos) {
		this.spanPuntos.textContent = `${puntos} `
	}

	dibujar(cabeza, estela, estrella, rueda, lata, barreras) {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

		// Dibujo del fondo
		this.ctx.drawImage(this.imgFondo, this.canvas.width / 2 - 200, this.canvas.height / 2 - 200 * 1885/1850, 400, 400 * 1885/1850)

		// Dibujo de la estela
		estela.forEach(([x, y]) => {
			this.ctx.drawImage(this.imgEstrella, x * this.ladoX, y * this.ladoY, this.ladoX * 0.8, this.ladoY * 0.8)
		})

		// Dibujo de la cabeza
		//Giro
		const centroGiro = [cabeza.posX + this.ladoX / 2, cabeza.posY + this.ladoY / 2]
		this.ctx.translate(centroGiro[0], centroGiro[1])
		const anguloGiro = (cabeza.dir - 1) * 90
		this.ctx.rotate((anguloGiro * Math.PI) / 180);
		this.ctx.drawImage(this.imgCoche, -this.ladoX / 2, -this.ladoY / 2, this.ladoX, this.ladoY)

		//Reset transformation matrix to the identity matrix
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);

		// Dibujo de la estrella
		this.ctx.drawImage(this.imgEstrella, estrella.x * this.ladoX, estrella.y * this.ladoY, this.ladoX, this.ladoY)

		// Dibujo de la rueda
		this.ctx.drawImage(this.imgRueda, rueda.x * this.ladoX, rueda.y * this.ladoY, this.ladoX, this.ladoY)

		// Dibujo de la lata
		this.ctx.drawImage(this.imgLata, lata.x * this.ladoX, lata.y * this.ladoY, this.ladoX, this.ladoY)

		// Dibujo de las barreras
		barreras.forEach((barrera) => {
			this.ctx.drawImage(this.imgBarrera, barrera.x * this.ladoX, barrera.y * this.ladoY, this.ladoX, this.ladoY)
		})
	}

	mostrarFinal(tipo) {
		const img = document.getElementById('imgFinal')
		const divTexto = this.divDialogo.querySelectorAll('div')[2]
		let msj = ''
		switch(tipo){
			case 0: //Colisión con bordes
				img.src = this.imgChoque1.src
			case 1: //Colisión con barrera
				img.src = this.imgChoque2.src
				msj = 'Pilotar es ir siempre al límite. Lo difícil es saber dónde están tus límites, los de tu coche y los de la pista. Y luego, ampliárlos.'
				break;
			case 2:	//Abandono
				img.src = this.imgAbandono.src
				msj = 'La gestión de los neumáticos y del combustible es fundamental para ser un buen piloto. Pilotar no es solo girar y frenar; es sobre todo pensar'
				break;
		}
		divTexto.textContent = msj
		this.controller.leerMensaje(msj)
		this.divDialogo.style.display = 'block'
	}
}

export { SnakeRaceView }
