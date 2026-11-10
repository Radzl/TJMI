# Línea base de rendimiento y accesibilidad

Medido el **4 de noviembre de 2026**, en la rama `modernizacion`, sobre el
commit `5aac2eb` (el mismo que la etiqueta `antes-de-modernizar`).

**Para qué está esto.** Se va a modernizar la web, y sin la foto del «antes»
cualquier mejora posterior es una opinión. Este proyecto ya se ha llevado dos
sustos por juzgar a ojo —la viñeta llevaba meses montada **sin ejecutarse**, y
las sombras de contacto igual—, y los dos se cazaron midiendo. Esto es el
punto de partida contra el que comparar.


> **Aviso de 9 de noviembre de 2026: esta línea base midió una página con el
> 3D vivo, y las dos medidas siguientes no.** Entre medias se añadió la
> cabecera de seguridad, y su `script-src` bloqueaba el wasm que descomprime
> `truck.glb`: la escena no montaba y el hilo principal se quedaba casi vacío,
> así que la nota **subía** sin que nadie hubiera optimizado nada. Está contado
> en «Rendimiento de la portada, medido en producción» de `CLAUDE.md`. Al
> comparar contra esta foto, comprueba antes que el 3D cargaba en las dos.
>
> También cambió el comando: ya no lleva `--webpack` (Turbopack funciona desde
> Next 16.4.5) y los guiones de medida viven ahora en `tests/perf/medidas/`,
> que **sí** se versiona.

## Cómo se reprodujo

Contra una compilación de **producción**, no el servidor de desarrollo, que
mide otra cosa:

```
npx next build --webpack
npx next start -p 3100
npx lighthouse http://localhost:3100/es --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=... --chrome-flags="--headless=new"
```

Lighthouse 13.6.0, con el Chrome instalado en el equipo. Para escritorio se
añade `--preset=desktop`. Los informes en crudo quedan en `tests/perf/informes/`,
que **no se versiona**: son 1,8 MB que cambian en cada pasada y se regeneran
con el comando de arriba. Lo que se versiona es este resumen.

**Se midió con el banner de cookies a la vista**, a propósito y al revés que
`check:3d`: la primera visita de cualquiera lo lleva, así que es el estado
real. Si algún día se mide sin él, hay que anotarlo o los números no son
comparables.

## Los números

| | portada móvil | portada escritorio | `/faq` móvil |
| --- | --- | --- | --- |
| **Rendimiento** | **35** | 61 | **77** |
| Accesibilidad | 97 | 97 | 100 |
| Buenas prácticas | 100 | — | — |
| SEO | 92 | — | — |
| LCP | 9,6 s | 0,6 s | 4,2 s |
| FCP | 1,6 s | 0,6 s | 1,1 s |
| **TBT** | **18.190 ms** | 3.920 ms | **350 ms** |
| TTI | 26,6 s | 5,7 s | 4,2 s |
| CLS | 0,000 | 0,001 | 0,005 |
| Peso transferido | 1.948 KiB | 2.017 KiB | **465 KiB** |

Objetivos del proyecto: **rendimiento ≥80 en móvil, accesibilidad ≥95**.

Reparto del peso en la portada móvil: Fetch 1.102 KB (los GLB), Script 611 KB,
Font 128 KB, Image 39 KB. Lighthouse señala **137 KB de JavaScript sin usar**
en el primer pintado.

## Lo que dicen

**La intro 3D no es «lo más caro»: es prácticamente todo el problema.** Se
midió `/faq` justamente para aislarlo —misma interfaz, mismo CSS, mismas
tipografías, sin 3D— y saca **77 con 350 ms de hilo bloqueado**. La portada,
**35 con 18.190 ms**: **52 veces más** hilo principal bloqueado y 1.483 KiB más
de descarga. Todo lo demás de esta web está razonablemente bien hecho.

**El TBT no se lee como un número absoluto.** Lighthouse en móvil frena la CPU
cuatro veces, y en este equipo ya está escrito que los fotogramas con CPU
frenada son ruidosos (tres pasadas al mismo código dieron 26, 38 y 37 fps). Lo
sólido es **la diferencia** entre páginas, medida en la misma pasada y la misma
máquina.

