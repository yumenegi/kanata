// changing sine to hex for rainbow cycle
function sin_to_hex(i, phase) {
    var sin = Math.sin(Math.PI / 720 * 2 * i + phase);
    var int = Math.floor(sin * 127) + 128;
    var hex = int.toString(16);
    return hex.length === 1 ? "0"+hex : hex;
}

// function create r, g, b
function _rainbow_(i){
    var red   = sin_to_hex(i, 0 * Math.PI * 2/3); // 0   deg
    var blue  = sin_to_hex(i, 1 * Math.PI * 2/3); // 120 deg
    var green = sin_to_hex(i, 2 * Math.PI * 2/3); // 240 deg
    return "#"+ red + green + blue;
}

// keypress events
function key_press(event){
    let keyCode = event.which;
    if (keyCode === 65) {
        ship.rot_vel = 3;
    } 
    if (keyCode === 68) {
        ship.rot_vel = -3;
    }
    if (keyCode === 32 && !fired && !cool_down) {
        console.log("trigger");
        fire();
        fire_timer = 0;
        fired = true;
        // console.log(bullet_container);
    }
}

// create color code string
const rainbow = (i) =>  _rainbow_(i);

// key release
// reset variables to default
function key_release(event){
    let keyCode = event.which;
    if (keyCode === 65 || keyCode === 68)
        ship.rot_vel = 0;
    if (keyCode === 32)
        fired = false;
        cool_down = true;
        cool_down_timer = fire_rate - fire_timer;
        fire_timer = 0;
}

// apply rotation to all vectors in array
function rotate_vec (v, rotation) {
    for (let i = 0; i < v.length; i++) {
        // calling vector rotation function
        v[i] = vector_rotation(v[i], rotation);
    }
    
    return v;
}

// draw polygon
function draw_poly (vec, centre) {
    // begin path
    ctx.beginPath();

    // move to first point
    ctx.moveTo(centre.x + vec[0].x, centre.y + vec[0].y);

    // iterate through each point of the polygon
    for (let i = 1; i < vec.length; i++){
        ctx.lineTo(centre.x + vec[i].x, centre.y + vec[i].y);
    }
    
    // close the shape
    ctx.lineTo(centre.x + vec[0].x, centre.y + vec[0].y);
    ctx.stroke();
}

// draw player
function draw_player (centre, rotation){
    // vector from centre of ship
    let vec = [vector(0, -30), vector(15, 15), vector(6,12), vector(-6,12), vector(-15, 15)];

    // rotate vectors for player sprite
    vec = rotate_vec(vec, rotation);
    ship.fire_vec = vec[0];

    // draw player
    draw_poly(vec, centre);
}

function draw_bullet (){
    // begin path
    ctx.beginPath();
    for (let i = 0; i < bullet_container.length; i++){
        // draw bullet
        // console.log("%i, %i",bullet_container[i].centre.x,bullet_container[i].centre.y)
        ctx.arc(bullet_container[i].centre.x,bullet_container[i].centre.y, 1, 0, 2 * 3);
        ctx.stroke();
    }

    // // stroke
    // ctx.stroke();
}

function fire(){
    let _bullet_ = bullet(point_translate(ship.centre, ship.fire_vec), vector_scale(ship.fire_vec, bullet_speed), 0);
    console.log("fire");
    // append 
    bullet_container.push(_bullet_);
}

function check_boundary(obj){
    if (obj.centre.x > canvas.width){
        return point_flip_right(obj.centre);
    } 
    else if (obj.centre.x < 0){
        return point_flip_left(obj.centre);
    } 
    else if (obj.centre.y > canvas.height){
        return point_flip_bot(obj.centre);
    } 
    else if (obj.centre.y < 0){
        return point_flip_top(obj.centre);
    }
    else {
        return obj.centre;
    }
}

