
// ammount to add on each buttons press
const confettiCounts = 20
const sequinCounts = 10

// "physics" variables
const gravityConfettis = 0.3
const gravitySequinss = 0.55
const dragConfettis = 0.075
const dragSequinss = 0.02
const terminalVelocitys = 3

// init other global elements
const buttons = document.getElementById('button-2')
var disabled = false
const canvass = document.getElementById('canvas-2')
const ctxs = canvass.getContext('2d')
canvass.width = window.innerWidth
canvass.height = window.innerHeight
let cxs = ctxs.canvas.width / 2
let cys = ctxs.canvas.height / 2
// add Confetto/Sequin objects to arrays to draw them
let confettis = []
let sequinss = []

// colors1, back side is darker for confetti1 flipping
const colorss = [
  { front : '#7b5cff', back: '#6245e0' }, // Purple
  { front : '#b3c7ff', back: '#8fa5e5' }, // Light Blue
  { front : '#5c86ff', back: '#345dd1' }  // Darker Blue
]

// helper function to pick a random number within a range
randomRange = (min, max) => Math.random() * (max - min) + min

// helper function to get initial velocities for confetti1
// this weighted spread helps the confetti11 look more realistic
initConfettoVelocitys = (xRange, yRange) => {
  const xs = randomRange(xRange[0], xRange[1])
  const ranges = yRange[1] - yRange[0] + 1
  let y = yRange[1] - Math.abs(randomRange(0, ranges) + randomRange(0, ranges) - ranges)
  if (y >= yRange[1] - 1) {
    // Occasional confetto goes higher than the max
    y += (Math.random() < .25) ? randomRange(1, 3) : 0
  }
  return {x: xs, y: -y}
}

// Confetto Class
function Confettos() {
  this.randomModifier = randomRange(0, 99)
  this.color = colorss[Math.floor(randomRange(0, colorss.length))]
  this.dimensions = {
    x: randomRange(5, 9),
    y: randomRange(8, 15),
  }
  this.position = {
    x: randomRange(canvass.width/2 - buttons.offsetWidth/4, canvass.width/2 + buttons.offsetWidth/4),
    y: randomRange(canvass.height/2 + buttons.offsetHeight/2 + 8, canvass.height/2 + (1.5 * buttons.offsetHeight) - 8),
  }
  this.rotation = randomRange(0, 2 * Math.PI)
  this.scale = {
    x: 1,
    y: 1,
  }
  this.velocity = initConfettoVelocitys([-9, 9], [6, 11])
}
Confettos.prototype.update = function() {
  // apply forces to velocity
  this.velocity.x -= this.velocity.x * dragConfettis
  this.velocity.y = Math.min(this.velocity.y + gravityConfettis, terminalVelocitys)
  this.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random()
  
  // set position
  this.position.x += this.velocity.x
  this.position.y += this.velocity.y

  // spin confetto by scaling y and set the color, .09 just slows cosine frequency1
  this.scale.y = Math.cos((this.position.y + this.randomModifier) * 0.09)    
}

// Sequin Class
function Sequins() {
  this.color = colorss[Math.floor(randomRange(0, colorss.length))].back,
  this.radius = randomRange(1, 2),
  this.position = {
    x: randomRange(canvass.width/2 - buttons.offsetWidth/3, canvass.width/2 + buttons.offsetWidth/3),
    y: randomRange(canvass.height/2 + buttons.offsetHeight/2 + 8, canvass.height/2 + (1.5 * buttons.offsetHeight) - 8),
  },
  this.velocity = {
    x: randomRange(-6, 6),
    y: randomRange(-8, -12)
  }
}
Sequins.prototype.update = function() {
  // apply forces to velocity
  this.velocity.x -= this.velocity.x * dragSequinss
  this.velocity.y = this.velocity.y + gravitySequinss
  
  // set position
  this.position.x += this.velocity.x
  this.position.y += this.velocity.y   
}

// add elements to arrays to be drawn
initBursts = () => {
  for (let i = 0; i < confettiCounts; i++) {
    confettis.push(new Confettos())
  }
  for (let i = 0; i < sequinCounts; i++) {
    sequinss.push(new Sequins())
  }
}

