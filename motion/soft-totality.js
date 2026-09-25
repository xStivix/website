import * as THREE from './vendor/three.module.js';

import { resizeOpticalRenderer } from './optical-quality.js';

const TAU=Math.PI*2;
const planeVertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const matteVertex=`varying vec3 vNormal;varying vec3 vPosition;void main(){vNormal=normalize(normalMatrix*normal);vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const matteFragment=`
precision highp float;
varying vec3 vNormal;varying vec3 vPosition;
void main(){
  vec3 n=normalize(vNormal);
  float diffuse=max(0.,dot(n,normalize(vec3(-.6,.8,1.3))));
  float rim=pow(1.-max(0.,n.z),3.5);
  float side=.4+.6*max(0.,dot(n.xy,normalize(vec2(-.8,.7))));
  float grain=fract(sin(dot(floor(vPosition.xy*950.),vec2(12.9898,78.233)))*43758.5453);
  float light=.015+.069*pow(diffuse,2.1)+.060*rim*side;
  gl_FragColor=vec4(vec3(light+(grain-.5)*.004),1.);
}`;
const haloFragment=`
precision highp float;
varying vec2 vUv;uniform float uRadius;uniform float uStrength;
void main(){float r=length((vUv-.5)*3.8);float distance=abs(r-uRadius);
float glow=exp(-distance*21.)*.22+exp(-distance*7.)*.095;
gl_FragColor=vec4(vec3(1.),glow*uStrength);}`;

export function createEclipse(container,id,{autoplay=true,onFrame=()=>{}}={}){
  const duration=[20,24,24,24][id-1];
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x000000);
  renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','Matte Obsidian-Eclipse mit wanderndem Licht');
  container.append(renderer.domElement);
  const scene=new THREE.Scene(),group=new THREE.Group();scene.add(group);
  const camera=new THREE.OrthographicCamera(-1.75,1.75,1.75,-1.75,.1,30);camera.position.z=8;
  const materials=[],geometries=[];
  const ownMat=m=>(materials.push(m),m);
  const mesh=(g,m,parent=group)=>{geometries.push(g);const o=new THREE.Mesh(g,m);parent.add(o);return o;};
  const matte=()=>ownMat(new THREE.ShaderMaterial({vertexShader:matteVertex,fragmentShader:matteFragment}));
  const white=()=>ownMat(new THREE.MeshBasicMaterial({color:0xfafafa,side:THREE.DoubleSide}));
  const halo=(radius,strength,parent=group)=>{
    const material=ownMat(new THREE.ShaderMaterial({vertexShader:planeVertex,fragmentShader:haloFragment,uniforms:{uRadius:{value:radius},uStrength:{value:strength}},transparent:true,depthWrite:false}));
    return mesh(new THREE.PlaneGeometry(3.8,3.8),material,parent);
  };
  let animate,pointMaterial;


  const lightRadius=[1.055,1.075,1.09,1.05][id-1];
  const orbRadius=[1.014,1.006,1.029,1.0][id-1];
  const light=mesh(new THREE.CircleGeometry(lightRadius,256),white());light.position.z=-1.12;
  const glow=halo(lightRadius,[.48,.62,1.18,.70][id-1]);glow.position.z=-1.15;
  const orb=mesh(new THREE.SphereGeometry(orbRadius,128,96),matte());orb.position.z=.15;
  if(id===4){
    light.material=ownMat(new THREE.ShaderMaterial({
      vertexShader:planeVertex,uniforms:{uAngle:{value:0}},side:THREE.DoubleSide,
      fragmentShader:'precision highp float;varying vec2 vUv;uniform float uAngle;void main(){vec2 p=vUv-.5;float a=atan(p.y,p.x);float lighting=.24+.76*pow(.5+.5*cos(a-uAngle),1.3);gl_FragColor=vec4(vec3(lighting),1.);}'
    }));
  }
  animate=t=>{const a=TAU*t/duration;
    if(id===1){const radius=.095+.015*Math.sin(a*2.);orb.position.set(radius*Math.cos(a),radius*Math.sin(a),.15);}
    if(id===2){orb.position.set(.34*Math.cos(a),.045*Math.sin(a*2.),.15);}
    if(id===3){orb.position.set(.085*Math.sin(a),.040*Math.cos(a),.15);glow.material.uniforms.uStrength.value=.94+.24*(.5-.5*Math.cos(a));}
    if(id===4){orb.position.set(.18*Math.cos(a),.14*Math.sin(a),.15);light.material.uniforms.uAngle.value=a+.8;}
  };

  let time=duration*.19,playing=autoplay,speed=1,frame=0,last=0,visible=false,lost=false,disposed=false;
  let averageMs=16.7,samples=0;
  const draw=()=>{if(disposed||lost)return;animate(time);renderer.render(scene,camera);container.dataset.ready='true';onFrame(time,duration);};
  const stop=()=>{if(frame)cancelAnimationFrame(frame);frame=0;last=0;container.dataset.motionState='paused';};
  const tick=now=>{
    frame=0;if(!playing||!visible||document.hidden||lost||disposed)return;
    if(last){const elapsed=now-last;time+=Math.min(elapsed,60)/1000*speed;if(elapsed<150){averageMs=averageMs*.96+elapsed*.04;if(++samples%60===0)container.dataset.frameMs=averageMs.toFixed(1);}}
    last=now;draw();frame=requestAnimationFrame(tick);
  };
  const schedule=()=>{if(!frame&&playing&&visible&&!document.hidden&&!lost&&!disposed){last=0;container.dataset.motionState='running';frame=requestAnimationFrame(tick);}};
  const resize=()=>{const r=container.getBoundingClientRect();if(!r.width||!r.height)return;resizeOpticalRenderer(renderer,r.width,r.height);const aspect=r.width/r.height;
    camera.left=-1.75*Math.max(1,aspect);camera.right=-camera.left;camera.top=1.75/Math.min(1,aspect);camera.bottom=-camera.top;camera.updateProjectionMatrix();
    if(pointMaterial)pointMaterial.uniforms.uScale.value=renderer.getPixelRatio()*Math.pow(Math.min(r.width,r.height)/500,.5);draw();};
  const ro=new ResizeObserver(resize);ro.observe(container);
  const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;visible?schedule():stop();});io.observe(container);
  const visibility=()=>document.hidden?stop():schedule();document.addEventListener('visibilitychange',visibility);
  const contextLost=e=>{e.preventDefault();lost=true;container.dataset.contextLost='true';stop();};
  const contextRestored=()=>{lost=false;delete container.dataset.contextLost;resize();schedule();};
  renderer.domElement.addEventListener('webglcontextlost',contextLost);renderer.domElement.addEventListener('webglcontextrestored',contextRestored);
  resize();schedule();
  return {duration,get playing(){return playing;},setPlaying(v){playing=v;v?schedule():stop();},setTime(v){time=v;draw();},setSpeed(v){speed=v;},dispose(){disposed=true;stop();ro.disconnect();io.disconnect();document.removeEventListener('visibilitychange',visibility);renderer.domElement.removeEventListener('webglcontextlost',contextLost);renderer.domElement.removeEventListener('webglcontextrestored',contextRestored);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();}};
}
