import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import * as CANNON from 'cannon-es'

// const skyBox0 = './src/img/sky_boxes/city/skyBox0.jpg'
// const skyBox1 = './src/img/sky_boxes/city/skyBox1.jpg'
// const skyBox2 = './src/img/sky_boxes/city/skyBox2.jpg'
// const skyBox3 = './src/img/sky_boxes/city/skyBox3.jpg'
// const skyBox4 = './src/img/sky_boxes/city/skyBox4.jpg'
// const skyBox5 = './src/img/sky_boxes/city/skyBox5.jpg'


const skyBox0 = 'https://raw.githubusercontent.com/Darek3399/Three.js/master/src/img/sky_boxes/city/skyBox0.jpg'
const skyBox1 = 'https://raw.githubusercontent.com/Darek3399/Three.js/master/src/img/sky_boxes/city/skyBox1.jpg'
const skyBox2 = 'https://raw.githubusercontent.com/Darek3399/Three.js/master/src/img/sky_boxes/city/skyBox2.jpg'
const skyBox3 = 'https://raw.githubusercontent.com/Darek3399/Three.js/master/src/img/sky_boxes/city/skyBox3.jpg'
const skyBox4 = 'https://raw.githubusercontent.com/Darek3399/Three.js/master/src/img/sky_boxes/city/skyBox4.jpg'
const skyBox5 = 'https://raw.githubusercontent.com/Darek3399/Three.js/master/src/img/sky_boxes/city/skyBox5.jpg'





// рендер
const renderer = new THREE.WebGLRenderer({
	antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement)

// сцена
const scene = new THREE.Scene()

// камера
const camera = new THREE.PerspectiveCamera(
	45,
	window.innerWidth / window.innerHeight,
	0.1,
	30000
)
camera.position.set(0, 25, 20)


const orbit = new OrbitControls(camera, renderer.domElement)
orbit.update()


// скайбокс
const skyBox = new THREE.CubeTextureLoader()
scene.background = skyBox.load([
	skyBox2,
	skyBox4,
	skyBox1, //верх
	skyBox0, //низ
	skyBox5,
	skyBox3,
])






// ФИЗИКА===========================================================================
// =================================================================================
const world = new CANNON.World({
	gravity: new CANNON.Vec3(0, -9.81, 0)
})
const timeStep = 1 / 60






// ОБЪЕКТЫ




// ground
const groundGeo = new THREE.PlaneGeometry(50, 50)
const groundMat = new THREE.MeshStandardMaterial({
	color: 0x111919,
	side: THREE.DoubleSide,
	roughness: 0.5,
	metalness: 0.5,
})
const ground = new THREE.Mesh(groundGeo, groundMat)
ground.receiveShadow = true
ground.position.set(0, 0, 0)
ground.name = `ground`
scene.add(ground)



// коллизия ground
const groundPhisMat = new CANNON.Body()
const groundBody = new CANNON.Body({
	shape: new CANNON.Box(new CANNON.Vec3(ground.geometry.parameters.width / 2, ground.geometry.parameters.height / 2, 0.01)),
	mass: 0,
	material: groundPhisMat,
})
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
world.addBody(groundBody)











// бокс
const boxGeo = new THREE.BoxGeometry(1, 1, 1, 10, 10, 10)
const boxMat = new THREE.MeshStandardMaterial({
	color: 0xf8db5,
	wireframe: true,
})
const box = new THREE.Mesh(boxGeo, boxMat)
box.position.set(0, 2, 0)
scene.add(box)


// ширина/высота/глубина куба для CANNON
const boxDHW = [box.geometry.parameters.depth / 2, box.geometry.parameters.height / 2, box.geometry.parameters.width / 2]

// коллизия box
const boxPhisMat = new CANNON.Material()
const boxBody = new CANNON.Body({
	mass: 1,
	shape: new CANNON.Box(new CANNON.Vec3(boxDHW[0], boxDHW[1], boxDHW[2])),
	position: new CANNON.Vec3(Math.random() * 1, 10, Math.random() * 1),
	material: boxPhisMat,
})
boxBody.linearDamping = 0.05 //сопротимвление воздуха для перемещения
boxBody.angularDamping = 0.5 //сопротимвление воздуха для раскручивания
world.addBody(boxBody)

// взаимодействие ground и box
const groBoxContactMat = new CANNON.ContactMaterial(
	groundPhisMat,
	boxPhisMat,
	{
		friction: 0.01,
	}
)
world.addContactMaterial(groBoxContactMat)






// sphere
const sphereGeo = new THREE.SphereGeometry(1, 50, 50)
const sphereMat = new THREE.MeshStandardMaterial({
	color: 0xa82f2f,
	roughness: 0.5,
	metalness: 0,
	wireframe: true
})
const sphere = new THREE.Mesh(sphereGeo, sphereMat)
scene.add(sphere)

// коллизия sphere
const spherePhisMat = new CANNON.Material()
const sphereBody = new CANNON.Body({
	mass: 10,
	shape: new CANNON.Sphere(sphere.geometry.parameters.radius),
	position: new CANNON.Vec3(0, 5, 0),
	material: spherePhisMat,
})
sphereBody.linearDamping = 0.5
sphereBody.angularDamping = 0.5
world.addBody(sphereBody)

// взаимодействие ground и sphere
const sphereGroundContactMaterial = new CANNON.ContactMaterial(
	groundPhisMat,
	spherePhisMat,
	{
		restitution: 0.5,
	}
)
world.addContactMaterial(sphereGroundContactMaterial)










// СВЕТ



const dLight = new THREE.DirectionalLight(0xFFFFFF, 3)
scene.add(dLight)
dLight.position.set(55, 250, 170)
dLight.castShadow = true
dLight.shadow.camera.top = 25
dLight.shadow.camera.right = 25
dLight.shadow.camera.bottom = -25
dLight.shadow.camera.left = -25
dLight.shadow.mapSize.x = 8192
dLight.shadow.mapSize.y = 8192













scene.traverse((child) => {
	if (child.isMesh && child.name !== `ground`) {
		child.castShadow = true
	}
})
// счётчик FPS
let countFPS = 0
setInterval(() => {
	document.querySelector(`#fps`).innerHTML = countFPS
	countFPS = 0
}, 1000)





// АНИМАЦИЯ
const animate = () => {
	// счётчик FPS
	countFPS += 1

	// ФИЗИКА
	ground.position.copy(groundBody.position)
	ground.quaternion.copy(groundBody.quaternion)
	
	box.position.copy(boxBody.position)
	box.quaternion.copy(boxBody.quaternion)
	
	sphere.position.copy(sphereBody.position)
	sphere.quaternion.copy(sphereBody.quaternion)




	world.step(timeStep)
	renderer.render(scene, camera)
}
renderer.setAnimationLoop(animate)




// ресайз окна
window.onresize = () => {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
}