**El CLS está perfecto, y eso contradecía la sospecha de partida.** Se esperaba
encontrar desplazamientos de maquetación por el vídeo que ya cambió la altura
de la página una vez. Es 0,000 en la portada. Lo que lo evita son el
`IntersectionObserver` de `RevealText` y los huecos de foto con proporción
declarada: los dos funcionan.

**Escritorio descarga más que móvil** (2.017 frente a 1.948 KiB), y encaja con
lo documentado: la viñeta solo se activa por encima de 768 px, así que el
postprocesado solo viaja al escritorio.

**El objetivo de accesibilidad ya está cumplido** (97 y 100). Hay un fallo real
y seis falsos positivos; lo que sigue.

## Los seis avisos de contraste son falsos positivos

Lighthouse marca seis textos de la portada con contrastes de **1,01 a 1,10:1**,
y ninguno es un fallo. Pasa porque **el auditor no ve el `<canvas>`**: calcula
el contraste contra el fondo que encuentra en el CSS —el crema de la página— y
esos textos viven sobre el **suelo azul noche que pinta el 3D**. La prueba
circunstancial es que `/faq`, que no tiene 3D, saca 100.

Medido con píxeles, el fondo real es **`#131d31`** y los contrastes:

| elemento | tamaño | color real | contraste | pide |
| --- | --- | --- | --- | --- |
| `h2` «Cada día, de Castellón a Madrid.» | 110 px | `#ffffff` | **16,74:1** | 3 |
| `h3` «De tu muelle al de tu cliente» | 14 px | `#878d98` | **5,04:1** | 4,5 |
| `h4` «Recogemos» | 24 px | `#fffffe` | **16,75:1** | 3 |
| `h4` «Agrupamos» | 24 px | `#ffffff` | **16,74:1** | 3 |
| `h4` «Transportamos» | 24 px | `#ffffff` | **16,79:1** | 3 |
| `h4` «Entregamos» | 24 px | `#fffffe` | **16,73:1** | 3 |

### El método, y las dos trampas que costó

Es el mismo de siempre en este proyecto: capturar la caja **dos veces**, con
glifos y sin glifos, y comparar. Sin glifos da el fondo de verdad, sea CSS o
sea 3D; donde las dos difieren hay letra. No vale leer
`getComputedStyle().color`: en este mismo `h3` devuelve
`oklab(0.999994 0.0000455678 0.0000200868 / 0.5)`, y parsearlo como RGB da
cualquier cosa.

**Trampa 1: medir un estado transitorio.** La primera pasada dio «3 de 6
fallan», y dos de esos tres eran míos. «Transportamos» y «Entregamos» salieron
en `#3c4556` con 1,75:1 porque **todavía no se habían encendido**: un paso sin
encender va a `opacity: 0.18` por la regla `.route-steps li[data-shown='false']`.
Hay que medir con los cuatro encendidos y el bloque a opacidad 1.

**Trampa 2: promediar sobre el suavizado.** El tercer «fallo» era el `h3` a
4,34:1, y también era del método. A 14 px en versales con prosa ancha los
trazos miden cerca de un píxel, así que promediar el 2 % de píxeles es
promediar casi todo borde suavizado, y el color medido tira hacia el fondo.
Tomando el **núcleo del trazo** sale 5,04–5,10:1, que coincide con el valor
teórico (blanco al 50 % sobre `#131d31` = `#898e98`, 5,11:1) con una centésima
de diferencia. Control con el `h4` de 24 px: trazo grueso, converge al
instante, 16,79 contra 16,80 teórico. Y es lo correcto según la norma, que
compara el color **especificado**, no el renderizado.

