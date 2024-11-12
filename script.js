
class SnakeRace{
	constructor(){
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
		this.contenedor.style.width = `${this.lado * this.ancho}px`
		this.contenedor.style.height = `${this.lado * this.alto}px`
		document.getElementById('estado').style.width = `${this.lado * this.ancho}px`
		this.vel = 10	//Velocidad del juego (inverso)
		//Calculamos el tamaño de celda
		this.canvas.width = this.contenedor.getBoundingClientRect().width
		this.canvas.height = this.contenedor.getBoundingClientRect().height
		this.ladoX = this.canvas.width / this.ancho
		this.ladoY = this.canvas.height / this.alto 
		//Posición inicial de la cabeza
		this.cabeza = {
			//Posición de tablero a la que vamos
			x: parseInt(this.ancho / 2),	
			y: parseInt(this.alto / 2),
			dir: 1,	//0:arriba, 1:derecha, 2:abajo, 3:izquierda
			giro: 1,	//dirección del siguiente giro
			vel: 2,
			//Posición del canvas
			posX: null,
			posY: null,
			estela: []
		}
		this.cabeza.posX = this.cabeza.x * this.ladoX
		this.cabeza.posY = this.cabeza.y * this.ladoY
		//Objetos
		this.estrella = { x: null, y: null}
		this.rueda = { x: null, y: null}
		this.lata = { x: null, y: null}
		this.barreras = []
		//Estado del juego
		this.puntos = 0
		this.neumaticos = 100
		this.combustible = 100
		//Cargamos las imágenes
		this.imgCoche = new Image()
		this.imgCoche.src = './img/coche.png'
		this.imgEstrella = new Image()
		this.imgEstrella.src = './img/estrella.svg'
		this.imgRueda = new Image()
		this.imgRueda.src = './img/rueda.png'
		this.imgLata = new Image()
		this.imgLata.src = './img/lata.png'
		this.imgBarrera = new Image()
		this.imgBarrera.src = './img/barrera.png'
		this.imgFondo = new Image()
		this.imgFondo.src = './img/logo_v_str.png'
		this.imgEstela = new Image()
		this.imgEstela.src = './img/estela.png'
		this.imgAbandono = new Image()
		this.imgAbandono.src = './img/abandono1.jpeg'
		this.imgChoque1 = new Image()
		this.imgChoque1.src = './img/choque1.jpeg'
		this.imgChoque2 = new Image()
		this.imgChoque2.src = './img/choque2.jpeg'

		this.presentar()
	}
	presentar = () => {
		//Mostramos los controles y esperamos a que pulsen el primero
		this.iniciar()
	}
	iniciar = () => {
		this.crear(this.estrella)
		this.crear(this.rueda)
		this.crear(this.lata)
		document.addEventListener('keydown', this.teclaPulsada)
		this.interval = setInterval(this.actualizar, this.vel) 
		this.bucle()
	}
	teclaPulsada = (evento) => {
		const key = event.key.toLowerCase()
		const keys = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright']

		if(!keys.includes(key)) return

		if (key === keys[0] && this.cabeza.dir !== 2)
			this.cabeza.giro = 0
		else if (key === keys[1] && this.cabeza.dir !== 0)
			this.cabeza.giro = 2
		else if (key === keys[2] && this.cabeza.dir !== 1)
			this.cabeza.giro = 3
		else if (key === keys[3] && this.cabeza.dir !== 3)
			this.cabeza.giro = 1
		
		evento.preventDefault()
	}
	actualizar = () => {
		//Comprobar colisiones
		//	Cálculo de posición actual
		const x = Math.round(this.cabeza.posX / this.ladoX)
		const y = Math.round(this.cabeza.posY / this.ladoY)
		// colisión con estrella
		if (x === this.estrella.x && y === this.estrella.y){
			this.cabeza.estela.push([x,y,this.cabeza.dir])
			this.puntuar()
		}
		// colisión con barreras
		this.barreras.forEach( barrera => {
			if (x === barrera.x && y === barrera.y)
				this.finalizar(1)
		})
		// colisión con bordes
		if (x < 0 || y < 0 || x >= this.ancho || y >= this.alto)
			this.finalizar(0)
		// colisión con rueda
		if (x === this.rueda.x && y === this.rueda.y){
			this.neumaticos = 100
			this.crear(this.rueda)
		}
		// colisión con lata
		if (x === this.lata.x && y === this.lata.y){
			this.combustible = 100
			this.crear(this.lata)
		}

		//Comprobar estado
		this.neumaticos -= this.vel/1000 * 3
		this.combustible -= this.vel/1000 * 2
		if (this.neumaticos < 0 || this.combustible < 0)
			this.finalizar(2)

		this.divNeumaticos.style.marginRight = `${100 - Math.round(this.neumaticos)}%`
		this.divCombustible.style.marginRight = `${100 - Math.round(this.combustible)}%`

		let hemosLlegado = false
		if (this.cabeza.dir === 0){
			this.cabeza.posY -= this.cabeza.vel
			hemosLlegado = this.cabeza.posY < this.cabeza.y * this.ladoY
			if(hemosLlegado) this.cabeza.y--
		}
		else if (this.cabeza.dir === 1){
			this.cabeza.posX += this.cabeza.vel
			hemosLlegado = this.cabeza.posX > this.cabeza.x * this.ladoX
			if(hemosLlegado) this.cabeza.x++
		}
		else if (this.cabeza.dir === 2){
			this.cabeza.posY += this.cabeza.vel
			hemosLlegado = this.cabeza.posY > this.cabeza.y * this.ladoY
			if(hemosLlegado) this.cabeza.y++
		}
		else if (this.cabeza.dir === 3){
			this.cabeza.posX -= this.cabeza.vel
			hemosLlegado = this.cabeza.posX < this.cabeza.x * this.ladoX
			if(hemosLlegado) this.cabeza.x--
		}

		if(hemosLlegado) {
			this.cabeza.estela.push([x,y]) //Añadimos el cuadro a la estela
			this.cabeza.estela.shift() //Quitamos el primer elemento
			if (this.cabeza.giro !== null){ //Si estamos girando
				this.cabeza.dir = this.cabeza.giro
				this.cabeza.giro = null
			}
		}
	}
	bucle = () => {
		this.dibujar()	
		this.animationFrameId = requestAnimationFrame(this.bucle)
	}
	dibujar = () => {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		//Dibujamos el fondo
		this.ctx.drawImage(this.imgFondo, this.canvas.width / 2 - 200, this.canvas.height / 2 - 200 * 1885/1850, 400, 400 * 1885/1850)

		//Dibujamos los objetos
		this.ctx.drawImage(this.imgEstrella, this.estrella.x * this.ladoX, this.estrella.y * this.ladoY, this.ladoX, this.ladoY)
		this.barreras.forEach( barrera => {
			this.ctx.drawImage(this.imgBarrera, barrera.x * this.ladoX, barrera.y * this.ladoY, this.ladoX, this.ladoY)
		})
		this.ctx.drawImage(this.imgRueda, this.rueda.x * this.ladoX, this.rueda.y * this.ladoY, this.ladoX, this.ladoY)
		this.ctx.drawImage(this.imgLata, this.lata.x * this.ladoX, this.lata.y * this.ladoY, this.ladoX, this.ladoY)


		this.cabeza.estela.forEach( estela => {
			this.ctx.drawImage(this.imgEstrella, estela[0] * this.ladoX, estela[1] * this.ladoY, this.ladoX * 0.8, this.ladoY * 0.8)
		})

		//Giro
		const centroGiro = [this.cabeza.posX + this.ladoX / 2, this.cabeza.posY + this.ladoY / 2]
		this.ctx.translate(centroGiro[0], centroGiro[1])
		const anguloGiro = (this.cabeza.dir - 1) * 90
		this.ctx.rotate((anguloGiro * Math.PI) / 180);
		this.ctx.drawImage(this.imgCoche, -this.ladoX / 2, -this.ladoY / 2, this.ladoX, this.ladoY)

		//Reset transformation matrix to the identity matrix
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);

	}
	crear = (objeto) => {
		let x, y, flagOcupado = false
		do{
			x = parseInt(Math.random() * this.ancho)
			y = parseInt(Math.random() * this.alto)
			//Comprobamos si la posición está libre
			flagOcupado = (x === this.cabeza.x && y === this.cabeza.y)
			this.barreras.forEach( barrera => {
				flagOcupado ||= (x === barrera.x && y === barrera.y)
			})
		}while (flagOcupado)
		objeto.x = x
		objeto.y = y
	}
	puntuar = () =>{
		this.spanPuntos.textContent = `${++this.puntos} `
		this.crear(this.estrella)
		const barrera = {x: null, y:null}
		this.barreras.push(barrera)
		this.crear(barrera)
	}
	finalizar = (tipo = 1) => {
		console.log('FIN ' + tipo)
		cancelAnimationFrame(this.animationFrameId)
		document.removeEventListener('keydown', this.teclaPulsada)
		clearInterval(this.interval)
		
		const img = document.getElementById('imgFinal')
		const divTexto = this.divDialogo.querySelectorAll('div')[2]

		switch(tipo){
			case 0: //Colisión con bordes
				img.src = this.imgChoque1.src
			case 1: //Colisión con barrera
				img.src = this.imgChoque2.src
				divTexto.textContent = 'Pilotar es ir siempre al límite. Lo difícil es saber dónde están tus límites, los de tu coche y los de la pista. Y luego, ampliárlos.'
				break;
			case 2:	//Abandono
				img.src = this.imgAbandono.src
				divTexto.textContent = 'La gestión de los neumáticos y del combustible es fundamental para ser un buen piloto. Pilotar no es solo girar y frenar; es sobre todo pensar'
				break;
		}
		this.divDialogo.style.display = 'block'
	}
}
window.onload = new SnakeRace()