// draw function
function draw (i) {
    // set color
    let color = rainbow(i);
    ctx.strokeStyle = color;

    // clear screen
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // apply rotation by applying angular velocity
    ship.rotation += ship.rot_vel;

    // apply ship movement vector 
    ship.centre = point_translate(ship.centre, ship.vec);

    for (let i = 0; i < bullet_container.length; i++){
        // apply bullet vector
        bullet_container[i].centre = point_translate(bullet_container[i].centre, bullet_container[i].vec);
        bullet_container[i].timer ++;

        
        bullet_container[i].centre = check_boundary(bullet_container[i]);
        

        // // check out of bound
        // if (bullet_container[i].centre.x > canvas.width){
        //     bullet_container[i].centre = point_flip_right(bullet_container[i].centre);
        // } 
        // else if (bullet_container[i].centre.x < 0){
        //     bullet_container[i].centre = point_flip_left(bullet_container[i].centre);
        // } 
        // else if (bullet_container[i].centre.y > canvas.height){
        //     bullet_container[i].centre = point_flip_bot(bullet_container[i].centre);
        // } 
        // else if (bullet_container[i].centre.y < 0){
        //     bullet_container[i].centre = point_flip_top(bullet_container[i].centre);
        // }
    }

    // shift the first element when it stays alive for over 120 frames
    if (bullet_container.length && bullet_container[0].timer >= bullet_lifetime) {
        bullet_container.shift();
    }

    // fire key held
    if (fired){
        if (fire_timer < fire_rate) {
            fire_timer ++;
        } else {
            fire();
            fire_timer = 0;
        }
    }

    // cool down for firing again
    if (cool_down) {
        if (cool_down_timer < fire_rate){
            cool_down_timer ++;
        } else {
            cool_down_timer = 0;
            cool_down = false;
        }
    }

    // test
    test_ast.centre = point_translate(test_ast.centre, vector(-1,-1));
    test_ast.centre = check_boundary(test_ast);
    draw_poly(test_ast.vec, test_ast.centre);
    

    // draw bullet  
    draw_bullet();

    // draw player
    draw_player(ship.centre, ship.rotation);
    window.requestAnimationFrame((i) => draw(i++));
}

// get window width/height
let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;
console.log("Window is %d by %d", windowWidth, windowHeight);

// get canvas object
const canvas = document.getElementById('mainCanvas');

// set canvas size
canvas.width = windowWidth - 30;
canvas.height = windowHeight - 30;
canvas.style.border = '1px solid black';

// set up context for the canvas
const ctx = canvas.getContext('2d');
ctx.lineWidth = 2;
ctx.fillStyle = '#000009';
 
// point modificatoin functions 
const radian = (deg) => (deg * (Math.PI / 180));
const point  = (x = 0, y = 0) => ({x, y});
const vector = (x = 0, y = 0) => ({x, y});
const point_translate = (p, v)   => ({x: p.x + v.x, y: p.y + v.y});
const vector_rotation = (v, deg) => ({x: (v.x * Math.cos(radian(deg)) - v.y * Math.sin(radian(deg))), y:(v.x * Math.sin(radian(deg)) + v.y * Math.cos(radian(deg)))});
const vector_scale = (v, s) => ({x: v.x * s, y: v.y *s});
const vector_change = (v1, v2) => ({x: v1.x + v2.x, y: v1.y + v2.y});

// teleport on edge
const point_flip_top = (p) => ({x: windowWidth - p.x, y: canvas.height});
const point_flip_bot = (p) => ({x: windowWidth - p.x, y: 0});
const point_flip_left = (p) => ({x: canvas.width, y: windowHeight - p.y});
const point_flip_right = (p) => ({x: 0, y: windowHeight - p.y});

// game object functions: bullet, asteroid
const bullet = (centre, vec, timer) => ({centre, vec, timer});
const asteroid = (centre, vec, alive) => ({centre, vec, alive});

// centre point
const centre = point(windowWidth / 2, windowHeight / 2);

// bounding box is 60px x 60px
const asteroid_vec = [vector(26, -27), vector(13, -30), vector(0, -27), vector(-12, -30), vector(-20, -27), vector(-27, -23), vector(-30, -10), vector(-24, -2), vector(-30, 8), vector(-20,30), vector(0,26), vector(17, 30), vector(21, 19), vector(28,18), vector(25, 3), vector(30, -10)];

var test_ast = asteroid(point(windowWidth / 2 -50, windowHeight / 2 -50), rotate_vec(asteroid_vec, Math.floor((Math.random() * 360) + 1)), true);

// create ship(player) object
const ship = new Object();
ship.centre = centre;
ship.rotation = 0;
ship.rot_vel = 0;
ship.fire_vec = vector(0, -30);
ship.thrust = 0;
ship.vec = vector(0, 0);

// // create bullet
// const bullet = new Object();
// bullet.centre = point_translate(centre, ship.fire_vec);
// bullet.vec = vector(0,0);

// contains all of the bullets on screen
var bullet_container = [];

// contains all of the asteriods
var asteroid_container = [];

// firing boolean, and firing timer -> controlled by the firing rate
var fired = false;
var fire_timer = 0;
const fire_rate = 10;

// cool down timer to track instead of fire timer after fire key release
var cool_down = false;
var cool_down_timer = 0;

// bullet constants
const bullet_lifetime = 120;
const bullet_speed = 0.2;

// event listeners
document.addEventListener("keydown", key_press);
document.addEventListener("keyup", key_release);

// start animation engine
window.requestAnimationFrame(() => draw(0));