| píxeles tomados | `h3` 14 px | `h4` 24 px (control) |
| --- | --- | --- |
| el más distinto | `#888e99` · 5,10 | `#fffffe` · 16,79 |
| 0,5 % | `#868b95` · 4,89 | `#fefefe` · 16,68 |
| 2 % | `#7d828d` · **4,34** | `#fefefe` · 16,62 |
| 10 % | `#3a4354` · 1,69 | `#efeff0` · 14,63 |

### Lo que sí hay que vigilar de ese `h3`

**5,04:1 contra un mínimo de 4,5 es poco margen, y el fondo no es fijo.** Lo
pinta el 3D, y `.bg-night-depth` lleva además una mancha de luz en el centro.
Calculado: si detrás de ese texto el azul subiera a `#2a3550`, el blanco al
50 % caería a unos **3,8:1** y entonces sí suspendería. No está medido a todas
las alturas de scroll.

Si se quiere margen, **blanco al 60 % da 6,78:1** sobre el fondo medido y
apenas cambia la imagen. Es una línea, y es la clase de fallo que este proyecto
ya se encontró una vez: el rojo de marca suspendía a 4,33:1 justo en el único
sitio donde se usaba.

## El fallo de accesibilidad que sí es real

**El enlace del logo del navbar.** Lleva `aria-label="Inicio"` y dentro tiene
texto visible que no entra en ese nombre, así que quien navega por voz no puede
activarlo diciendo lo que ve en pantalla. Es la norma WCAG 2.5.3 (*Label in
Name*). Sale en **las dos páginas medidas**, porque el navbar va en todas.

## El SEO 92 es un artefacto de medir en localhost

El único punto que falla es `rel=canonical`, y falla porque apunta al dominio
de producción mientras la página se sirve desde `localhost:3100`. El propio
`npm run check:seo` ya valida los 32 canonical. **No es un fallo.**

## Hallazgo lateral: los cuatro pasos se encienden demasiado tarde

Buscando la altura de scroll correcta para medir salió algo que no se buscaba.
Barriendo la escena 3 y más allá, a 1280 × 900:

| scroll respecto al final del recorrido de la escena 3 | pasos encendidos | opacidad del bloque |
| --- | --- | --- |
| −50 px | 1 / 4 | 1 |
| +100 px | 2 / 4 | 1 |
| +250 px | 3 / 4 | 1 |
| **+400 px** | **4 / 4** | 1 |
| +550 px | 4 / 4 | 1 |
| +700 px | 4 / 4 | **0,63** |
| +850 px | 4 / 4 | 0,16 |

O sea que **al 100 % del recorrido de su propia sección solo hay 2 de 4
encendidos**, el cuarto no llega hasta 400 px después, y entre 150 y 300 px más
tarde el bloque ya se está desvaneciendo (el barrido fue de 150 en 150, así que
la ventana exacta está dentro de ese margen).

La secuencia que esta sección existe para contar —los cuatro pasos
encendiéndose de uno en uno, de izquierda a derecha, en el sentido en que rueda
el camión— **apenas se llega a ver completa**. No es un fallo de contraste ni de
rendimiento: es de ritmo, y es de los que no se ven leyendo el código. Queda
apuntado, sin tocar: mover el encendido o la salida del texto afecta al reparto
del scroll, que está afinado y tiene su propia sección en `CLAUDE.md`.

## Lo que no se ha medido

- Un teléfono de verdad. Todo esto es emulación con CPU frenada.
- Las otras 29 páginas. Se midieron tres: la portada en los dos formatos y
  `/faq` como control sin 3D.
- El contraste de ese `h3` a todas las alturas de scroll (ver arriba).
- Las llamadas de dibujo del 3D, que se miden aparte y están en `CLAUDE.md`.

---

## 9 de noviembre de 2026: la portada, con el 3D vivo otra vez

Medido sobre `npx next build` + `npx next start -p 3100` con Lighthouse 12,
en móvil. Los guiones de apoyo están en `tests/perf/medidas/`.

### Lo que pasó, en orden

| | hilo bloqueado | CLS | nota |
| --- | --- | --- | --- |
| con el 3D roto por la CSP | 180 ms | 0,383 | 58 |
| con el 3D vivo | 2.760 ms | 0 | 46 |
| tras diferir el 3D y quitar Draco | **1.540 ms** | **0** | **51** |