// draws the elements on the canvas1
renders = () => {
  ctxs.clearRect(0, 0, canvass.width, canvass.height)
  
  confettis.forEach((confetto, index) => {
    let width = (confetto.dimensions.x * confetto.scale.x)
    let height = (confetto.dimensions.y * confetto.scale.y)
    
    // move canvas1 to position and rotate
    ctxs.translate(confetto.position.x, confetto.position.y)
    ctxs.rotate(confetto.rotation)

    // update confetto "physics" values
    confetto.update()
    
    // get front or back fill color
    ctxs.fillStyle = confetto.scale.y > 0 ? confetto.color.front : confetto.color.back
    
    // draw confetto
    ctxs.fillRect(-width / 2, -height / 2, width, height)
    
    // reset transform matrix
    ctxs.setTransform(1, 0, 0, 1, 0, 0)

    // clear rectangle where buttons cuts off
    if (confetto.velocity.y < 0) {
      ctxs.clearRect(canvass.width/2 - buttons.offsetWidth/2, canvass.height/2 + buttons.offsetHeight/2, buttons.offsetWidth, buttons.offsetHeight)
    }
  })

  sequinss.forEach((sequin, index) => {  
    // move canvas1 to position
    ctxs.translate(sequin.position.x, sequin.position.y)
    
    // update sequin "physics" values
    sequin.update()
    
    // set the color
    ctxs.fillStyle = sequin.color
    
    // draw sequin
    ctxs.beginPath()
    ctxs.arc(0, 0, sequin.radius, 0, 2 * Math.PI)
    ctxs.fill()

    // reset transform matrix
    ctxs.setTransform(1, 0, 0, 1, 0, 0)

    // clear rectangle where buttons cuts off
    if (sequin.velocity.y < 0) {
      ctxs.clearRect(canvass.width/2 - buttons.offsetWidth/2, canvass.height/2 + buttons.offsetHeight/2, buttons.offsetWidth, buttons.offsetHeight)
    }
  })

  // remove confetti1 and sequins1 that fall off the screen
  // must be done in seperate loops to avoid noticeable flickering
  confettis.forEach((confetto, index) => {
    if (confetto.position.y >= canvass.height) confettis.splice(index, 1)
  })
  sequinss.forEach((sequin, index) => {
    if (sequin.position.y >= canvass.height) sequinss.splice(index, 1)
  })

  window.requestAnimationFrame(renders)
}

// cy1cle through buttons states when clicked
clickButtonCover = () => {
  if (!disabled) {
    disabled = true
    // Loading stage
    buttons.classList.add('loading')
    buttons.classList.remove('ready')
    setTimeout(() => {
      // Completed stage
      buttons.classList.add('complete')
      buttons.classList.remove('loading')
      setTimeout(() => {
        window.initBursts()
        setTimeout(() => {
          // Reset button so user can select it again
          disabled = false
          buttons.classList.add('ready')
          buttons.classList.remove('complete')
        }, 4000)
      }, 320)
    }, 1800)
  }
}

// re-init canvas1 if the window size changes
resizeCanvasCover = () => {
  canvass.width = window.innerWidth
  canvass.height = window.innerHeight
  cxs = ctxs.canvas.width / 2
  cys = ctxs.canvas.height / 2
}

// resize listenter
window.addEventListener('resize', () => {
  resizeCanvasCover()
})

// click button on spacebar or return keypress
document.body.onkeyup = (e) => {
  if (e.keyCode == 13 || e.keyCode == 32) {
    clickButtonCover()
  }
}

// Set up button text transition timings on page load
textElements = buttons.querySelectorAll('.button-text-1')
textElements.forEach((element) => {
  characters = element.innerText.split('')
  let characterHTML = ''
  characters.forEach((letter, index) => {
    characterHTML += `<span class="char${index}" style="--d:${index * 30}ms; --dr:${(characters.length - index - 1) * 30}ms;">${letter}</span>`
  })
  element.innerHTML = characterHTML
})

// kick off the render loop
// window.initBursts()
renders()