"use strict"; 
const body=document.getElementsByTagName("body").item(0);
body.style.background="#000";
const TP=2*Math.PI;
const CSIZE=400;

const ctx=(()=>{
  let d=document.createElement("div");
  d.style.textAlign="center";
  body.append(d);
  let c=document.createElement("canvas");
  c.width=c.height=2*CSIZE;
  d.append(c);
  return c.getContext("2d");
})();
ctx.translate(CSIZE,CSIZE);

onresize=()=>{ 
  let D=Math.min(window.innerWidth,window.innerHeight)-40; 
  ctx.canvas.style.width=D+"px";
  ctx.canvas.style.height=D+"px";
}

const getRandomInt=(min,max,low)=>{
  if (low) {
    return Math.floor(Math.random()*Math.random()*(max-min))+min;
  } else {
    return Math.floor(Math.random()*(max-min))+min;
  }
}

var os=[];
var osr=Math.random()/200;
var osr2=Math.random()/200;
var osr3=Math.random()/200;
var setOffsets=()=>{
  os=[];
  for (let i=0; i<4; i++) {	// c-x-c-x
    let ss=0.001;
    if (i==2) {
      ss=os[0];
    } else {
      ss=Math.random()/250;
    }
    os.push(ss);
    os.push(-ss);
  }
  osr=Math.random()/200;
  osr2=Math.random()/200;
  osr3=Math.random()/200;
}
setOffsets();

const Radii={	// count from CSIZE to 0
  a1:TP*Math.random(),
  a2:TP*Math.random(),
  a3:TP*Math.random(),
  r1:0,
  r2:0,
  r3:0,
  move:()=>{
    Radii.a1+=osr;
    if (Radii.a1>TP) Radii.a1=Radii.a1-TP;
    Radii.r1=80+(CSIZE-140)*(1+Math.sin(Radii.a1))/2;
    Radii.a2+=osr2;
    if (Radii.a2>TP) Radii.a2=Radii.a2-TP;
    Radii.r2=60+(Radii.r1-120)*(1+Math.sin(Radii.a2))/2;
    Radii.a3+=osr3;
    if (Radii.a3>TP) Radii.a3=Radii.a3-TP;
    Radii.r3=40+(Radii.r2-100)*(1+Math.sin(Radii.a3))/2;
  }
};

const TBez=function(idx) {
  this.a=TP*idx/COUNT+TP*3/64;	// C32 by 8 rotations	c-x-c-x
  this.move=()=>{
    this.a+=os[idx%8];
    if (this.a>TP) this.a=this.a-TP;
    if (this.a<0) this.a=this.a+TP;
    let xf=Math.cos(this.a);
    let yf=Math.sin(this.a);
    this.x0=CSIZE*xf;
    this.y0=CSIZE*yf;
    this.x1=Radii.r1*xf;
    this.y1=Radii.r1*yf;
    this.x2=Radii.r2*xf;
    this.y2=Radii.r2*yf;
    this.x3=Radii.r3*xf;
    this.y3=Radii.r3*yf;
  }
}

var drawPoint2=(x,y,col)=>{	// diag
  ctx.beginPath();
  ctx.arc(x,y,3,0,TP);
  ctx.closePath();
  if (col) ctx.fillStyle=col;
  else ctx.fillStyle="red";
  ctx.fill();
}

function start() {
  if (stopped) {
    requestAnimationFrame(animate);
    stopped=false;
  } else {
    stopped=true;
  }
}
ctx.canvas.addEventListener("click", start, false);

var stopped=true;
var t=0;
function animate(ts) {
  if (stopped) return;
  t++;
  if (t%100==0) { hue=++hue%360; hue2=(hue2+2)%360; hue3=(hue3+3)%360; }
  if (t%1000==0) setOffsets();
  transit();
  draw();
  requestAnimationFrame(animate);
}

onresize();

const COUNT=32;
var tb=[];
for (let i=0; i<COUNT; i++) tb.push(new TBez(i));

var hue=getRandomInt(0,360);
var hue2=getRandomInt(0,360);
var hue3=getRandomInt(0,360);

var draw=()=>{
  ctx.clearRect(-CSIZE,-CSIZE,2*CSIZE,2*CSIZE);
  for (let i=0; i<tb.length; i++) {
    let i2=(i+1)%tb.length;
    let ad=tb[i2].a-tb[i].a;
    if (ad<0) ad+=TP;
    if (ad<0.0023) continue;	// TP*r for multi-layer
    ctx.beginPath();
    ctx.moveTo(tb[i].x1,tb[i].y1);
    ctx.bezierCurveTo(tb[i].x0,tb[i].y0,tb[i2].x0,tb[i2].y0, tb[i2].x1,tb[i2].y1);
    ctx.bezierCurveTo(tb[i2].x2,tb[i2].y2,tb[i].x2,tb[i].y2,tb[i].x1,tb[i].y1);
    let hw=Math.round(ad*360);	// 360:32 angle
    ctx.fillStyle="hsla("+(hw+hue)%360+",100%,50%,0.67)";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(tb[i].x2,tb[i].y2);
    ctx.bezierCurveTo(tb[i].x1,tb[i].y1,tb[i2].x1,tb[i2].y1,tb[i2].x2,tb[i2].y2);
    ctx.bezierCurveTo(tb[i2].x3,tb[i2].y3,tb[i].x3,tb[i].y3,tb[i].x2,tb[i].y2);
    ctx.fillStyle="hsla("+(hw+hue2)%360+",100%,50%,0.67)";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(tb[i].x3,tb[i].y3);
    ctx.bezierCurveTo(tb[i].x2,tb[i].y2,tb[i2].x2,tb[i2].y2,tb[i2].x3,tb[i2].y3);
    ctx.bezierCurveTo(0,0,0,0,tb[i].x3,tb[i].y3);
    ctx.fillStyle="hsla("+(hw+hue3)%360+",100%,50%,0.67)";
    ctx.fill();
  }
  drawPoint2(0,0,"silver");
}

var transit=()=>{
  Radii.move();
  for (let i=0; i<tb.length; i++) tb[i].move();
  tb.sort((a,b)=>{ return a.a-b.a; });
}

transit();
start();