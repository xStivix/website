import * as THREE from './vendor/three.module.js';

// Resolve the thin glass highlights before the canvas reaches the browser's
// compositor. Merely enlarging the canvas leaves subpixel rims undersampled
// when the browser scales that canvas back down.
export function createFocusAntialias(renderer) {
  const target = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.HalfFloatType,
    samples: 4,
    depthBuffer: true,
    generateMipmaps: false
  });
  const material = new THREE.ShaderMaterial({
    uniforms: {
      image: { value: target.texture },
      pixelSize: { value: new THREE.Vector2(1, 1) }
    },
    depthTest: false,
    depthWrite: false,
    vertexShader: `
      varying vec2 sampleUv;
      void main() {
        sampleUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D image;
      uniform vec2 pixelSize;
      varying vec2 sampleUv;
      void main() {
        vec3 color = vec3(0.0);
        for (int y = -1; y <= 1; y++) {
          for (int x = -1; x <= 1; x++) {
            vec2 offset = vec2(float(x), float(y)) * pixelSize / 3.0;
            color += texture2D(image, sampleUv + offset).rgb;
          }
        }
        gl_FragColor = vec4(color / 9.0, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `
  });
  const geometry = new THREE.PlaneGeometry(2, 2);
  const scene = new THREE.Scene();
  scene.add(new THREE.Mesh(geometry, material));
  const camera = new THREE.Camera();
  const size = new THREE.Vector2();
  return {
    resize(width, height) {
      const limit = 1600 / Math.max(width, height);
      const outputRatio = Math.min(devicePixelRatio, 2, limit);
      const sampleRatio = Math.min(3, limit);
      renderer.setPixelRatio(outputRatio);
      renderer.setSize(width, height, false);
      renderer.getDrawingBufferSize(size);
      material.uniforms.pixelSize.value.set(1 / size.x, 1 / size.y);
      target.setSize(Math.round(width * sampleRatio), Math.round(height * sampleRatio));
      renderer.domElement.dataset.renderScale = sampleRatio.toFixed(2);
      renderer.domElement.dataset.antialias = 'msaa-area-resolve';
    },
    render(source, sourceCamera) {
      renderer.setRenderTarget(target);
      renderer.render(source, sourceCamera);
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
    },
    dispose() {
      target.dispose();
      geometry.dispose();
      material.dispose();
    }
  };
}