**El 58 era falso**: medía una página sin escena. El número honesto de
partida era 46.

### Simulado contra frenado real

Mismo commit, misma máquina, mismo Lighthouse. Lo único que cambia es
`--throttling-method`:

| | `simulate` (por defecto) | `devtools` (frenado real) |
| --- | --- | --- |
| FCP | 0,9 s (100) | 2,0 s (85) |
| LCP | 5,9 s (14) | **2,0 s (97)** |
| CLS | 0 (100) | 0 (100) |
| hilo bloqueado | 1.580 ms (12) | 450 ms (63) |
| Speed Index | 3,9 s (83) | 2,6 s (97) |
| **nota** | **50** | **86** |

La diferencia no es ruido: el modo simulado **supone** que el párrafo del
banner de cookies —que es el elemento del LCP— no puede pintarse hasta que
acabe todo el JavaScript que bloquea. Medido con el observador del propio
navegador y la CPU a 1/4 (`tests/perf/medidas/lcp.mjs`), ese párrafo es el
único candidato a LCP y se pinta a **1.420 ms**, con el primer pintado.

El objetivo del proyecto —«Performance ≥ 80 en móvil»— se cumple con frenado
real. El número simulado se apunta igual, porque es el que enseña PageSpeed
Insights.

### Lo medido por su cuenta, sin Lighthouse

| | antes | ahora | guion |
| --- | --- | --- | --- |
| CLS móvil | 0,3831 | **0,0003** | `medidas/cls.mjs` |
| CLS escritorio | 0,3912 | **0,0001** | `medidas/cls.mjs` |
| alto de página al asentarse | 20.677 → 14.059 px | **sin cambio** | `medidas/cls.mjs` |
| primer contexto WebGL | — | **1.277 ms** | `medidas/sonda-webgl.mjs` |
| arnés visual | — | **0,00 % en 15 tomas** | `npm run check:3d` |

---

## 10 de noviembre de 2026: cierre de la tanda, y una advertencia

### Lo que hay que saber antes de comparar nada con lo de arriba

**El hilo bloqueado que mide Lighthouse es ruidoso entre sesiones.** El
mismo código, en la misma máquina y con el mismo comando, dio **1.540 ms**
por la mañana y **2.430 ms** por la tarde.

Se comprobó en vez de suponerlo, con un A/B dentro de la misma sesión: el
sospechoso era el callback por fotograma que añade la banda rotulada.

| | pasada 1 | pasada 2 | nota |
| --- | --- | --- | --- |
| con el callback | 2.430 ms | 2.480 ms | 48 |
| sin el callback | 2.210 ms | 2.490 ms | 48 |

No era la banda. Con frenado real pasa lo mismo: cuatro pasadas seguidas
dieron **70, 73, 73 y 75**.

**Así que:** solo valen las comparaciones hechas una detrás de otra, en la
misma sesión; siempre tres pasadas mirando el rango; y para medir una
optimización de verdad, mejor las **llamadas de dibujo** y los **bytes
pedidos**, que no dependen de lo ocupada que esté la máquina.

### Dónde quedó la portada

| | simulado | frenado real |
| --- | --- | --- |
| FCP | 0,9 s | 2,2 s |
| LCP | 5,8 s | **2,1 s** |
| CLS | **0** | **0** |
| hilo bloqueado | 2,4 s | 0,76 s |
| Speed Index | 4,5 s | 5,0 s |
| **nota** | **48** | **73–75** |

### Y la medida que sí se puede comparar

| | antes de esta tanda | al cerrarla |
| --- | --- | --- |
| JavaScript pedido, móvil | 1.778 KB | **1.781 KB** |
| JavaScript pedido, escritorio | 2.000 KB | **2.005 KB** |

Tres kilobytes. Nada de lo añadido —el envío real del formulario, la red de
avisos, la banda que responde al scroll, la página de cobertura— ha
engordado la portada.
