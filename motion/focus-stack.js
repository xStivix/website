import * as THREE from './vendor/three.module.js';
import { createFocusAntialias } from './focus-antialias.js';
export { focusTimeline } from './focus-timeline.js';
const TAU=Math.PI*2;

function studio(renderer){
  const scene=new THREE.Scene();scene.background=new THREE.Color(.018,.018,.018);
  const cards=[[-4,5,4,6,8,2.8],[4,1,2,1.4,7,1.8],[0,5,-3,5,3,2.2],[-2,-3,-3,3,4,.4]];
  for(const [x,y,z,w,h,v] of cards){const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(v,v,v),side:THREE.DoubleSide}));p.position.set(x,y,z);p.lookAt(0,0,0);scene.add(p);}
  const generator=new THREE.PMREMGenerator(renderer),target=generator.fromScene(scene,.04,.1,50);generator.dispose();scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});return target;
}

export function createFocusStack(container,{variant="ai",autoplay=true,timeline=null,onFrame=()=>{}}={}){
  const duration=16;
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x000000);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  const antialias=createFocusAntialias(renderer);
  renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','Animierte schwebende optische Ebenen');container.append(renderer.domElement);
  const scene=new THREE.Scene(),group=new THREE.Group();scene.add(group);
  const env=studio(renderer);scene.environment=env.texture;scene.environmentIntensity=.65;
  const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-3,5,5);scene.add(key);
  const fill=new THREE.DirectionalLight(0xffffff,.7);fill.position.set(3,-1,3);scene.add(fill);scene.add(new THREE.AmbientLight(0xffffff,.25));
  const camera=new THREE.OrthographicCamera(-1.95,1.95,1.95,-1.95,.1,30);camera.position.z=8;
  const geometries=[],materials=[];
  const material=m=>(materials.push(m),m);
  const white=material(new THREE.MeshPhysicalMaterial({color:0xededed,roughness:.43,metalness:.04}));
  const dark=material(new THREE.MeshPhysicalMaterial({color:0x141414,roughness:.64,metalness:.12}));
  const middle=material(new THREE.MeshPhysicalMaterial({color:0x666666,roughness:.55,metalness:.06}));
  const mesh=(g,m,parent=group)=>{geometries.push(g);const o=new THREE.Mesh(g,m);parent.add(o);return o;};
  const disc=(radius,mat,parent=group,depth=.075)=>{
    const plate=new THREE.Group();parent.add(plate);
    const r=radius,d=depth/2;
    const profile=[[0,-d],[r-.024,-d],[r-.006,-d+.008],[r,-d+.018],[r,d-.018],[r-.006,d-.008],[r-.024,d],[0,d]].map(([x,y])=>new THREE.Vector2(x,y));
    const body=mesh(new THREE.LatheGeometry(profile,512),mat,plate);body.rotation.x=Math.PI/2;
    return plate;
  };
  let animate;

  // Materials are ordered back to front; AI keeps white centred in front of grey.
  const order=[dark,middle,white];
  const plates=order.map(mat=>disc(.80,mat));
  // Soft contact shadows sit behind each disc and fall onto the layers below.
  const shadowMap=document.createElement('canvas');shadowMap.width=shadowMap.height=256;
  const shadowContext=shadowMap.getContext('2d');
  const shadowGradient=shadowContext.createRadialGradient(128,128,0,128,128,128);
  shadowGradient.addColorStop(0,'rgba(0,0,0,0.24)');
  shadowGradient.addColorStop(.83,'rgba(0,0,0,0.24)');
  shadowGradient.addColorStop(.91,'rgba(0,0,0,0.16)');
  shadowGradient.addColorStop(1,'rgba(0,0,0,0)');
  shadowContext.fillStyle=shadowGradient;shadowContext.fillRect(0,0,256,256);
  const shadowTexture=new THREE.CanvasTexture(shadowMap);
  const shadowMaterial=material(new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,toneMapped:false}));
  plates.forEach(plate=>{const shadow=mesh(new THREE.PlaneGeometry(1.78,1.78),shadowMaterial,plate);shadow.position.set(.035,-.045,-.06);});
  animate=t=>{const a=TAU*t/duration,open=.5-.5*Math.cos(a);
    const yaw=-.10+.025*Math.sin(a);
    group.rotation.set(0,yaw,0);
    // Keep every centre level and define the visible spacing independently of yaw.
    const depth=.46+.26*open;
    const spacing=.56+.12*open;
    plates.forEach((p,i)=>{
      const depthSlot=i-1;
      const screenSlot=variant==='ai'?[1,-1,0][i]:variant==='masterclass'?i-1:1-i;
      const horizontal=(screenSlot*spacing/1.6-depthSlot*depth*Math.sin(yaw))/Math.cos(yaw);
      p.position.set(horizontal,0,depthSlot*depth).multiplyScalar(1.6);
      p.rotation.y=depthSlot*.025*open;
    });};

  let time=duration*.36,playing=autoplay,speed=1,frame=0,last=0,visible=false,lost=false,disposed=false,averageMs=16.7,samples=0;
  const draw=(now=performance.now(),syncTime=true)=>{if(disposed||lost)return;if(timeline&&syncTime)time=timeline(now);animate(time);antialias.render(scene,camera);container.dataset.ready='true';onFrame(time,duration);};
  // Refresh the shared phase before the first visible frame on every return.
  const stop=()=>{if(frame)cancelAnimationFrame(frame);frame=0;last=0;container.dataset.motionState="paused";};
  const tick=now=>{frame=0;if(!playing||!visible||document.hidden||lost||disposed)return;if(last){const elapsed=now-last;if(!timeline)time+=Math.min(elapsed,60)/1000*speed;if(elapsed<150){averageMs=averageMs*.96+elapsed*.04;if(++samples%60===0)container.dataset.frameMs=averageMs.toFixed(1);}}last=now;draw(now);frame=requestAnimationFrame(tick);};
  const schedule=()=>{if(!frame&&playing&&visible&&!document.hidden&&!lost&&!disposed){last=0;container.dataset.motionState="running";draw();frame=requestAnimationFrame(tick);}};
  const resize=()=>{const r=container.getBoundingClientRect();if(!r.width||!r.height)return;antialias.resize(r.width,r.height);const aspect=r.width/r.height;camera.left=-1.95*Math.max(1,aspect);camera.right=-camera.left;camera.top=1.95/Math.min(1,aspect);camera.bottom=-camera.top;camera.updateProjectionMatrix();draw();};
  const ro=new ResizeObserver(resize);ro.observe(container);const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRect.width>0;visible?schedule():stop();});io.observe(container);
  const visibility=()=>document.hidden?stop():schedule();document.addEventListener('visibilitychange',visibility);
  const contextLost=e=>{e.preventDefault();lost=true;container.dataset.contextLost='true';stop();};const contextRestored=()=>{lost=false;delete container.dataset.contextLost;resize();schedule();};
  renderer.domElement.addEventListener('webglcontextlost',contextLost);renderer.domElement.addEventListener('webglcontextrestored',contextRestored);resize();schedule();
  return {duration,get playing(){return playing;},setPlaying(v){playing=v;v?schedule():stop();},setTime(v){time=v;draw(performance.now(),false);},setSpeed(v){speed=v;},dispose(){disposed=true;stop();ro.disconnect();io.disconnect();document.removeEventListener('visibilitychange',visibility);renderer.domElement.removeEventListener('webglcontextlost',contextLost);renderer.domElement.removeEventListener('webglcontextrestored',contextRestored);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());shadowTexture.dispose();env.dispose();antialias.dispose();renderer.dispose();renderer.domElement.remove();}};
}
