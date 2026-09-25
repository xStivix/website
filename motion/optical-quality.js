// Render optical edges above CSS resolution, then let the compositor downsample.
// A fixed per-size ratio avoids quality changes while an animation is running.
export function resizeOpticalRenderer(renderer,width,height){
  const ratio=Math.min(3,Math.max(2,devicePixelRatio*1.25),1600/Math.max(width,height));
  if(Math.abs(renderer.getPixelRatio()-ratio)>.01)renderer.setPixelRatio(ratio);
  renderer.setSize(width,height,false);
  renderer.domElement.dataset.renderScale=ratio.toFixed(2);
}
