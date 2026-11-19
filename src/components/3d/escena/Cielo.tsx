'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { BackSide, Color, type Mesh, ShaderMaterial, Vector3 } from 'three';
import { CIELO } from './dia';

/**
 * **Cielo de día, calculado en la propia escena.** No se descarga ningún HDRI
 * ni ninguna textura de nubes: sería una petición a un tercero, y esta web no
 * carga nada de fuera sin consentimiento. (El `<Clouds>` de drei, por ejemplo,
 * pide su textura a un CDN por defecto: por eso no se usa.)
 *
 * Es una esfera enorme que viaja pegada a la cámara, con un degradado del
 * horizonte al cénit y nubes de ruido proyectadas sobre un plano alto. El
 * horizonte es **el mismo color que la niebla**, así que el suelo lejano se
 * funde con el cielo sin línea: es la bruma de un día de sol de verdad.
 *
 * No recibe niebla ni escribe profundidad, y se pinta antes que todo lo demás.
 */
const vertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform vec3 cenit;
  uniform vec3 horizonte;
  uniform vec3 solDir;
  varying vec3 vDir;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float ruido(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * ruido(p); p *= 2.03; a *= 0.5; }
    return v;
  }

  void main() {
    vec3 d = normalize(vDir);
    float h = d.y;
    // Degradado: la bruma ocupa una franja ancha sobre el horizonte y el azul
    // se cierra arriba. Por debajo del horizonte, bruma lisa (solo se ve si la
    // cámara mira por encima del borde del suelo).
    float t = pow(smoothstep(0.0, 0.75, max(h, 0.0)), 0.55);
    vec3 col = mix(horizonte, cenit, t);

    // Nubes: ruido sobre un plano alto, más densas lejos y desvanecidas cerca
    // del horizonte, donde la bruma se las come.
    if (h > 0.0) {
      vec2 uv = d.xz / (h + 0.12) * 1.6;
      float n = fbm(uv + vec2(3.7, 1.3));
      float nube = smoothstep(0.52, 0.78, n) * smoothstep(0.03, 0.3, h);
      vec3 blanco = mix(vec3(1.0), horizonte, 0.15);
      col = mix(col, blanco, nube * 0.9);
    }

    // Un halo suave hacia el sol.
    float s = max(dot(d, solDir), 0.0);
    col += vec3(1.0, 0.94, 0.82) * pow(s, 24.0) * 0.18;

    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default function Cielo({ sol }: { sol: [number, number, number] }) {
  const ref = useRef<Mesh>(null);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          cenit: { value: new Color(CIELO.cenit) },
          horizonte: { value: new Color(CIELO.horizonte) },
          solDir: { value: new Vector3(...sol).normalize() },
        },
        side: BackSide,
        depthWrite: false,
        fog: false,
      }),
    [sol],
  );

  // Pegada a la cámara: el cielo está «en el infinito», así que no debe
  // moverse respecto a ella al desplazarse.
  useFrame(({ camera }) => {
    ref.current?.position.copy(camera.position);
  });

  return (
    <mesh ref={ref} material={material} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[900, 32, 16]} />
    </mesh>
  );
}
