# Transportes José María Ibáñez — Web inmersiva

Lee este archivo entero antes de tocar código. Es la fuente de verdad del proyecto.

## Contexto
- Cliente: Transportes José María Ibáñez (transportesjosemariaibanez.es).
- Negocio: transporte terrestre B2B por carretera. Ruta diaria Castellón ⇄ Madrid. Carga principal: azulejos y material de construcción en palés.
- Objetivo de la web: que deje de ser una web promedio. Intro 3D ligada al scroll + captación de leads (presupuesto, email, WhatsApp) + blog.
- Idiomas: español (por defecto) e inglés.
- El propietario trabaja en modo "vibe coding": explica siempre qué has cambiado y cómo probarlo, en español y sin jerga innecesaria.

## Marca
- Azul corporativo: `#34548a` · Rojo corporativo: `#d03b40`.
- Mucho espacio en blanco. Azul y rojo solo como acentos, bordes y detalles, nunca como fondos masivos.
- Sección "oscura" (la que sube desde abajo en la intro): usar un azul noche derivado del corporativo (p. ej. `#0f1a2e`), no negro puro.
- Tipografía: sans geométrica robusta para titulares (condensada, mayúsculas), sans neutra para texto.

### La paleta, medida

Se contaron los píxeles de siete páginas para saber qué colores usa la web **de verdad**, que no es lo mismo que lo que declara el tema:

| | portada | toda la web |
| --- | --- | --- |
| crema | 44,4 % | **59,4 %** |
| azul noche | 19,1 % | 14,5 % |
| fotos y 3D | — | 13,5 % |
| blanco | 8,4 % | 5,8 % |
| filete | 5,2 % | 2,4 % |
| azul de marca | 1,8 % | 2,0 % |
| **rojo de marca** | 0,2 % | **0,13 %** |

**Lo que está bien y no se toca: la disciplina de tono.** Todo lo azul y lo gris vive entre **214° y 220°** —el azul de marca en 218, el azul noche en 219, la tinta en 218, el gris en 214—, así que el azul noche **sí** está derivado del corporativo como pedía el brief. Eso es lo mejor que tiene esta paleta.

#### El rojo va en tres tonos

- **Medido, el rojo de marca da 4,33:1 sobre el crema, y la WCAG pide 4,5 para texto pequeño.** Y casi todo el rojo de esta web **es** texto pequeño: enlaces de 12 px en versales, los números de las cifras, los avisos del formulario. O sea que el color de marca estaba suspendiendo justo en el único sitio donde se usa.
- No se arregla cambiando el rojo de marca —ese lo fija el brief— sino separando los trabajos. Los tres son el mismo tono (358°); lo que cambia es la claridad:
  - `brand-red` `#d03b40` — **solo relleno**: la banda rotulada, la muesca del vídeo, el punto del carrusel, el filete de 2 px. En relleno el contraste lo pone el tamaño.
  - `brand-red-ink` `#b83035` — texto pequeño sobre crema o blanco. **5,41:1**.
  - `brand-red-soft` `#de5a5e` — texto pequeño sobre azul noche. El de marca da ahí 3,63:1; aclarado, **4,75:1**. Hoy solo lo usan los números de `RouteSteps`.
- **Si pones rojo sobre un fondo nuevo, mira cuál de los tres toca.** Es el único sitio donde esta paleta pide pensar.

#### Los grises eran fríos sobre un papel cálido

- Medida la temperatura (rojo menos azul) de lo que había: crema **+11**, filete **−6**, gris de texto **−23**. Toda la capa tipográfica vivía en una temperatura distinta de la del papel sobre el que se imprime.
- Es **exactamente** el problema que este proyecto ya identificó y arregló dentro del 3D —«todo lo gris frío de esta escena se ha leído siempre como día lluvioso»— y que en la interfaz nunca se revisó. Ahora `--color-line` va en `#e8e2d6` y `--color-muted` en `#67625a`, los dos cálidos, y el gris **sube** de contraste: 5,27:1 → 5,47:1.
- **`--color-ink` no se toca.** A un 9 % de claridad la temperatura no se percibe, y cambiarlo movería todos los titulares de la web para no ganar nada visible.

#### El escalón que faltaba

- La escala de claridad era 95 → 91 → **(nada)** → 41 → 37 → 12: un hueco de **cincuenta puntos** entre el filete y el gris de texto. Por eso la única tarjeta posible en todo el sitio era «blanca sobre crema con un filete»: no había ningún otro tono al que ir.
- `--color-sand` `#efe9dd` lo llena. **Admite todo el texto**: tinta 15,1:1, gris 5,00:1, rojo de texto 4,95:1.
- `--color-sand-deep` `#ded5c2` va un punto más abajo y **no vale para texto pequeño** —el gris cae a 4,15:1—: es para rellenos, barras y huecos de foto. Si le pones texto encima, que sea tinta.

#### Lo que queda pendiente del color

#### El rojo, vuelto a medir página por página

- **La nota anterior decía que en `/faq` y `/contacto` no aparecía, y hoy eso ya no es verdad en `/faq`.** Vuelto a medir con `tests/perf/medidas/rojo.mjs`, que captura cada página entera y cuenta los píxeles cercanos a los tres rojos de la casa:

  | | rojo | mancha mayor | qué es esa mancha |
  | --- | --- | --- | --- |
  | portada | 0,231 % | 57.120 px | la banda rotulada |
  | nosotros | 0,253 % | 7.471 px | el botón del cierre |
  | faq | 0,203 % | 7.499 px | el botón del cierre |
  | grupaje | 0,197 % | 7.499 px | el botón del cierre |
  | servicios | 0,123 % | 7.499 px | el botón del cierre |
  | blog | 0,073 % | 314 px | solo los minutos de lectura |
  | **contacto** | **0,033 %** | **371 px** | un filete de 1 px y dos numeritos |

- **El margen de tolerancia es la trampa de esta medida.** Con 34 niveles por canal todas las páginas salían con mucho más rojo, pero no era rojo de marca: eran los tonos cálidos de las fotos de azulejo y el rojo de la lona del camión en el 3D. Con 10 se mide el color de la casa. Si vuelves a lanzarlo, usa el mismo margen o los números no se pueden comparar.
- **Lo que salió de ahí: la página que existe para pedir presupuesto era la que menos color de marca tenía de toda la web.** `/contacto` iba la última, y a mucha distancia.
- No se arregla metiendo rojo por meterlo —el brief lo prohíbe como fondo— sino **usando el que ya existe donde significa algo**:
  - **La barra de avance del formulario va en rojo.** Tenía que ser algo que esté ahí desde el primer momento: el botón de enviar solo se ve en el último paso y el filete del encabezado mide 56 × 2. La barra se ve nada más abrir, tiene cuerpo y es un relleno, que es exactamente como el brief quiere el rojo. El «Paso 1 de 3» de al lado se queda en azul: si fueran los dos, el rojo pasaría a ser el color del bloque en vez del de la barra que avanza. Medido: **371 → 716 px** y 0,033 → 0,051 %.
  - **El último paso del formulario va en rojo también**, y los intermedios no. `accent` (`bg-brand-red`) es el color que esta web le da a la acción que cierra, y aquí la que cierra es enviar; «Siguiente» no cierra nada. Si los tres pasos fueran rojos, el rojo dejaría de marcar el final. Blanco sobre `#d03b40` da **4,79:1**, por encima del 4,5 de la WCAG.
  - **El listado del blog recupera el filete rojo que crece**, el mismo gesto que las tarjetas del índice de la portada. Va debajo del enlace de cada fila, no encima: lo que marca es la acción de entrar a leer. En reposo mide 0, así que no mueve la maquetación.
- **Y `/blog` se resolvió por donde decía esta nota: cerrando con llamada.** El rojo de una fila del índice se descartó —un bloque de color en una fila la haría competir con las otras nueve, que es lo que un índice no debe hacer—, así que lo que faltaba no era color, era **salida**: cada artículo cierra con su llamada y el listado no cerraba con nada. Puesta la misma sección de cierre que el resto de páginas, el rojo viene solo. Medido: **314 → 7.499 px** y 0,073 → 0,170 %.
- Resultado final de la pasada: **las siete páginas tienen ya una aparición de rojo con cuerpo**, de 716 px la más pequeña, y la web entera pasa de 0,183 % a 0,192 %. Que es lo que se buscaba: el mismo acento, sin una pizca más de superficie de la que el brief permite.

## Criterio de diseño (plugin `frontend-design`)

El trabajo de interfaz de este proyecto sigue el criterio del plugin oficial `frontend-design`. Está instalado y habilitado en `~/.claude/settings.json`, y es **un único documento de texto**: no trae scripts ni herramientas. Esto de aquí es la parte que le afecta a este proyecto, escrita para que no dependa de que el plugin siga instalado.

La regla que lo ordena todo es suya: **lo que el brief fija, manda**. Lo que el brief deja libre no se gasta en el recurso por defecto. Aplicado aquí:

- **Titulares en mayúsculas condensadas: los pide el brief** (`## Marca`), así que se quedan y no se discuten.
- **Numeración `01` / `02` / `03` en las cabeceras: fuera.** Numerar afirma que hay una secuencia, y Servicios, Cobertura y Sedes no son pasos de nada: se leen en cualquier orden. Un marcador numérico solo se gana el sitio cuando el contenido va de verdad en orden.
- **Antetítulos en versales con prosa ancha: fuera.** Una etiqueta encima de un encabezado que repite el encabezado es ruido con aspecto de jerarquía. Donde el texto sí decía algo (el del hero: «Transporte nacional e internacional») se queda el texto y se va el disfraz: caja baja, tipografía de texto, sin filete.
- **Flecha `→` pegada al texto de enlaces y botones: fuera.** «Ver detalle» ya dice que se abre algo. (En `RouteMap` sí se queda: ahí la flecha señala una dirección de verdad, Castellón → Madrid.)
- **Cadenas unidas con `·`: fuera.** Los horarios además mezclaban `·` y `|` para el mismo trabajo; ahora van en prosa llana.
- **Una sola entrada orquestada en toda la página, y es la intro 3D.** Por eso la cabecera de sección ya no entra línea a línea: repetida en todas las secciones, una misma entrada deja de ser un momento y pasa a ser un tic.

**Las dos tipografías se eligieron a propósito, no por defecto.** Estaban en Oswald e Inter, que están entre las más usadas de Google Fonts y se reconocen al instante en cualquier web.

- **Texto: IBM Plex Sans.** El motivo es comprobable, no de gusto: esta web está llena de cifras —420 km, +4.000 m², el contador del desfile, teléfonos, horarios— y Plex trae **cifras tabulares dibujadas**, no una variante sintetizada por el navegador. `font-variant-numeric: tabular-nums` se pide una vez en `body` para toda la página, así los dígitos no bailan de ancho al cambiar.
- **Titulares: Archivo**, variable y con **eje de anchura**. La condensación es un número (`--display-width` en `globals.css`) y no un corte con nombre, así que se afina sin cambiar de familia. Va en una regla propia y no clase por clase: `font-display` se usa en docenas de sitios y la condensación tiene que ser la misma en todos.

Lo que **no** se tocó, y por qué: el color. El azul, el rojo, el crema y el azul noche los fija el brief, y el encargo era tipografía y cabeceras.

## Stack
Next.js (App Router) + React + TypeScript · Tailwind CSS · Three.js + @react-three/fiber + @react-three/drei · @react-three/postprocessing · GSAP + ScrollTrigger + ScrambleText/SplitText (GSAP es gratuito, incluidos los plugins) · Lenis (scroll suave) · Zustand (estado compartido scroll ↔ 3D) · next-intl · react-hook-form + zod · Vercel.

**Motion se quitó y no conviene devolverla.** Estuvo instalada y usada en **cero** archivos. El motivo de quitarla no es que sobre un paquete: es que sería un **tercer sistema de animación** junto a GSAP (todo lo atado al scroll) y las transiciones de CSS (las microinteracciones), o sea un tercer modelo mental para quien toque esto más adelante. Y el criterio de diseño de este proyecto pide movimiento con cuentagotas y un solo momento orquestado, que es la intro 3D: una librería cuyo valor está en animar interfaz con generosidad va justo en contra.

## Arquitectura de la experiencia 3D (no cambiar sin consultar)
1. Un único `<Canvas>` fijo a pantalla completa detrás del contenido (`position: fixed; inset: 0; z-index: 0`). Nunca varios Canvas.
2. El Canvas se carga con `dynamic(() => import(...), { ssr: false })`. Todo lo 3D es `'use client'`.
3. Las secciones HTML van encima (`z-index` superior) y son las que generan la altura de scroll.
4. Una timeline maestra de GSAP con `ScrollTrigger` (`scrub: true`) escribe el progreso (0 → 1) y el progreso de cada escena en un store de Zustand.
5. Los componentes R3F leen ese store dentro de `useFrame` (con `getState()`, no con hooks reactivos) y mueven cámara, modelos y materiales. Nada de `setState` por frame.
6. Cámara ortográfica en vista lateral para las escenas 1–4 (look "maqueta" limpio), transición a vista cenital en la escena 5.
7. Lenis sincronizado con ScrollTrigger (`lenis.on('scroll', ScrollTrigger.update)` y `gsap.ticker`).

## Guion de escenas (storyboard)
Referencia de ritmo: intro de scroll tipo "maqueta lateral" (grúa carga contenedor → camión → sección oscura sube → servicios en scroll horizontal → vista cenital de la carretera). Contenido 100 % propio de TJMI.

Decisiones cerradas:
- La escena de apertura fue **grúa portacontenedores + contenedor**. Esa decisión se cerró cuando la carga era un contenedor; al pasar la carga a palés, la máquina se quedó sin sentido y hoy es **una carretilla elevadora con un lote de palés**. Ver «La carretilla que carga el camión».
- La rotulación de la intro es la real: **"José María Ibáñez" en rojo sobre la lona** y el **escudo en el techo**. En la puerta de la tractora no va logo, ahí van las rayas roja y azul de la casa.
- Los modelos 3D salen de **stock gratuito** (CC0/CC-BY, créditos en el aviso legal). Si el resultado no da el nivel, se valorará comprar modelos.
- Los modelos se **retexturizan**: se quitan los logos del fabricante, se ajustan los colores a la marca y se pega el logo de TJMI.
- Trato al cliente: **tuteo** en todos los textos.
- **La intro 3D son 4 pantallas**: terminal, carga, sección azul noche y carretera. Cuando el camión termina el recorrido se acaba el 3D y empieza la web normal. Nada de globo terráqueo ni de escenas marítimas, TJMI no transporta por barco.
- El giro a **vista cenital** ocurre en la escena de la carretera, y no mira a plomo: va inclinada unos 16° para que el camión tenga volumen.
- La carretera es **3D**, una cinta que se dibuja según avanza el camión, con una **nave de salida y una nave de llegada** en los extremos. El trazado es una curva libre, no el mapa de España.
- El fondo de la página lo controla `Backdrop` con `data-bg` por sección: los cambios de color son fundidos, nunca un bloque opaco entrando.
- Escala de la grúa calibrada con las ruedas del propio GLB (1,5 m de diámetro): no tocar a ojo.
- La intro abre con un **acto previo**: la grúa coge su contenedor de una pila de cinco, viene hacia el espectador y gira a la derecha hasta quedar de perfil delante del camión. Va ligado al scroll, como todo lo demás.
- Ese acto se ve desde una **cámara en tres cuartos** que está en la misma dirección que la vista de perfil, solo que en alto (unos 30°). Pasar a perfil es bajar la cámara, no girarla: por eso no se nota el corte. Con cámara ortográfica es la única forma de que un avance en profundidad se lea (baja por la pantalla).
- El encuadre de ese acto (`quarterDrop`, `quarterShift`, `quarterWidth` en `Scene.tsx`) deja la maniobra en la franja baja y, en escritorio, en la columna izquierda: el titular nunca debe quedar sobre el 3D oscuro.
- El patio se llena con torres de contenedores (`PILE_ROWS`, una rejilla de `slot` × `row`). Dos reglas al tocarlo: nada por encima de `x ≈ -19`, o asomaría por la izquierda en la vista de perfil; y como mucho dos filas de fondo, porque cuanto más atrás está algo más sube en pantalla y acaba detrás del titular.
- **Las farolas van en la carretera, no en el patio** (`Road.tsx`). En el arranque, con la grúa cargando, estorbaban. Se colocan sobre la propia curva, así que siguen el trazado solas si se cambia, y **se encienden según se dibuja el asfalto**, no antes.
- El recorrido de la carretera ocupa la mitad de la sección (`ROAD_RUN` en `lib/route.ts`) y `RoadIntro` mide **480 svh** (subió desde 360 para que el camión avance más despacio: se alarga la sección en vez de tocar `ROAD_RUN`, así no hay que recolocar el fundido final ni la salida del texto): son 420 km y con un tramo corto se despachaban en dos golpes de rueda. Si tocas `ROAD_RUN`, mueve también el fundido final (`closing` en `Scene.tsx`) y la salida del texto en `RoadIntro`, que van **detrás** de la llegada.
- El bloque de texto de `RoadIntro` lleva un **velo crema en degradado** que se desvanece hacia la derecha. El trazado pasa por detrás y sobre el asfalto negro el texto en tinta no se lee; en móvil el texto ocupa casi todo el ancho, así que apartar la carretera no es opción. No lo quites sin resolver antes esa lectura.
- El fondo del patio (`TerminalYard.tsx`) son suelo y vallado, y **no es decoración**: sin nada fijo detrás, el camión avanzando ocho metros no se lee como que avanza porque no hay contra qué medirlo.
- Ese vallado viene **en dos piezas**. La lejana (x < −19) se ve siempre. La cercana, la que cruza por detrás del camión, solo se enciende con `quarter < 0.45`: en tres cuartos pasaría por detrás del titular en escritorio, y ahí todavía queda fuera de plano por la derecha, así que encenderla no se nota.
- El suelo del patio llevó un tiempo material **sin luz y con `toneMapped={false}`**, porque cualquier crema se saturaba a blanco. Era un parche y ya no está: la causa era el mapeo de tonos y la escala de las luces, las dos arregladas (ver «Iluminación del 3D»). Hoy es un plano normal que recibe luz y sombra como todo lo demás.
- *(Historia de la grúa, que ya no está. Se queda porque la lección vale para cualquier máquina que se ponga:)* **la pluma nunca entraba en la caja, y era un fallo de geometría, no de gusto.** Seguía al lote hasta el fondo del semirremolque, y los números no dan: el techo está a **4,30 m**, el spreader agarraba el lote a **3,17** —ya dentro— y al soltar subía a **4,87**, atravesando el techo. Ahora el objetivo de la pluma se clava en la cola (`boomTargetX`) y el levantamiento tras soltar baja de 1,7 a 0,55 m, así que la punta se queda en 3,72 y pasa por debajo.
- **Y el lote se posa sobre el piso, no en el aire.** Estuvo 3,4 m por detrás de la cola y 15 cm por encima del piso: daba igual mientras la pluma lo sujetaba hasta el fondo, pero al dejar de entrar se quedaba colgado de nada. Ahora cae justo dentro del borde del piso.
- ~~Pendiente de fondo: la máquina está mal elegida.~~ **Resuelto: ahora es una carretilla elevadora.** Ver «La carretilla que carga el camión». La reach stacker y su GLB están borrados.
- La carga se posa en **dos tiempos** (`place` y `lower`): primero se sitúa sobre el chasis y solo entonces baja en vertical. En diagonal parecía de juguete.
- *(También de la grúa, y el método es lo que importa:)* **había una cuña negra flotando en el aire** justo cuando el lote entraba en el camión, y era una pieza de la pluma que se quedaba atrás. El GLB trae **una malla por material**, así que lo que gira con la pluma se decide por material, no por nodo: faltaba `Material.004` en `BOOM_MATERIALS` (`ReachStackerModel.tsx`), de modo que esa parte seguía clavada al chasis mientras el resto subía. **Esto no se adivina por el nombre** —en este modelo todos son `Material.00N`—: se encontró tiñendo materiales de uno en uno de rojo y mirando cuál se encendía. Si vuelve a aparecer un trozo suelto, ese es el método.
- **La grúa se retira con el scroll, no de un salto.** Estuvo saliendo 32 metros repartidos en el 12 % final de la sección, o sea casi tres veces su propia longitud en un palmo de rueda: se leía como un corte de vídeo, no como una máquina marchándose. Ahora son 14 metros repartidos en el 22 % final (`exit` en `Scene.tsx`), que es lo justo para salir de plano a velocidad de máquina.
- **Al posarse la carga, el camión no se mueve**, y es una decisión, no un olvido. Hubo un hundimiento con rebote (`LANDING_DIP`) para contar que lo que le acaban de dejar encima pesa veinte toneladas. El problema es dónde pasa: justo en el primer plano, que es el único momento en que el camión está solo en pantalla y se le miran los detalles. Un meneo ahí no se lee como peso, se lee como que el modelo baila. La carga se posa y ya está.
- Entre que se posa y que la pluma se separa hay un compás de silencio. Sin esa pausa no se lee "ya está", se lee "salió corriendo".
- El **carril pintado** (`YardMarkings.tsx`) va exactamente por donde circula la grúa, así que se ve la ruta antes de que la recorra. Las medidas llegan por props desde `Scene.tsx`: si cambias la coreografía de la grúa, cambia también la esquina del carril.
- Ojo con el orden de la pintura del suelo: el pavimento lleva su propio `polygonOffset` para no pelearse con la franja oscura, y eso hacía que **tapase la pintura aunque la pintura esté por encima**. Por eso las marcas llevan un offset más adelantado todavía. Si añades algo más al suelo, dale el suyo.
- Los **palés de azulejos** (`Pallets.tsx`) son el elemento más de TJMI de la escena: no es carga genérica, es la de la casa. Y al ser piezas pequeñas dan escala a los contenedores y a la grúa. Van a `x < -19` como todo lo del patio.
- El camión ya **no es un placeholder**: es un GLB de stock (tractora + semirremolque de lonas) que viene cargado con palés y con la caja cerrada. Lo monta `TruckModel.tsx`.
- Ese GLB venía de una **escena de render completa**: traía 21 m de asfalto, vallas y señales. Se quitan en dos sitios y los dos hacen falta: en el archivo (para que no pesen) y en `TruckModel.tsx` por nombre de nodo y de material (por si se vuelve a generar el GLB sin recortar).
- El modelo llega **a lo largo de Z y centrado en su origen**; la escena lo quiere mirando a +X y con el origen en la cola. Se **mide** con `Box3` y se recoloca: el archivo va cuantizado, así que las posiciones en crudo no están en metros y leerlas a ojo da cualquier cosa. El giro va dentro y el desplazamiento fuera, o el desplazamiento saldría girado.
- **La cabina venía roja y con la rotulación del fabricante impresa en la textura.** Repintarla no basta: al material de la chapa (`Prime_Mover_Left`) hay que **quitarle el mapa**, no solo cambiarle el color. Los materiales repintados se clonan antes, porque varias mallas comparten la misma instancia.
- El **logo va sobre la lona como panel suelto**, no pintado en la textura, igual que en el contenedor. Su posición lateral **se mide** (`SKIN` en `TruckModel.tsx`): la lona de un lado y la del otro no están a la misma distancia del centro, y con un valor único el logo quedaba metido dentro de la lona por un lado.
- **La carga ya no es un contenedor: es un lote de palés de azulejo** (`PalletLoad` en `Pallets.tsx`). Un palé suelto al lado de un camión de 17 m sería una mota, así que va en bloque de 3 × 2 × 2. Los contenedores siguen en el patio, de decorado.
- **La lona se abre y el lote entra por el costado.** Es lo que hace TJMI de verdad, y es la única entrada posible: este semirremolque tiene techo, así que por arriba no se puede.
- **La lona que se ve es nuestra, no la del GLB.** La del archivo se mide y se oculta: va cuantizada y sus ejes locales no coinciden con los del modelo, así que moverla era imposible. La nuestra son dos piezas: la de delante es fija y lleva el logo, y la de atrás se recoge contra el montante central encogiéndola en Z. El pivote está en el montante a propósito: así se recoge como un fuelle en vez de desaparecer.
- **El lote entra avanzando en X, no en Z.** Con cámara ortográfica de perfil, un movimiento en profundidad no se ve: entraría por el costado y parecería que no se mueve. Así que se para detrás de la cola, a la altura del piso, y de ahí entra deslizando hacia delante. Es la misma razón por la que el acto de la grúa va en tres cuartos.
- El lote se queda **pegado a la lona** (`CARGO_Z`), por delante de la carga que el GLB ya trae dentro. De perfil y en ortográfica eso no se distingue de estar dentro, y evita atravesar la carga del modelo. Es la misma licencia que ya se usaba con la grúa detrás del camión.
- **La tractora es blanca, con las rayas rojas y azules en la puerta y el escudo pequeño.** Es la librea real de la casa (ver `public/media/camion-01.jpg` y `camion-02.jpg`). El blanco no es puro: el fondo de la página es crema y una cabina blanca del todo no se recorta.
- **El semirremolque lleva lona por los dos costados.** El GLB solo trae la del lado que se renderizaba, así que en cenital se veía abierto por el otro y cantaba. La del lado lejano no se abre nunca.
- **El patio tiene naves al fondo** (`Sheds` en `TerminalYard.tsx`) y el vallado va con el paso corto. No es decoración: con la cámara acompañando al camión, lo que se ve moverse son los postes y los nervios de la chapa pasando por detrás. Sin eso, el arranque no se lee como avance.
- Esas naves **solo existen en la vista de perfil** y entran fundiéndose. Desde la cámara en tres cuartos lo que está al fondo sube muchísimo en pantalla y se plantan encima del titular; encenderlas de golpe a mitad de bajada se vería.
- **El logo del techo solo se enciende en cenital** (`roofRef`). La cámara de perfil no mira del todo horizontal, así que desde ahí el logo se ve aplastado por encima del techo y parece un fantasma.
- **El interior del semirremolque se vacía y se vuelve a llenar con carga nuestra** (`DROP_NODES` en `TruckModel.tsx` y `TrailerLoad` en `Pallets.tsx`). Del GLB se tiran tres cosas, y las tres por el mismo motivo: solo se ven con la lona abierta y todas estorbaban.
  - Los **pliegues de la lona del lado contrario** (`Object010`…`Object016`). El modelo la traía recogida en fuelles y, vista a través del hueco, se lee como jaulas metidas dentro del camión. Como el lado lejano ya lo dibujamos nosotros, sobran.
  - El **piso intermedio** (`Level_poles`, `C-Ext002`, `C-Ext003` y su tornillería). Este GLB es un *mezzanine deck trailer*; TJMI no usa doble altura y además partía la caja a media altura y no dejaba apilar.
  - La **carga del propio modelo** (`ChamferBox1189`, `Create_Wood_*`). Dentro de la caja queda a oscuras y no se lee: se comprobó pintándola de rojo y poniéndola y quitándola, y la imagen no cambiaba.
- La carga que se ve ahora es **palé de azulejo, el mismo que mueve la grúa**. Así, al abrirse la lona, lo que ya hay dentro y lo que entra son la misma mercancía.
- **Reparto dentro de la caja**: lo que ya iba cargado ocupa de `x ≈ 5,9` hacia la cabeza, y el lote que entra se para en 0,4–4,0. Ese metro y medio de hueco es lo que hace que se lean como dos cosas y no como un bloque continuo. Si mueves uno, mueve el otro.
- Esa carga interior va en **una sola fila** y solo cuatro torres. De perfil y en ortográfica la profundidad no se distingue, y la lona solo descubre la mitad trasera: más torres serían decenas de mallas que no se ven.
- Las mallas de carga del GLB van **instanciadas** (`EXT_mesh_gpu_instancing`). Si algún día hace falta filtrarlas en vez de tirarlas, no vale leer `matrixWorld`: hay que componer `matrixWorld × instanceMatrix[i]` y transformar el centro de la caja de la geometría. Leyendo solo la traslación salen posiciones que no son.
- **Las rayas de la cabina van en la puerta, debajo de la ventanilla.** Las medidas salen del propio modelo: el cristal lateral ocupa de `x` 16,1 a 17,3 y de `y` 1,98 a 2,84. Estuvieron a 2,04–2,30 y centradas en 15,5, o sea cruzando el cristal y sobre el panel del sueño, detrás de la puerta. Si tocas la cabina, vuelve a medir el cristal: es la referencia.
- Son **dos rayas**, roja fina arriba y azul más gruesa debajo, como en `public/media/camion-02.jpg`. **En la cabina no va el escudo**: en la tractora de verdad va pequeño y abajo, y a este tamaño se comía la puerta entera. El logo grande vive en la lona y en el techo.
- **El rótulo va dentro de la textura de la lona, no en un plano pegado por fuera** (`curtainSkin.ts`). Es lo que separa "rotulado" de "escrito encima": antes era un panel con material sin iluminar sobre una lona que sí recibe luz, así que el texto iba siempre a brillo máximo mientras la tela se sombreaba, y se leía como un montaje. Metido en la textura, el rótulo *es* la lona.
- **La lona lleva mapa de normales**, generado en el mismo sitio y del mismo campo de pliegues que el color (`curtainSkin.ts`). Pintar sombras en la textura solo simula el relieve desde una posición de luz concreta; con las normales cada pliegue reacciona a la luz de la escena. El rótulo también entra en el relieve: el vinilo pisa muy poco, pero lo justo para coger un filo de luz.
- **El relieve por luz solo no basta a este tamaño.** A 20 px de alto de lona, la diferencia entre `normalScale` 1 y 3,5 no se aprecia: se comprobó midiendo y mirando. Hace falta además contraste **pintado** en la textura. Lo que no se puede es subir el pintado sin más: con pliegues regulares y estrechos el costado pasa a parecer chapa ondulada. La solución fue hacer el campo de pliegues **irregular** (distinto ancho y distinta profundidad cada uno, sin ritmo) y entonces sí admite contraste.
- El rojo del rótulo es **oscuro y saturado**, no un rojo de aviso, y lleva una **oblicua mínima** hecha a mano (no la cursiva de la tipografía, para controlar el ángulo). La oblicua además rompe la verticalidad de los pliegues, así que las letras dejan de leerse como pegadas encima de las bandas.
- Las letras llevan prosa entre letras y mucho aire entre palabras, y ocupan el **60 % del largo de la lona**. Todo medido sobre la foto del cliente.
- El relieve se hace **repitiendo el texto desplazado** en un rojo oscuro antes de pintar el bueno. Es un canto, no una sombra difusa: es lo que tiene el vinilo de verdad y lo que hace que el rótulo no parezca pegado.
- **Las dos mitades de la lona comparten un mismo lienzo** y cada una enseña su tramo con `offset`/`repeat`. Así el rótulo queda centrado en la lona entera aunque esté partido entre la parte fija y la corredera. Y cuando la corredera se recoge, su trozo de textura se encoge con ella: el rótulo se pliega, que es lo que le pasa al de verdad.
- El rótulo va **un pelo corrido hacia la cola** (`TEXT_CENTRE`) y es a propósito: por el centro pasa la junta entre las dos mitades, y centrado del todo el pliegue partía "María" por la mitad al abrirse. Corrido, el corte cae en el hueco entre palabras y lo que queda a la vista es "Ibáñez". Cerrado, que es como se ve casi siempre, el metro de diferencia no se aprecia.
- **El costado del semirremolque son tres franjas, no una lona lisa**, copiando el camión real: tableros de aluminio abajo, lona en medio y perfil del techo arriba. Las dos claras **no se mueven al abrir**, que es justo lo que se ve en la foto del camión cargando. Sin ellas el semirremolque era un rectángulo azul plano.
- El azul de la lona **no es el azul corporativo**: es el del toldo real, mucho más vivo. El `#34548a` quedaba apagado al lado de la foto y el camión perdía el poco color que tiene. Sigue siendo acento; lo masivo de la página es el crema.
- **Hay un operario en la máquina** (`Operator.tsx`, antes `CraneOperator`). No es adorno: una máquina moviéndose sola se lee como un juguete, y lo que cuenta la intro es gente trabajando. Además da escala al puesto, que era un bloque sin referencia. Dónde se sienta en la carretilla está medido en «La carretilla que carga el camión».
- *(De la grúa:)* para que se viera hubo que **acristalar la cabina**, porque el GLB traía los cristales como un bloque gris opaco. En la carretilla no hace falta: el puesto es abierto, que es como son de verdad.
- Va con primitivas, como el resto de la maqueta, y con el **chaleco en el mismo naranja del rotativo**: a este tamaño el chaleco *es* el personaje, es lo único que se distingue. El casco achatado es lo que lo separa de una cabeza a secas cuando mide seis píxeles.
- Cuelga del grupo de la máquina, así que **gira con ella sin hacer nada más**, y mira hacia +X, que es adonde esa máquina trabaja.
- **Su sitio sale siempre de medir el GLB**, nunca de ponerlo a ojo. Es la regla que sobrevive al cambio de máquina.
- Respira con su propio `useFrame`, muy poco. Si se nota el movimiento, está mal: lo que tiene que notarse es que ahí dentro hay alguien.
- **La nave de `Facility` no sirve como fondo del patio**: está modelada para verse desde arriba y, sin perspectiva que la achique, ocupa el plano entero y su franja de marca cruza el titular. Ya se probó.

| # | Escena | Qué pasa | Texto |
|---|--------|----------|-------|
| 1 | Hero – Terminal | Fondo blanco. Empieza en tres cuartos: la grúa coge un lote de palés de azulejo de la plaza del patio, se acerca y gira a la derecha. La cámara baja a vista lateral, la lona del semirremolque se abre y el lote entra por el costado. Idle loop suave antes de hacer scroll. | Logo + claim corto |
| 2 | Carga completa | La grúa suelta el lote, la lona se cierra y la máquina sale de plano. La tractora arranca. Leve desaturación. | — |
| 3 | En ruta | La sección azul noche sube desde abajo y el camión queda "posado" sobre ella. Después la cámara gira de vista lateral a **cenital** y el camión cruza la pantalla hacia abajo por el lado derecho, con el logo en el techo del contenedor. Titular con efecto ScrambleText. | "Cada día, de Castellón a Madrid." / subtítulo + botón "Sobre nosotros" |
| 4 | Servicios | Ya sin 3D. Sección fijada (pin) con scroll horizontal. Palabra gigante "SERVICIOS" en contorno. Tarjetas de servicio entrando en horizontal. | Servicios reales de TJMI (ver `messages/es.json`) |
| 5 | La ruta (dentro de la intro) | Cámara cenital inclinada. La carretera se dibuja según avanza el camión, que sale de una nave y entra en otra, con las ruedas girando y rodadas sobre el asfalto. Cuentakilómetros atado al avance. | "Fiabilidad en cada kilómetro." + 420 km |
| 6 | CTA | Formulario de presupuesto y WhatsApp. | Formulario + WhatsApp |

## La portada (decisiones de contenido)

- **El titular del hero dice lo que hace la empresa, no un eslogan.** Era «Transportamos tu carga de forma rápida y segura», que puede firmarlo cualquier transportista del mundo. Ahora es «De Castellón a Madrid en 24 horas»: es la ruta, es la promesa y es lo único que no puede decir la competencia de la misma manera.
- **El subtítulo del hero estaba escrito y no se pintaba.** Llevaba tiempo en `messages` sin que ningún componente lo usara, y resulta que era la frase más concreta de toda la web: las más de 150 fábricas y la entrega puerta a puerta. El titular promete y esto es lo que lo sostiene; sin ello la portada afirmaba sin dar un solo dato. Si alguien vuelve a tocar el hero, que no se quede fuera otra vez.
- `hero.ctaSecondary` («Ver servicios») **sigue en `messages` y no se pinta**: el hero lleva un solo botón a propósito, porque el trabajo de la portada es pedir presupuesto. Está ahí por si se quiere recuperar.
- **Los titulares llevan `text-wrap: balance`** (en la regla de `.font-display`). El navegador reparte las líneas parejas en vez de llenar cada una hasta donde llegue, y en titulares cortos en mayúsculas es la diferencia entre dejar una palabra suelta colgando abajo o no. Es de lo que más delata un titular sin componer.
- **La escala de titulares está calibrada para Archivo**, no para Oswald. Archivo tiene más altura de x, así que los mismos cuerpos salían pequeños. Si se cambia de familia otra vez, hay que repasar los cuatro cuerpos **y** las cuatro interlíneas.
- **Las interlíneas las fija el acento, no el gusto, y esto fue un fallo de verdad.** Estuvieron en 0,86–0,90 con este razonamiento: «todos estos titulares van en mayúsculas, y sin descendentes el hueco entre líneas se ve mayor del que mide». El razonamiento es correcto **en inglés**. En español las mayúsculas sí suben: Á, É, Í, Ó, Ú, Ñ. Medido sobre Archivo, en fracción del cuerpo:

  | | sube sobre la línea de base |
  | --- | --- |
  | mayúscula sin acento (H) | 0,6875 em |
  | mayúscula con acento (Á É Ñ) | **0,8750 em** |

  O sea que **el acento se come 0,1875 em por encima de la altura de mayúscula**. Con interlínea 0,86, el hueco entre la base de una línea y el acento de la siguiente era de 0,86 − 0,875 = **−0,015 em**: negativo, se tocaban. Y se veía: en el cierre de la portada el acento de «QUÉ» se fundía con la pata de la «É» de «CUÉNTANOS». Afectaba al hero, a `InRoute`, al CTA, a `Route`, a las sedes y a las preguntas frecuentes, o sea a casi todos.
- **El mínimo lo fija la tipografía, no el cuerpo**, y por eso las tres escalas grandes se mueven juntas: 0,875 em es constante, así que el suelo es el mismo para un titular de 112 px y para uno de 36. Ahora van en **0,94 / 0,94 / 0,96** y dejan entre 5 y 7 px de aire. **Ninguna puede bajar de ~0,94 sin volver a chocar.** Si se cambia de familia, hay que volver a medir ese 0,875 con `measureText('É').actualBoundingBoxAscent` partido por el tamaño: cada tipografía pone los acentos a su altura.

## Las reseñas (`Reviews.tsx` y `content/reviews.ts`)

- **En toda la web no había ni una prueba social**: ni un logo de cliente, ni un testimonio, ni un «trabajamos para». Para una empresa que recoge en más de 150 fábricas de azulejo, lo que dicen esos clientes es **el único argumento que no se firma a sí misma**: todo lo demás de la página lo dice la propia casa.
- **Dónde va es parte de la decisión:** entre las sedes y el cierre. El orden queda «aquí estamos — esto dicen de nosotros — cuéntanos qué necesitas», o sea la prueba **justo antes de pedir algo**, que es cuando sirve. Más arriba, entre los servicios, sería una interrupción; detrás del cierre, no la lee nadie.

### De rejilla a carrusel

- **Fue una rejilla de tres columnas pegadas con un filete de un píxel**, que es el recurso de la banda de cifras y de las sedes. Allí funciona porque son datos; aquí no, porque **cada reseña es la voz de una persona distinta** y pegadas se leen como una tabla de opiniones. Ahora cada una es una tarjeta suelta con aire alrededor, y la fila se desplaza.
- **La cita va a cuerpo mayor que el texto normal.** Es lo único de toda la página que no lo firma la casa: no puede estar a tamaño de pie de foto.
- Cada tarjeta lleva **las iniciales de quien firma en un círculo**. No es un avatar inventado: sale del propio nombre, así que le pone cara a la cita sin suponer nada de nadie. Y una comilla grande en rojo muy claro detrás del texto, que es lo que dice «esto lo dijo alguien» antes de leer una palabra.
- **La fila es un scroll nativo con `scroll-snap`, no un carrusel con `transform` y un índice en el estado.** Así funciona sin JavaScript: se arrastra con el dedo, se mueve con el teclado y se puede tabular. Montado a mano habría que reimplementar esas tres cosas, que salen gratis con el scroll del navegador. Lo que añade `ReviewsTrack` son solo los mandos.
- **`data-lenis-prevent` en la fila es obligatorio.** Lenis engancha la rueda en toda la página y le hace `preventDefault`; sin ese atributo la rueda movería la página en vertical en vez de la fila en horizontal, y parecería que el carrusel está roto cuando lo que pasa es que nunca recibe el evento. Es lo mismo que necesita el panel del modal de servicios.
- **El punto activo se estira hasta ser una raya** en vez de solo cambiar de color. Un punto relleno entre puntos vacíos se distingue mal de un lunar más; una raya se ve desde lejos y además dice hacia dónde va la fila. Es el mismo gesto que el filete rojo que crece en las tarjetas del índice de la portada.
- **Los mandos se esconden si no sobra fila que mover.** Con dos reseñas en escritorio caben las dos, y unas flechas que no llevan a ninguna parte son mobiliario. Lo decide `ReviewsTrack` midiendo el ancho real, y lo vuelve a mirar al cambiar el tamaño de la ventana.
- **Sin estado de React para el punto activo.** Se escribe como atributo sobre cada botón desde el escuchador de scroll: un `useState` re-renderizaría la lista entera en cada evento, que son decenas por gesto. Misma regla que la barra del desfile de servicios.
- La barra de scroll nativa va oculta (`.sin-barra`): parte el diseño por abajo y además solo se ve en algunos sistemas, así que la fila se vería distinta según el equipo. Quien dice que hay más son los mandos, que para eso están.

### Vacía no se pinta, y eso no es un descuido

- **No hay ni una reseña de ejemplo en `content/reviews.ts`, y no debe haberla.** Una reseña inventada en una web es una reseña falsa aunque se haya puesto de relleno, y si se queda ahí el día que esto se publique el problema deja de ser de diseño.
- Por lo mismo, **en producción la sección no existe** mientras no haya reseñas: ni hueco, ni esqueleto, ni titular. Comprobado sobre el HTML construido: en la portada de producción no aparece ese `h2`.
- **En desarrollo sí se pinta el armazón**, con barras grises en vez de texto, para poder juzgar la maqueta antes de tener el contenido. Es la misma idea que `CoverPlaceholder` en el blog: enseñar la forma sin inventarse el fondo.
- **Van cuatro armazones y no tres, y es a propósito:** con tres caben en pantalla de escritorio y los mandos del carrusel se esconderían solos, así que no se podría ver la pieza que se está diseñando.
- **Para juzgar la tarjeta de verdad hay que meter reseñas de prueba, capturar y quitarlas**, como se hace con la pantalla de carga. Lo que no se puede es dejarlas: una reseña inventada publicada por error deja de ser un problema de diseño.
- **El armazón usa exactamente las clases de la tarjeta de verdad**, y eso costó una captura: con borde y esquinas propias se perdían los filetes de la rejilla, así que lo que se estaba previsualizando no era la maqueta que iba a salir. Un marcador de posición que no se parece a lo que sustituye no sirve de nada.
- El enlace a la ficha de Google **solo existe cuando hay ficha** (`GOOGLE_PROFILE`): uno a ninguna parte es peor que ninguno. Mismo criterio que los huecos `[PENDIENTE: ...]` de las páginas legales.

### Sin marcado de valoración, y conviene saber por qué

- No lleva `AggregateRating` ni `Review` para buscadores, y no es un olvido. Ese marcado sirve para pintar estrellas en los resultados, y **Google no admite que un negocio publique el suyo propio sobre sí mismo**; además no hay nota media comprobada que declarar. El día que las reseñas vengan de la ficha, se vuelve a mirar.

### Y cuando se ligue con Google de verdad

- **Traerlas por la API desde el navegador convierte a Google en un tercero**, así que caerían en el mismo consentimiento que los mapas y **la mayoría no las vería** —que es justo lo contrario de para lo que está la sección—.
- Lo que no tiene ese problema es traerlas **en el servidor** y guardarlas en `content/reviews.ts`: se actualizan solas y el visitante no habla con Google. Es más trabajo y es el camino que no mete a nadie en un lío.

## La pantalla de carga es el trayecto (`Preloader.tsx`)

- **Es lo único que va antes del 3D, y durante un tiempo fue un logo, una rayita de 160 px y un porcentaje.** O sea lo primero que ve todo el mundo, gastado en nada. Y el sitio es gratis: no cuesta ni un píxel de scroll, al revés que cualquier cosa que se meta encima del hero —que empujaría la intro, que es lo único que esta web tiene y la competencia no—.
- **Ahora la barra es el trayecto**: una línea de Almazora a Fuenlabrada con un punto que avanza y el contador en **kilómetros** en vez de en por ciento. Cuando el punto llega a Madrid, se abre la escena.
- **Y no es un adorno suelto: es la misma pieza que hay dentro.** Los dos extremos, el filete, el punto y la cifra son los de `RouteProgress` y `RouteOdometer`, con los mismos textos de `messages` y los mismos 420 km. Quien espera dos segundos aquí reconoce la pieza cuatro pantallas más abajo, cuando el camión la recorre de verdad.
- El ancho de la línea es **fijo y no un porcentaje de la pantalla**: fluido, en un monitor grande cruzaba medio escritorio y el punto tardaba una eternidad en moverse de forma visible.
- El tramo hecho y el punto van con `transition` y no con un bucle: el progreso llega a saltos —un GLB entero de golpe— y sin suavizar el punto daba brincos.
- **No se toca el tope de seguridad de 4 s**: si un archivo se atasca, esto se va igual. Una pantalla de carga que puede quedarse para siempre es peor que no tenerla.
- **Cómo mirarla, que cuesta más de lo que parece.** Se va en un par de segundos, así que hay que cazarla:
  - **Frenar la red es contraproducente.** Es lo primero que uno hace y es justo lo que impide verla: el trozo de JavaScript que la monta tarda entonces más que la ventana de captura y la pantalla **ni siquiera llega a existir**. Sondeando el DOM cada 50 ms durante nueve segundos con la red a 90 kB/s, no aparece nunca.
  - Lo que funciona es **congelarla**: poner `done` a `false` y el progreso a un valor fijo, capturar, y revertir.
  - Y con la red normal aparece sobre los **1,5 s** y dura un par de segundos, que es la ventana real.
- **El logo salía dos veces durante la carga, y ya no.** El navbar se pintaba por encima de la pantalla de carga. La sospecha que había escrita era la correcta —«no es el valor, es que uno de los dos está en otro contexto de apilado»— y era exactamente eso: este componente se renderiza desde `Experience`, que vive dentro de `<main class="relative z-10">`, y **un `z-index` solo compite con sus hermanos**. El `z-[100]` del preloader competía *dentro* de ese `main`, y el `main` entero (z-10) queda por debajo del navbar (z-50).
- Por eso subirle el número al preloader no habría hecho nada, y bajarle el del navbar habría arrastrado el menú de móvil, el botón de WhatsApp y el banner de cookies. Lo que lo arregla es **sacarlo a `document.body` con un portal**, igual que `ServiceDialog`, y por el mismo motivo: una capa que tapa la página no puede depender del apilado del bloque que la contiene.
- **Comprobado antes y después con la misma prueba** (`tests/perf/medidas/preloader.mjs`), que no mira el código sino que le pregunta al navegador qué elemento hay en el punto donde está el logo del navbar: antes el padre era `main` y encima salía el navbar; ahora el padre es `body` y encima sale la pantalla de carga.
- **Y esa prueba tiene una trampa que ya se pisó una vez:** hay que mirar **solo mientras el preloader tapa de verdad**. En cuanto termina se queda con `pointer-events-none` para dejar pasar los clics, y entonces `elementFromPoint` lo salta y devuelve lo de debajo. Midiendo sin esa condición salía «el navbar gana» incluso con el arreglo puesto — y la captura de pantalla enseñaba justo lo contrario.

## Las fotos de las sedes y el mapa (`Sites.tsx`, `MapEmbed.tsx`)

- **El hueco del mapa lo ve la mayoría vacío**, porque casi nadie acepta cookies de terceros: lo que queda es un párrafo centrado sobre crema con un botón azul, y eso **se lee como un error de carga**, no como contenido.
- **No se puede arreglar cargando el mapa desde el principio, y no es una opinión de estilo.** Un `iframe` de Google Maps pone cookies (`NID`, `SOCS`) y manda datos fuera del EEE en cuanto se monta. Cargarlo antes del consentimiento es exactamente lo que sanciona la AEPD, y la multa sería del cliente. La regla del proyecto —«nada de terceros se carga antes del consentimiento»— no está ahí por gusto.
- **Lo que sí lo arregla:** que el estado por defecto sea **una foto de la nave**, con la dirección y los dos botones encima. Todo el mundo ve un bloque con aspecto profesional desde el primer momento, sin pedir permiso a nadie, y quien quiere el mapa de verdad lo tiene a un clic. `MapEmbed` ya acepta esa foto.
- **Los dos huecos están declarados y vacíos a propósito** (`SITE_PHOTOS` en `content/media.ts`), con su `brief` al lado. El día que lleguen los archivos es una línea por sede. Lo que no se hace es rellenarlos con una foto de otro sitio: `camion-02.jpg` **sí** es el patio de Almazora, pero ya es la foto grande de Servicios, y la misma imagen dos veces en la misma página se lee como que no hay más.

## El índice de la casa (`Overview.tsx`)

- **Qué problema resuelve, con los números delante.** Medida la portada en pantallas completas: 19,4 en escritorio y 23,6 en móvil; la intro 3D se llevaba de la 0 a la 11,4, o sea el **59 %**; el primer servicio no se nombraba hasta la pantalla 11,4 y el formulario no aparecía hasta la 18 de 19,4. En una web B2B la mitad de la gente no pasa del 50-60 % de scroll: había un porcentaje grande de visitas que **nunca llegaba a leer qué vende la empresa**. La intro es el encargo y se queda; lo que no podía ser es que fuera el único camino.
- **Esto mueve el primer servicio de la pantalla 11,4 a la 4,2.**
- **Va entre el hero y la salida del camión, y el sitio es parte de la decisión.** Encaja con el guion en vez de pelearse con él: el camión acaba de cargarse, hay un compás, y después arranca.
- **No mueve ningún disparador**, porque cuelgan de `[data-scene]` y esta sección no lleva ese atributo.
- **Pero sí descolocó una escena, y aquí estaba escrito que no.** Lo que no se vio al meterla es que esta banda es **opaca** y mide más de una pantalla, y que `InRoute` arrancaba su disparador en `top bottom`, o sea **una pantalla antes de su propia sección**: justo la pantalla que la banda tapa entera. Resultado medido a 1280×900: el 29 % de la coreografía de `InRoute` ocurría detrás del panel. El camión se asomaba un instante por debajo del panel (304 px en pantalla), la cámara lo subía detrás de él, el suelo azul se llenaba sin que se viera, y cuando el panel por fin salía el camión volvía a entrar. Eso es lo que se veía como un parpadeo en escritorio. Arreglado: ver «El arranque de `InRoute`» en el reparto del scroll.
- Lleva fondo **opaco** y su `data-bg`: si fuera transparente se vería el 3D congelado detrás, que es justo lo que no se quiere enseñar.

### De resumen de servicios a índice de la casa

- **Esto fue durante un tiempo un resumen de los seis servicios**: el titular «Seis formas de mover tu mercancía», su entradilla, los seis con su descripción en rejilla y un botón de presupuesto. Cumplía lo de arriba y aun así estaba mal planteado, por dos motivos:
  1. **Era un folleto de una sola cosa.** Esta web tiene además cuarenta años de empresa en `/nosotros`, diez artículos y ocho preguntas contestadas, y desde la portada **no se intuía que nada de eso existiera**.
  2. **Repetía la sección de Servicios**, que viene unas pantallas más abajo con el desfile horizontal y las seis tarjetas enteras. Decir lo mismo dos veces no adelanta el mensaje, solo lo gasta.
- Ahora son **cuatro destinos** —Servicios, Nosotros, las preguntas y el blog— y cada uno lleva **un trozo de contenido de verdad**, no una etiqueta: lo que se lee es «8 · respuestas · mínimos de palés, gran formato, refrigerado y lo que no hacemos», no «Preguntas frecuentes». Un índice que solo nombra secciones no invita a entrar en ninguna.
- **Los seis servicios no se pierden: siguen nombrados dentro del bloque de Servicios.** Eso es lo que mantiene intacta la ganancia medida de arriba sin que la banda entera vaya de eso.
- Van como **texto y no como seis enlaces**, porque la tarjeta entera ya es un enlace y un enlace no puede llevar otro dentro. No se pierde enlazado interno: las seis páginas de servicio cuelgan del pie en toda la web.
- Los recuentos que se enseñan **salen del contenido**, no de `messages`. Misma regla que la cabecera del blog: un número a mano se queda viejo y nadie se acuerda de repasarlo. Y van por `useFormatter`, no por `toLocaleString()`: «13,6» y «13.6» son dos cifras distintas para quien lee.

### El titular dice algo; no señaliza

- **Llegó a encabezarse «Por dónde seguir», y eso era mobiliario**: una etiqueta de navegación ocupando **el primer `h2` que se lee de toda la página**. En ese punto el visitante sabe muy poco —el hero le ha dado la ruta y el plazo y poco más—, así que gastar ese sitio en señalizar era tirarlo.
- **La señalización no se pierde**: la hace el antetítulo de cada tarjeta, que es donde de verdad sirve. Y **ese antetítulo sí se gana el sitio**, al revés que los que se quitaron de las cabeceras de sección: allí repetían el encabezado, y aquí dice a qué página vas, que es lo único que el resto no dice. Es además lo que hace que la tarjeta se lea como pulsable sin escribirle un «Ver» debajo cinco veces.
- **Lo que no puede decir este titular es la ruta ni las 24 horas.** Ya lo dicen el hero, el titular de `InRoute` y la banda de cifras: **tres veces**. Una cuarta no añade nada.
- Lo que sí estaba sin decir en la portada, y solo aparecía dentro de `/nosotros`, es **la constancia**: que el camión sale todos los días laborables vaya como vaya. De ahí sale el titular de ahora, «El camión sale igual». Si se cambia, que sea por otra cosa que no esté dicha ya en la portada —el otro hueco libre es que las dos naves son nuestras y entre ellas no hay nadie más—.
- **La entradilla afirma dos cosas que solo el cliente puede confirmar**, y conviene no perderlas de vista: que **no se para en agosto** y que la ruta sale **con media caja igual que llena**. Lo segundo es lo propio de un servicio de línea y encaja con el resto de la web; lo primero es lo que más fácil se cae, porque media provincia cierra en agosto. Si deja de ser cierto, esa frase es lo primero que hay que tocar.
- **La cifra de la tarjeta de Nosotros se movió por esto.** Enseñaba «40 / años en la misma ruta», y la entradilla del titular nuevo acaba en «Cuarenta años saliendo de Almazora»: a 200 px de distancia eso no se lee como refuerzo, se lee como una errata. Ahora enseña «+4.000 m² / de almacén propio», que es el otro dato grande de la casa y además dice de dónde sale ese camión. **Si vuelve un titular que se apoye en los cuarenta años, hay que volver a moverla.**

### Tres formas de tarjeta, y es lo que lo hace visual

- Era una banda entera de texto sobre crema. Ahora el mosaico mezcla **tres cosas distintas**: una **lista** (el bloque alto de Servicios, con los seis nombres), una **foto** y tres **cifras** (los metros de almacén, los metros de caja y los dos recuentos).
- **La foto es la primera fotografía de verdad de toda la portada.** Lo de arriba es una maqueta 3D: por bien que esté, no demuestra que la empresa exista. Va en la tarjeta de Nosotros, que es donde una foto significa algo, y sale de `VIDEO_POSTER` (el mismo archivo que encabeza `/nosotros`). El hueco es mucho más pequeño que aquel, así que el ancho que el manifiesto declara allí ya cubre este de sobra: no hace falta una entrada nueva en `content/media.ts`.
- **El velo sobre la foto está medido, y el antetítulo es el que manda.** Es la línea que queda más arriba, o sea la que cae sobre la cabina blanca. Medido sobre los píxeles: con el velo cerrando en `night/20` daba **3,20** de contraste; subiendo el texto a `white/90`, **4,41**, que sigue por debajo del 4,5 que pide la WCAG para texto pequeño; con `night/58` queda en **5,43**, y las otras tres líneas en 7,7, 10,1 y 12,9. **Si tocas el degradado o la foto, vuelve a medirlo.**
  - **Trampa al medirlo:** no vale leer `getComputedStyle().color` y mezclarlo a mano con el fondo. **Tailwind v4 emite `oklab(0.99 0.00004 0.00002 / 0.7)`** para cualquier color con opacidad, y un parseo de números lo toma por RGB: dos de las cuatro líneas salían con un contraste absurdo (1,36) por eso, no por estar mal puestas. Lo que funciona es recortar la tira **con el texto y sin él** y comparar los píxeles.
- La variedad no es decoración: **seis celdas iguales se leen como una tabla**, y ya está escrito en este proyecto a cuenta de `/servicios` que una tabla no invita a entrar en ninguna de sus celdas.
- **Las cifras llevan su propio `clamp`** y no la escala de titulares, como las de `Route.tsx`: un titular puede partirse en dos líneas sin pasar nada, pero «13,6 m» partido es una errata.
- En móvil pasa a una columna (dos a partir de `sm`, con el bloque de Servicios a lo ancho) y no hay nada alternado: una sola columna con bloques que cambian de lado no se lee como ritmo, se lee como que algo baila.

### «Más dinámico» aquí no significa animado

- El criterio de diseño de este proyecto pide **una sola entrada orquestada en toda la página, y es la intro 3D**. Una banda que entrara animada justo al salir de ella competiría con el único momento que la página se permite. Así que lo que se mueve son transiciones de CSS: el **filete rojo que crece** en la tarjeta —el mismo gesto que abre la sección, a escala de tarjeta—, los **seis nombres que se encienden** de gris a tinta y la **foto que se acerca** un 4 %.
- **Está medido, no mirado**, que en este proyecto ya ha habido dos efectos montados que no se ejecutaban (la viñeta y las sombras de contacto): en reposo el filete mide 0 px, el fondo es `#f7f3ec` y los nombres van en `rgb(92,102,115)`; encima, 356 px, blanco y `rgb(17,21,28)`.
  - **Cuidado al comprobarlo con Playwright**: después de `scrollIntoViewIfNeeded` **Lenis sigue animando el scroll**, así que la tarjeta se desliza bajo el ratón y el `:hover` se reinicia. Midiendo a los 600 ms salían valores a medio camino —102 px de filete, el fondo casi sin moverse— y parecía una transición rota. Hay que esperar a que el scroll pare y **plantar el ratón en un punto fijo**.

### Lo que cuesta

- **1,04 pantallas en escritorio y 2,28 en móvil**, medido a 1280×900 y a 390×844. El resumen de servicios anterior costaba 0,9 en escritorio y ~1,2 en móvil: lo que ha subido es el precio de que cada destino cuente algo y de que haya una foto.
- **El CTA va discreto y es decisión.** Una línea de texto al pie —«¿Prefieres que te lo contemos nosotros?» + presupuesto + teléfono—, no un botón macizo. El navbar ya lleva el botón y vuelve en cuanto subes, y la portada cierra con una sección entera dedicada a pedirlo: un tercer botón a tamaño completo aquí sería la página apretando en el primer compás, que es justo cuando todavía no se ha ganado nada. El teléfono va **al lado y no debajo**: quien no quiere rellenar nada quiere llamar.
- **Lo que queda pendiente de esta misma línea:** `RoadIntro` mide 480 svh y ocupa 4,8 pantallas, el bloque más largo de la portada. Bajarlo a ~360 devolvería 1,2 pantallas y no obliga a tocar nada más —ese alto se subió precisamente para no tener que mover `ROAD_RUN`—. No se ha hecho porque cambia el ritmo de la escena, que está afinado.

## El recorrido del camión en `InRoute` (escena 3)

- **El camión no deriva hacia el borde derecho: se centra, lista y se va.** Son tres tiempos, y cada uno se consigue moviendo la cámara distinto respecto al camión, que es lo único que decide dónde cae en pantalla:
  1. `toCentre` (0,04–0,19): la cámara **adelanta** al camión por `centrePull` metros, justo los que lo separan del centro. Al acabar, está en mitad de la pantalla.
  2. Listando (0,15–0,34): la cámara le sigue al **90 %, no al 100 %**. Siguiéndolo del todo quedaba clavado en el centro y entonces lo único que se movía era el fondo, y eso se lee como que el camión está parado y la imagen se cae. Con un 90 % deriva despacio hacia la derecha: sigue avanzando **y se le nota**, sin irse de cuadro.
  3. `leaving` (0,34–0,46): la cámara **se para** y el camión sigue. Eso es lo que lo saca por la derecha, y es lo último que pasa, no lo primero.
- Antes esto era un seguimiento con fracción fija (`SETTLE_FOLLOW = 0,52`), y por eso el camión derivaba a la derecha desde el primer metro y se iba de cuadro enseguida.
- **`CENTRE_NUDGE` está medido sobre una captura, no calculado.** El centro geométrico del conjunto (la mitad de 17,3 m) no es su centro visual: la tractora es mucho más maciza que la cola, y con el cálculo limpio el camión quedaba 120 px a la derecha en un encuadre de 1280.
- **`SETTLE_RUN` pasó de 34 a 120 metros** y el recorrido ocupa de 0,03 a 0,52 de la sección.
- **Nada se mueve en vertical mientras el camión esté en pantalla, y el orden no es negociable:** primero se va el camión, después sube el azul, y solo entonces entra el texto. Uno detrás de otro y sin solaparse.
- Hubo un llenado **en dos fases** que subía el horizonte a media altura mientras el camión rodaba, para ir dándole fondo al texto. Se descartó porque se lee justo al revés de lo que se busca: con el camión quieto en el centro y el horizonte subiendo, lo que parece es que el camión está parado y que la imagen se cae.
- `fillGround` va ahora en **0,46–0,58**, detrás de `leaving`.
- **El llenado termina TARDE a propósito y se solapa con la entrada del titular**, y esto corrige un razonamiento equivocado que duró varias pasadas. Se exigía que el azul acabara **antes** de que el texto asomara, por miedo a que el texto blanco cayera sobre el crema, y eso dejaba casi media pantalla de azul hecho sin nada que mirar mientras el titular subía.
- **La exigencia sobraba: el suelo azul sube desde abajo y el texto entra también por abajo**, así que sus primeros píxeles caen donde ya hay azul. Dejando que el llenado siga mientras el titular llega, no hay momento muerto: se ve el azul cerrándose detrás del texto.
- **Y adelantar el llenado lo empeoraba.** Medido: pasarlo de 0,58 a 0,52 subió el hueco de 370 a 405 px. Lo que lo cierra es lo contrario, más el camión yéndose más tarde en fracción (`leaving` 0,40–0,52).
- **Recortar solo el `pt` tampoco vale, y conviene saber por qué:** al acortar la sección se encoge también su recorrido, así que las fracciones se mantienen y el hueco baja en la misma proporción que la velocidad del camión. Los dos están atados.
- **El bloque no puede ir fijado**: mide 757 px en escritorio y 1077 en móvil, o sea más que la ventana. Se midió antes de descartarlo. Si algún día se parte el contenido en dos, esa es la vía que de verdad elimina el recorrido del titular.
- Por eso `InRoute` deja un hueco grande antes del texto: si el texto blanco asomara antes, se quedaría sobre el crema. **Si vuelves a tocar `fillGround`, mueve también ese `pt`.**
- **`ROAD_ORIGIN_X` se deriva de `SETTLE_RUN`**, así que la carretera se recoloca sola cuando cambia el recorrido. No hay que tocarla a mano.

### Los pasos que se van encendiendo (`RouteSteps.tsx`)

- Los cuatro pasos del servicio se encienden de uno en uno según se baja, de izquierda a derecha, **en el mismo sentido en que rueda el camión**.
- **Aquí la numeración sí se la gana**, al revés que en las cabeceras de sección, donde se quitó: recoger, agrupar, transportar y entregar ocurren en ese orden y no en otro. Un marcador numérico sobre una secuencia real informa; sobre una lista que se lee en cualquier orden, decora y miente.

#### Lo que estaba mal era el contenido, no el tamaño de la letra

- **Los cuatro pasos repetían el subtítulo que tienen 150 px encima.** Decían «Recogemos / Agrupamos / Transportamos / Entregamos» con una línea cada uno, y el subtítulo decía «Recogemos, agrupamos y entregamos tu mercancía en 24 horas». O sea que la lista no añadía **ni un dato**: repetía cuatro veces, en columnas, una frase que el visitante acababa de leer. Eso es lo que la hacía pobre, no el tamaño ni el color.
- Ahora cada paso lleva **un sitio o una cifra** —Castellón, Almazora, 420 km, Madrid— y dice algo que solo puede decir esta empresa: las más de 150 fábricas de la provincia, los 4.000 m² de Almazora, que el camión sale todos los días laborables y que **entre una nave y la otra no interviene nadie más**, que era uno de los datos ciertos que la portada tenía sin usar.
- **El subtítulo se cambió a la vez y no es un extra.** Con los cuatro verbos encabezando la lista, dejarlo como estaba habría sido la misma repetición al revés. Ahora dice lo que la lista no dice: que la ruta va en los dos sentidos.
- **Ninguna afirmación es nueva**: todas estaban ya publicadas en el hero o en el índice. **No se han metido las dos que están pendientes de que el cliente las confirme** —que no paran en agosto y que la ruta sale con media caja igual que llena—; esa segunda sigue dicha en un solo sitio a propósito, para que el día que haya que tocarla sea un sitio y no dos.
- **El antetítulo de cada paso sí se gana el sitio**, al revés que los que se quitaron de las cabeceras de sección: allí repetían el encabezado y aquí dice **dónde** pasa cada cosa, que es justo lo que el título del paso no dice. Es lo que convierte cuatro verbos en cuatro paradas.

#### La vía

- Cada paso dibuja **su tramo de vía con un nodo a la izquierda**, y el tramo se llena de izquierda a derecha cuando le toca. No es adorno: cuatro bloques de texto sobre azul noche no se leen como un recorrido, y esto es un recorrido —el mismo que el camión acaba de hacer por encima—.
- El tramo **cruza el hueco entre columnas** (`--rail-gap`, que tiene que valer lo mismo que el `gap-x` de la rejilla) para que los cuatro se lean como una línea y no como cuatro subrayados sueltos.
- **El sobrante se recorta solo de lado, con `clip-path` y no con `overflow`.** Con `overflow: hidden` el recorte es por los cuatro lados y **los nodos de la primera fila salían partidos por la mitad**, porque suben 4 px por encima de la vía. Se cazó midiendo la mancha roja en la captura: salía de 9 px de ancho y menos de 9 de alto. Ahora mide 9 × 9.
- **El nodo va sin aro del color del fondo**, aunque sea el truco habitual para que parezca posado encima. El fondo aquí lo pinta el suelo del 3D, así que un aro tendría que acertar con ese azul exacto y cualquier desvío se vería como un halo —es el mismo problema que los cuatro bordes del degradado del azul noche—. La vía pasando por detrás del punto es además lo que hace una parada.
- El llenado va con **`transform: scaleX()` escrito a mano y no con la clase `scale-x-*`** de Tailwind, que escribe la propiedad `scale`: son dos propiedades distintas y se pisan en silencio. Ya pasó con la barra del desfile.
- **No es una entrada orquestada más.** Son transiciones de CSS, como el filete de las tarjetas del índice: esta página gasta su único momento orquestado en la intro 3D.
- **El marcado sale completo y visible; lo apaga el JavaScript al montar.** Son contenido, no adorno: sin JS o con movimiento reducido tienen que verse los cuatro.
- **No hay estado de React.** El disparador escribe `data-shown` sobre cada `<li>` y la transición la hace el CSS, igual que la barra del desfile de servicios.
- **El listado ya no intenta coincidir con el camión, y es deliberado.** Se probó y el resultado era peor: para que el texto blanco se leyera había que subir el horizonte con el camión aún en pantalla, y entonces parecía que el camión se paraba. Ahora los cuatro pasos se encienden uno a uno cuando la sección ya está montada en azul, que es cuando se pueden leer.

## La carretilla que carga el camión (`ForkliftModel.tsx`)

- **Sustituye a la reach stacker, y el motivo era geométrico, no de gusto.** Una reach stacker agarra contenedores **desde arriba** con un spreader y un semirremolque de lonas **tiene techo**: no hay forma de que meta un palé dentro. En `public/media/camion-02.jpg` se ve quién hace ese trabajo de verdad.
- **Modelo:** «Forklift» de KolosStudios, en poly.pizza, **CC-BY 3.0**. El crédito es obligación de la licencia y está puesto en el aviso legal. 134 KB, glTF 2.0, **sin texturas** —color plano en el material, que es el acabado de maqueta del resto de la escena—.
- **Va sin repintar y es decisión del cliente.** El amarillo que trae es el de una carretilla de verdad; repintarla a los colores de la casa la alejaría de la foto. La marca ya la llevan el camión y las naves.
- Al borrarla, la grúa se llevó **377 KB**: los GLB bajan de 2,10 a 1,72 MB.

### Medirlo costó dos errores, y los dos vuelven si no se leen

- **El nodo trae un cuaternión y escala no uniforme** (la conversión Z-up → Y-up de FBX2glTF). Multiplicar por la escala e ignorar la rotación da una caja de 1,42 × 2,31 × 0,85 plantada en `x ≈ 53`, que no es nada. **Hay que transformar las ocho esquinas** de la caja, no el mínimo y el máximo.
- **Cuál de los dos extremos es el frente hay que MIRARLO.** Se dedujo del reparto de materiales —el material oscuro llega hasta `z = 4,19`, así que ahí estaría el mástil— y era al revés: ese extremo es el contrapeso. Se vio poniendo la máquina un momento al lado del camión. El frente está en `z = 1,88`.

### La escala, y por qué 1,35

El mismo factor cuadra los tres ejes a la vez, que es lo que dice que es el bueno:

| | modelo | × 1,35 | contrapesada real |
| --- | --- | --- | --- |
| largo | 2,31 | **3,12 m** | 3,0–3,3 m con horquillas |
| ancho | 0,85 | **1,15 m** | 1,15 m |
| alto | 1,42 | **1,92 m** | ~2,1 m de techo protector |

Los 2,31 del archivo **incluyen las horquillas**: por eso el largo encaja en el rango de la máquina completa y no en el del cuerpo.

**El origen va en la punta de las horquillas, a ras de suelo.** Es el punto que de verdad se coloca: al situar la carretilla, lo que se sitúa es **dónde va a quedar el palé**. Con el origen en el centro habría que sumar medio vehículo en cada cuenta de la coreografía.

### El mástil no se puede animar, y eso manda en todo lo demás

- Los cuatro materiales no separan el mástil: `Material.002` lleva **2.182 vértices de 0,02 a 1,44 de alto**, o sea mástil, ruedas y techo protector en la misma primitiva. En la grúa las piezas sí se separaban por material (`BOOM_MATERIALS`); aquí no.
- Consecuencia: **la carretilla no eleva**. El lote viaja a la altura del piso del camión (1,20 + medio lote = **2,06 m**) desde el primer fotograma, porque la máquina **llega del almacén ya cargada**. Es la licencia que sustituye a todo el acto de levantar la carga.
- Si algún día se quiere el gesto completo, hay que partir la malla en Blender y reexportar. No se ha hecho: el cliente prefirió dejarlo tal cual.

### Qué cambió en la coreografía al cambiar de máquina

- **Fuera el tramo de levantar** (`lift`, 0,02 → 0,16). No hay nada que levantar.
- **Fuera el balanceo del lote.** Era un muelle empujado por la propia velocidad de la carga, y es lo que hace una carga **colgada de un cable**. Sobre horquillas va calzada contra el respaldo y es solidaria con la máquina. Dejarlo sería el mismo error que la pluma atravesando el techo, al revés: física de más.
- **El alcance deja de ser variable.** La pluma iba de 3,81 m a 4,47 según la altura; unas horquillas miden lo que miden, `FORK_REACH = 1,25`. La máquina va pegada al lote: su posición es `lote − 1,25`.
- **Y ahora sí entra en la caja.** La pluma tenía prohibido pasar de la cola porque al soltar atravesaba el techo. Unas horquillas van a 1,20 m, por debajo del piso: entran el metro y pico que hace falta y salen. Por eso la máquina **sigue al lote hasta el final** en vez de clavarse en el borde.

### Dos cosas que parecían gratis y sacaron la máquina de cuadro

- **Adelantar el avance a 0,02**, aprovechando el hueco que dejaba `lift`. Durante ese tramo la cámara todavía encuadra la pila del fondo: si la carretilla se va antes, se va sola. Vuelve a **0,14**, y los dos primeros compases son de ralentí con el lote ya en las horquillas.
- **Terminar el acercamiento en `z = 0,5`**, alineada con la lona, que es donde tiene que acabar. También la saca de plano: el encuadre en tres cuartos sigue a la máquina **solo al 50 %** en profundidad (`followZ`), así que cinco metros de más la tiran por abajo. El acercamiento termina en los mismos **−4,5** de la grúa y la alineación se hace después, en el relevo (`act`).
- Por lo mismo, **el lote se alinea con `act` y no con `swing`**: la máquina y su carga tienen que moverse juntas. Con `swing` el lote se deslizaba de lado hacia la lona mientras la carretilla seguía cinco metros por detrás, o sea saliéndose de las horquillas de costado.

### La retirada va antes y más lejos que la de la grúa

Heredó 0,78 → 1 con 12,5 m y **a 0,90 la carretilla seguía en cuadro**. El primer plano arranca en 0,84 y existe para que el camión esté **solo** en pantalla, que es el único rato en que se le miran los detalles; una máquina dando marcha atrás por el borde se come justo eso. Ahora son **18 m entre 0,74 y 0,95**. El ritmo sigue siendo de máquina y no de corte: una carretilla anda bastante más rápido que una reach stacker, así que retirarse antes es además lo propio.

### El operario se queda, y ahora se llama `Operator`

- Se llamaba `CraneOperator` y conducía la grúa. Al cambiar de máquina **no hubo nada que tocar de la figura**: es genérica —alguien sentado, con chaleco y casco— y lo único específico era dónde se sienta, que lo pone quien la usa.
- **Dónde se sienta está medido**, en metros de la escena: el capó amarillo acaba a **0,98** de alto y el techo protector va de 1,86 a 1,92. En una contrapesada el asiento va encima del capó, y como el origen de la figura es el suelo del puesto y el asiento le queda 0,42 por encima, el origen va a **0,56**. A lo largo, −1,8 deja el respaldo justo en el borde trasero del capó y la cabeza a 1,71, por debajo del techo.
- **Va FUERA del grupo del modelo**, igual que en la grúa y por lo mismo: ahí dentro hay un `scale` de 1,35 y la figura saldría un 35 % más alta, o sea un conductor de 1,55 m sentado.
- El rotativo baja de 4,35 m a **2,05**: estaba a la altura de la cabina de la grúa, que mide el doble.

### Un aviso que salió al pasar y no se ha tocado

`GROUND_Y` era «la altura del centro del lote apoyado en el suelo» y la usaba la grúa para saber de dónde recogerlo. Pero **las pilas de contenedores del patio también tiraban de ella** como altura de apoyo, y un contenedor no mide lo que un lote de palés: su media altura es `CONTAINER.height / 2`, no `PALLET_LOAD.height / 2`. O coinciden por casualidad, o las pilas llevan tiempo un pelo hundidas o flotando. Se ha renombrado a **`PILE_BASE_Y`** con el valor exacto que tenía y el aviso escrito: cambiarlo mueve el decorado del encuadre de apertura y merece su propia pasada con el arnés delante.

### Lo que el arnés dijo del cambio

Las **cuatro tomas del patio** se mueven entre 1,0 y 2,9 %, y **las once restantes dan 0,00 %**: el camión en ruta, el azul noche y la carretera entera, intactos. Es exactamente lo que tenía que pasar, y es el arnés haciendo su trabajo.

## Movimiento del 3D
- Todos los disparadores de la intro van a **`scrub: 1`, no `true`**. Con `true` la escena va clavada a la rueda y un acelerón la teletransporta. Si tocas uno, tócalos todos: van juntos para no desincronizarse.
- `Scene.tsx` usa **muelles amortiguados**, no solo interpolación directa: la pluma llega un pelo tarde respecto a la máquina, y la carga colgada se balancea empujada por su propia velocidad (se queda atrás al acelerar, se adelanta al frenar, y se para sola). Es lo que separa "animación" de "maquinaria".
- Esos muelles viven en **refs, no en estado de React**: cambian cada fotograma y no deben provocar ni un render.
- Usan `damp()` de `lib/utils.ts`, que es independiente de los fps. **No uses `lerp` a secas para seguimientos por fotograma**: a 120 fps iría el doble de rápido que a 60.
- El `delta` del frame se acota a 0,05 s. Sin eso, al volver de una pestaña en segundo plano llega un salto enorme y los muelles pegan un latigazo.
- La respiración de la carga ya no se apaga al primer scroll, solo baja: si no, la escena se queda muerta mientras alguien lee el titular.
- **El arranque del camión (`groundT`) va al principio de su sección, no repartido por toda.** La cámara empieza a subir en `fillGround` (0.22) y a partir de ahí el camión queda fuera de cuadro: si el recorrido dura más, la mayor parte pasa sin que se vea y parece que no avanza. **Se nota sobre todo en monitores de PC**, anchos y bajos, donde la cámara lo pierde mucho antes que en un móvil alto. Si tocas `fillGround`, revisa `groundT`.

## Reparto del scroll (leer antes de tocar alturas o rangos)

- **El disparador del hero acaba en `bottom bottom`, no en `bottom top`.** Es justo donde su bloque `sticky` suelta el titular, así que toda la animación de carga transcurre con el texto delante. Con `bottom top` sobraba una pantalla entera al final: sin titular, con el camión convertido en una tira al fondo y, en móvil, con media pantalla de crema vacía. Por eso el hero mide **420svh**: el disparador se come una pantalla, así que el recorrido útil sigue siendo el de siempre.
- Ese cambio tiene un segundo efecto, y es el importante: **`InRoute` empieza a contar exactamente cuando el hero llega a 1**, en vez de una pantalla antes. Antes se solapaban, y por eso el camión arrancaba con la lona todavía abierta y el suelo oscuro se lo comía antes de que se le viera avanzar.
- El hueco de arriba de `InRoute` (`pt-[240svh]`) no es relleno: dentro caben el arranque del camión y la subida del azul noche, por ese orden. El texto es blanco y no puede asomar antes de que el fondo esté hecho.

### El arranque de `InRoute`, y por qué no es `top bottom`

- **Arranca en `top top`: cuando el índice opaco ya ha salido de pantalla, no cuando esta sección asoma por abajo.** `top bottom` es lo correcto **mientras lo que haya encima deje ver el 3D**; encima de `InRoute` hay una banda opaca de más de una pantalla, así que esa regla se volvía en contra y la escena se animaba detrás del panel. Medido: el camión aparecía 304 px, desaparecía durante 400 px de scroll y volvía. Se midió aislando el azul de la lona **solo por debajo del borde inferior de la banda**; contándolo en toda la pantalla no sirve, porque la tarjeta oscura del índice también es azul y el perfil que sale es el de la banda, no el del camión.
- Esto lo pide la sección con **`data-scene-start`**, no `ScrollChoreography` por su cuenta: el resto de escenas siguen en `top bottom`, que es lo que les toca.
- **Y el hueco de arriba subió de 140 a 240svh a la vez, que es la otra mitad del arreglo.** El disparador medía antes «una pantalla + la sección» y ahora mide «la sección» a secas; sin compensar, la misma coreografía se habría comprimido un 30 % y todo iría más deprisa. Con las 100svh de más vuelve a medir ~3.050 px y **ninguna fracción afinada cambia de sitio ni de velocidad**. Si tocas una de las dos cosas, toca la otra.

### El titular tiene que leerse sobre azul entero, y no lo hacía

- **El fallo:** el llenado de azul iba de 0,48 a 0,68 y el bloque de texto empieza a asomar por abajo en la fracción **0,406** —eso no lo fija una constante, lo fija el hueco de arriba de la sección—. O sea que el titular entraba, cruzaba la pantalla **entera** y llegaba arriba justo cuando el azul acababa de cerrarse. Medido a 1280×900: a media travesía quedaba una franja de 258 px del patio, con una nave gris, ocupando el cuarto superior de la pantalla mientras el titular se leía debajo.
- **Y había un segundo error de orden escrito en el propio código:** la sección dice «primero se va el camión, después sube el azul, y solo entonces entra el texto», pero el camión salía hasta 0,52 y el texto ya estaba en pantalla desde 0,406. Los dos actos a la vez.
- **Arreglado adelantando el relevo entero**, no el texto: el recorrido acaba en 0,40, la salida va 0,30 → 0,40 y el llenado 0,40 → 0,50. Así el azul se cierra con el titular todavía asomando por abajo, que es donde ya hay azul, y para cuando se lee hay color de borde a borde. Medido igual: el fondo pasa del 59 % al **97 %** de azul en el punto que estaba mal.
- **El hueco que esto podría reabrir no se abre.** La nota anterior decía que adelantar el llenado lo empeoraba, y era verdad **mientras el camión saliera tarde**: entre que se iba y que llegaba el texto quedaba un vacío. Adelantando los dos a la vez, entre el camión y el texto no hay ni un cuarto de pantalla, y durante ese rato el azul está subiendo.
- Lo que se gana se ve: la banda se levanta y detrás está el **primer plano del camión entero**, que es justo el momento para el que existe ese plano. Antes la banda se levantaba y el camión ya se había ido.
- Orden de los tramos dentro de `inRoute`, en `Scene.tsx`: el camión corre (`groundT`), el suelo se posa (`settleGround`) y después llena la pantalla (`fillGround`). **El recorrido tiene que acabar antes de que empiece a llenar**, o se gasta fuera de cuadro. Si tocas uno, revisa los tres.
- La salida del texto de `InRoute` (`ScrollFade`) va al final del tramo. Con la salida más temprana el bloque de pasos se apagaba todavía en pantalla, y en móvil, donde ocupa mucho más alto, parecía que la sección ni llegaba a aparecer.
- **El bloque de texto de `RoadIntro` no lleva velo, y no hay que volver a ponerlo.** Hubo uno en móvil, un degradado crema por detrás del bloque entero, para que el texto se leyera sobre las naves. Resolvía la lectura y se cargaba la escena: en una pantalla estrecha ese rectángulo tapa media pantalla y lo que se ve es una mancha, no un camión rodando. Lo que de verdad lo resuelve es el **encuadre**: en móvil el bloque se va abajo (`items-end`) y la cámara cenital mira por delante del camión, así que el trazado ocupa la mitad de arriba y el texto la de abajo y dejan de pelearse por el mismo sitio. El halo por letra remata lo que quede.
- `quarterDrop` **sube más en móvil que en escritorio** (0,29 frente a 0,15). Allí el titular va arriba y la maniobra abajo, y entre los dos quedaba una franja de crema vacía de más o menos un octavo de pantalla. En escritorio no pasa, porque el texto está al lado y no encima. Si lo subes más, comprueba que la pluma de la grúa no llega al titular.
- **El primer plano del camión** (`closeUp` y `TRUCK_FRAME` en `Scene.tsx`): cuando la grúa ya se va, la cámara se cierra y se centra en el camión, y se vuelve a abrir en cuanto arranca.
- **Y el bloque de texto del hero se aparta justo ahí** (`ScrollFade` en `Hero.tsx`, 0,84 → 0,98, los mismos números que `closeUp`). Ese momento existe porque es el único rato en que el camión está solo en pantalla y se le pueden ver los detalles —el rótulo de la lona, las rayas de la cabina, el operario dentro de la grúa—, y con el texto encima **no llegaba a cumplirse**: el plano se cerraba, el camión crecía, y lo que ganaba en tamaño lo perdía debajo del titular.
- Ese `ScrollFade` lleva **`start="top top"` y `end="bottom bottom"`, no los de por defecto**, y es lo que más fácil se pasa por alto: el disparador normal de `ScrollFade` mide la sección cruzando la pantalla entera y el de `ScrollChoreography` mide otro tramo, así que una fracción del uno **no es la misma fracción del otro** y el fundido caía medio pantallazo antes de que el plano empezara a cerrarse. Si tocas `closeUp`, toca también estos números.
- **En el hero no hay botón de presupuesto**, y no es por falta de sitio: el navbar ya lleva uno idéntico y vuelve en cuanto subes, así que eran dos botones iguales en la misma pantalla —que es lo que se lee como que la página aprieta— y encima el del hero caía sobre la lona y tapaba el rótulo. `hero.ctaPrimary` sigue en `messages` por si se quiere recuperar. En escritorio además **baja** un poco la línea de suelo: al crecer, el techo del semirremolque se metía debajo del titular y del botón. En móvil hace lo contrario, sube hacia el centro, porque allí el texto va arriba y el camión pegado abajo deja medio plano vacío.
- En móvil la línea de suelo va bastante más alta que en escritorio. La pantalla es muy alta, el camión es una tira horizontal, y pegado al borde de abajo queda lejísimos del texto.

## Iluminación del 3D
- El Canvas va con `shadows="soft"`. **Hay sombras reales**: la grúa, los contenedores y el camión proyectan sobre el patio.
- La luz que proyecta **viaja con el punto que mira la cámara**. Solo se traslada, nunca cambia de dirección, así que la escena se ilumina igual siempre; lo que se mueve es el recuadro donde se calcula la sombra, para no gastar resolución en vacío. En móvil el mapa de sombras va a la mitad.
- Los reflejos vienen de un `Environment` montado con `Lightformer` **dentro de la escena**. Nada de HDRI descargado: sería una petición a un tercero y va contra la regla de no cargar nada de fuera sin consentimiento. `frames={1}` lo calcula una vez.
- **No hay mapeo de tonos** (`NoToneMapping` en `Experience.tsx`), y es la decisión que desatascó todo lo demás. Por defecto three aplica ACES Filmic, una curva para render fotorrealista que comprime las luces y las desatura; esta escena es lo contrario, una maqueta de colores planos, y esa curva era la que saturaba a blanco cualquier crema. De ahí venía el parche de pintar el suelo sin luz.
- **La escena salía apagada y la causa era un número, no el gusto: faltaba un factor π.** Durante tres pasadas se subió la luz de diez en diez por ciento (1,02 → 1,13 → 1,25) y se recalculó el color del suelo otras tantas veces, y seguía viéndose como un día nublado. El motivo: three reparte la luz difusa con la fórmula de Lambert, que **lleva un 1/π dentro**. O sea que una superficie mirando hacia arriba no sale con su color exacto cuando la luz que recibe suma 1,0, sino cuando suma **π ≈ 3,14**. Calibrada a 1,0 la escena rendía a un **tercio** de lo que debía.
- **Las tres intensidades están calculadas, no puestas a ojo**, y suman π:

  | | intensidad | × coseno | aporta |
  | --- | --- | --- | --- |
  | hemisférica | 2,11 | 1 | 2,11 |
  | principal | 1,64 | 0,479 | 0,79 |
  | relleno | 0,55 | 0,44 | 0,24 |
  | | | | **3,14** |

- **Está medido, no estimado.** Leyendo los píxeles de una captura con `pngjs`: el rojo medio de la escena pasó de **139 a 214** (el valor que toca para un crema `#f7f3ec` es 247), y el suelo del patio pasó de renderizar 129,127,124 —un gris medio— a su color de material.
- **Y por eso el color del suelo volvió a `#f1ece4`.** Las tres compensaciones anteriores (`#d9d4cd`, `#c4c0ba`) eran parches para tapar el error de escala: con la luz bien, el material renderiza en su color y no hay nada que compensar. Si vuelves a tocar las intensidades, **comprueba que siguen sumando π antes de tocar ningún color**.
- **El reparto entre ambiente y principal decide la sombra.** Como el suelo recibe sombras **físicas** y no un velo al 26 %, una principal demasiado fuerte hace que las vigas de la nave rayen el patio como una persiana. Con el reparto actual queda a 2,35 a la sombra contra 3,14 a la luz. **Si subes la principal, mira el patio entero y no solo el camión.**
- Por lo mismo, **las vigas de la nave van cada 11 m y no cada 6**: ese paso estaba afinado para el velo, no para sombra de verdad.
- **El suelo del patio es un solo plano iluminado**, y antes eran dos: uno sin luz con el color exacto y encima otro invisible que solo pintaba sombras. Aquel parche existía por el mapeo de tonos. Quitado este y recalculadas las intensidades, un material normal ya se queda en su color, así que el suelo recibe luz y sombra como cualquier otra cosa y la escena deja de tener dos reglas.
- **Niebla de distancia** (`<fog>` en `Scene.tsx`): lo que está al fondo se aclara hacia el color del fondo. Es lo que impide que la escena se lea plana. Su color lo va cambiando `useFrame` entre el crema y el azul noche, porque si se quedara en crema, en la sección oscura el fondo del patio se aclararía y cantaría.
- **Luz de nave** (`Canopy` en `TerminalYard.tsx`): vigas invisibles a 13 m que rayan el patio con bandas de luz y sombra. El truco es `colorWrite={false}`: no pintan nada pero siguen entrando en el mapa de sombras. **No sirve `visible={false}`**, que las saca también del mapa y hace desaparecer el efecto.
## Profundidad de la escena (lo que la saca de plana)

- **La bruma no es el color de la página, pero tampoco puede ser gris.** Lo primero que se probó fue el crema exacto del fondo, y lo lejano no se alejaba: desaparecía, y las dos filas de contenedores salían del mismo valor. Lo segundo fue un gris frío (`#e9e7e3`), y ese fue el error que el cliente señaló tres veces seguidas: **toda la escena parecía un día lluvioso**. Un gris en el aire no se lee como distancia, se lee como mal tiempo. El valor de ahora (`FOG_DAY = #f0e9dd`) es **cálido y claro, solo un punto más oscuro que el papel**: separa lo lejano sin apagar nada.
- **Y el alcance importa tanto como el color.** Con la bruma empezando a 24 m, en la vista en tres cuartos el primer término ya salía lavado: la grúa y el camión están ahí mismo. Ahora `FOG_QUARTER` arranca en 40 y llega a 200, así que lo cercano sale limpio y lo que se vela es solo el fondo. Si la escena vuelve a verse apagada, **mira el `near` antes que el color**.
- Donde acaba el suelo del patio y empieza el crema de la página hay ahora una **línea de horizonte**. No está dibujada: sale sola de que la bruma y el fondo ya no sean el mismo color. Es lo que convierte «objetos sobre papel» en «un sitio».
- **El camión se orienta con una cuerda de la curva, no con la tangente** (`roadNose` en `Scene.tsx`), y esto es lo que lo mantenía dentro del asfalto. La causa del fallo estaba en un detalle del modelo: **su origen está en la cola**, así que los 17,3 m se extienden hacia delante desde el punto de la curva, no 8,65 a cada lado. Orientándolo con la tangente de la cola, el morro se iba por la recta mientras la carretera giraba.
- **Y va centrado sobre el eje, no apoyado en él.** Con la cuerda a secas la cola y el morro quedan clavados en el eje y todo el bombeo se va hacia dentro de la curva; corriendo el camión **medio bombeo hacia fuera**, el error se reparte entre los dos lados.
- **Todo esto está medido, no estimado.** Recorriendo la curva entera y mirando las cuatro esquinas del camión contra el eje:

  | | Se sale del asfalto | Se desvía del eje |
  | --- | --- | --- |
  | Tangente (lo que había) | **3,49 m** | — |
  | Cuerda | 0,00 m | 2,21 m |
  | Cuerda + centrado (ahora) | **0,00 m** | **1,31 m** |

  La media calzada son 5 m y la media anchura del camión 1,25, o sea 3,75 m de margen real.
- Al final de la curva la cuerda se queda sin carretera por delante y se degenera; ahí se vuelve a la tangente, que para entonces ya es recta.
- **El camión se salía al final del trayecto, y el fallo llevaba ahí desde el principio.** El origen del modelo está en la cola, así que si la cola recorre la curva hasta `t = 1`, el morro queda **17,3 m más allá del último metro de asfalto**. Medido recorriendo el trayecto entero y mirando las seis esquinas del conjunto contra el eje: **empezaba a salirse en el 95 % del recorrido y terminaba 12,35 m fuera**, flotando sobre el fondo. Y pasaba justo en la llegada, que es cuando la cámara se cierra sobre el camión.
- **La solución es que el avance mande el morro y no la cola** (`tailSpan` en `Scene.tsx`): la cola recorre el trazado **menos un camión**, así que el morro llega al muelle y la cola se queda un camión por detrás, que es lo que pasa de verdad. Medido igual: **0,00 m fuera, en ningún punto**.
  - `roadT` sigue siendo el viaje de 0 a 1 —de ahí comen el cuentakilómetros y el asfalto que se dibuja—, y lo que se recorta es solo **dónde se coloca el camión**. El giro de las ruedas sí usa el recorrido real (`tailT`), que es el suelo que pisa la rueda.
  - Tiene un efecto de regalo: `noseT` ya **nunca** se pasa de 1, así que la cuerda mide un camión entero de principio a fin y **la salvaguarda del `lengthSq() < 1` deja de dispararse**. Antes, en el último 7 % del trayecto la cuerda se iba encogiendo de 17,3 m a 0 y el rumbo salía de un trozo cada vez más corto.
- **Y conviene no confundir este fallo con el de la orientación**, que es otro y ya estaba arreglado. Medido por separado, recorriendo la curva entera:

  | | se sale del asfalto | giro máximo |
  | --- | --- | --- |
  | Tangente (lo más viejo) | 12,35 m | 20,0 °/1 % |
  | Cuerda + centrado | 12,35 m | 7,2 °/1 % |
  | Cuerda + centrado + morro al muelle | **0,00 m** | 6,7 °/1 % |

  O sea: la cuerda arregló **el rumbo** (de 20 a 7 grados por cada 1 % del trayecto, que es lo que se veía como bandazos) y no tocaba el otro problema para nada. **El rumbo no tiene saltos**: medido paso a paso, lo más brusco son 17° en un 2,5 % del recorrido, y es una curva cerrada de verdad, no una discontinuidad.
- **La cámara cenital mira por delante del camión, no a él** (`ROAD_LEAD` en `lib/route.ts`). Mirándolo a él salía clavado en el centro y medio encuadre lo ocupaba el asfalto **ya recorrido**, por debajo. Se leía como que algo estaba mal puesto, y con razón: nadie encuadra un vehículo en marcha dejándole el camino hecho delante. El adelanto se cierra al llegar, para que la cámara alcance al camión justo cuando frena.
- Ese adelanto va en **fracción de la altura del encuadre, no en metros**: entre un monitor y un móvil caben casi tres veces más metros de carretera a lo largo, así que los mismos metros moverían al camión una fracción de lo que debería.
- **El encuadre de la carretera en móvil es más cerrado, no más abierto** (`roadFrameWidth`). Con una pantalla tan alta, un encuadre ancho abarcaba 112 m de carretera a lo largo: el trazado salía como una culebra fina y, sobre todo, no daba tiempo a dibujarlo, así que el asfalto se cortaba en seco a media pantalla.
- **Y estuvo demasiado cerca, sobre todo en escritorio.** Fueron 38 en móvil y **45 en escritorio**, y a 45 el asfalto no se leía como una carretera sino como una mancha gris cruzando la pantalla: el camión mide 17,3 m y el fondo del encuadre en un monitor de 1280×900 era de 31,6 m, o sea que **el camión se comía el 55 % de la profundidad** y no cabía ni una curva entera. Ahora son **80 en escritorio** (fondo de 45 m, el camión en el 38 %) y **43 en móvil**, que se sube menos a propósito porque ahí cada metro de ancho son 2,2 de fondo. En escritorio entra la ese completa y, de regalo, el bloque de texto de la izquierda deja de caer sobre el asfalto en casi todo el recorrido.
- **Ensanchar el encuadre no deja la carretera cortada**, y es porque lo que cuelga de ese número se recoloca solo: el adelanto de la cámara va en fracción de la altura del encuadre (`ROAD_LEAD`) y el asfalto dibujado por delante se calcula de ahí (`aheadFraction` en `Road.tsx`).
- Y **cuánto asfalto va dibujado por delante se calcula, no es un número fijo** (`Road.tsx`). Es el mismo problema por el otro lado: el adelanto que le hace falta al móvil llenaba de negro la pantalla en escritorio y tapaba el texto. Se saca de la profundidad del encuadre dividida por el largo de la curva. Por eso `roadFrameWidth` vive en `lib/route.ts` y no en `Scene.tsx`: lo necesitan la cámara y el trazado, y si se desincronizan se nota enseguida.
- **El asfalto recibe luz** (`meshStandardMaterial` en `Road.tsx`). Era un negro plano y en la cenital ocupa media pantalla: se leía como una cinta recortada y no como una carretera. Iluminado coge el gradiente de la luz principal, así que tiene cara clara y cara en sombra según gira el trazado. El color **subió** de `#11151c` a `#23262c` porque ahora la luz lo multiplica: con el valor de antes, iluminado, seguía siendo casi negro.
### Lo que hace que el asfalto parezca una carretera (`Road.tsx`)

- **La calzada era una cinta negra con una discontinua en medio y se acababa contra el crema con un corte seco.** Eso es lo que más la delataba vista desde arriba: no tenía ni borde ni carril. Ahora lleva tres capas más, y las tres salen del mismo generador de cintas (`ribbon`), que admite un desplazamiento lateral para que cualquier cosa pegada al borde **siga la curva sola** si mañana se cambia el trazado.
- **Arcén.** Una cinta 1,6 m más ancha por cada lado, por debajo del asfalto. Le da canto a la calzada y, lo que más importa, mete un valor intermedio: sin él, el salto de (35,38,44) a (247,243,236) era el contraste más duro de toda la escena. Va en un gris **cálido** (`#c4bbab`) y recibe luz como el asfalto; todo lo gris frío de esta escena se ha leído siempre como «día lluvioso».
- **Líneas de borde.** Dos continuas a 55 cm del borde, como las de verdad. Sin ellas no se veía dónde acaba el carril.
- **Rodadas.** Las pedía el guion desde el principio y nunca estuvieron. Van justo donde pisan las ruedas —el camión circula centrado sobre el eje, así que su vía cae en ±1,25— y **apenas más oscuras que el asfalto**. Medido sobre una fila de píxeles que cruza la calzada: el asfalto va a 57 y las rodadas a 47, o sea **11 niveles**, que es el mismo margen que se le dio a las sombras de contacto. Si se leen como dos rayas, están mal puestas.
- **Las cuatro tiras van en el mismo plano** (`y = 0.06`, el de la discontinua) y no en alturas distintas, y se puede porque **no se solapan de lado**: la discontinua ocupa ±0,19 del eje, las rodadas de 0,73 a 1,88 y las de borde de 4,36 a 4,54.
- **Cada tira es su propia malla, y eso no es descuido.** `setDrawRange` recorre el índice en orden, así que con las cuatro en una sola geometría se habría dibujado una entera antes de empezar la siguiente, en vez de avanzar las cuatro a la vez según se descubre el asfalto. Son cinco llamadas de dibujo más sobre las 273 de esa escena.
- **El arcén se descubre exactamente con el asfalto.** Si fuera por detrás se vería asomar la grava por delante de la calzada; si fuera por delante, la calzada sobre el crema.

### El relevo a la carretera: casi una pantalla de azul vacío

- **Medido antes de tocar nada: 785 px seguidos (0,87 pantallas) de azul noche sin texto ni asfalto**, entre que se va el titular de `InRoute` y aparece la carretera. Es lo que se veía como «tarda mucho en entrar».
- Venía de tres cosas que empezaban tarde: la cámara no se movía hasta 0,18 de la escena, el suelo oscuro no se retiraba hasta 0,40 y el asfalto no se dibujaba hasta 0,42.
- **Que la cámara espere a 0,16–0,18 es correcto y no se toca**: el disparador de esta escena arranca una pantalla antes de su sección, así que hasta ahí lo que se ve todavía es el final de `InRoute`. Lo que sobraba era todo lo demás. Ahora la cámara sube en 0,16 → 0,30, el suelo se retira en 0,19 → 0,24 y el asfalto empieza en 0,24.
- **La sección bajó a 420svh y hubo que devolverla a 480.** El recorte en sí
  estaba bien; lo que no se vio es que el final del disparador **también** se
  había movido a `bottom bottom`, o sea una pantalla antes. Entre las dos
  cosas el tramo pasó de 5.220 a 3.780 px: **todo lo de dentro se comprimió un
  28 % sin tocar una sola fracción**, y eso es lo que el cliente vio como que
  la carretera «entra y sale muy brusco».

#### El ritmo se mide en píxeles de scroll, no en fracciones

- **Es la trampa de este reparto y conviene tenerla delante:** una fracción no
  dice cuánto dura nada. Si el tramo se encoge, la misma fracción dura menos
  y la escena entera se acelera sin que nadie haya tocado un número de los que
  se leen en el código.
- Medido, de lo comprimido a lo de ahora:

  | tramo | antes (L = 3.780) | ahora (L = 4.320) |
  | --- | --- | --- |
  | giro de cámara | 340 px | **994 px** |
  | fundido de entrada | 340 px | **605 px** |
  | recorrido | 2.041 px | 2.160 px |
  | posarse en la nave | 529 px | 691 px |
  | fundido de cierre | 265 px | **518 px** (ver abajo) |

- **Con 480svh y final en `bottom bottom` el tramo mide 4.320 px, que es justo
  el recorrido que antes se veía.** De los 5.220 originales, los últimos 900
  ocurrían con el bloque fijo ya subiendo, o sea fuera de pantalla. Así que
  recuperar el alto no devuelve la espera vacía: devuelve los fundidos.
- **El telón se abre más despacio que lo que la cámara tarda en girar**, a
  propósito: al descubrirse todavía le queda un pelo de recorrido, así que se
  lee como una cámara llegando y no como una cámara que ya estaba puesta.
- Resultado medido de lo que sí se recortó: **146 px (0,16 pantallas) de azul
  sin nada**, de los 785 originales.

#### La escena tiene que irse moviéndose, no apagándose

- **El fallo de fondo no era la duración, era que no se movía nada.** La
  entrada gira la cámara entera de perfil a cenital (`topView`, 0,19 → 0,42):
  cambian la posición, el *arriba* de la cámara, el punto al que mira y el
  ancho del encuadre. El telón solo tapa la costura. La salida, en cambio,
  dejaba la cámara posada sobre la nave desde 0,86 y lo único que ocurría
  después era el fundido. Se leía, con razón, como «se apaga la luz».
- Ahora hay **`roadLeaving` (0,86 → 1)**: el encuadre se abre al **190 %**, así
  que la nave, el camión y la carretera se van haciendo pequeños mientras el
  telón se cierra encima. Arranca en 0,86, justo cuando la cámara acaba de
  posarse, y por tanto **antes** de que el telón empiece en 0,88 — igual que a
  la entrada, donde la cámara se mueve antes de que el telón se abra. El
  movimiento abre y cierra la escena; el telón solo tapa la costura.
- **Se hace abriendo el encuadre, no subiendo la cámara.** Con cámara
  ortográfica alejarse no encoge nada, y subirla mirando al mismo punto lo que
  hace es **enderezar la vista a plomo**, que es otro efecto y le quita al
  camión el poco volumen que tiene. Lo único que aleja de verdad aquí es el
  ancho de mundo.
- **Cuidado con el nombre.** La primera versión se llamaba `leaving`, y dentro
  del bloque de cámara **ya hay un `leaving`**: el del camión saliendo de plano
  en `InRoute`. Una variable declarada más adentro tapa a la de fuera sin dar
  ningún error, así que el encuadre se abría en el momento equivocado. Por eso
  se llama `roadLeaving`.
- Medido, comparando el área de escena en pantalla contra lo que predice la
  fórmula (el ancho va a `1 + 0,9 · leaving` y el área con el cuadrado):

  | fracción | área medida | esperada |
  | --- | --- | --- |
  | 0,84 | 100 % | 100 % |
  | 0,86 | 98 % | 100 % |
  | 0,88 | **89 %** | 91 % |
  | 0,90 | **72 %** | 72 % |

  Clava la predicción, y confirma que empieza en 0,86 y no antes. El arnés lo
  respalda por el otro lado: `carretera-llegada` sigue a 0,00 %, o sea que el
  alejamiento no se come la llegada.

##### Y además tiene que durar lo que la entrada

- **Es el mismo telón para las dos cosas.** `veilRef` es un solo plano en azul
  noche pegado a la cámara, y la opacidad sale de `Math.max(closing, cover)`:
  no hay dos efectos, hay uno. Así que lo único que separa «fundido» de
  «parpadeo» es **cuánto dura**.
- Y no duraban lo mismo. La entrada abre el telón en 0,26 → 0,40 (0,14 de la
  sección, **605 px**); el cierre iba en 0,90 → 0,99 (0,09, **389 px**). La
  escena entraba con un fundido y se iba con un parpadeo.
- **La ironía es que la entrada estuvo en esas mismas nueve centésimas** y se
  cambió por este mismo motivo —«un fundido de medio segundo de scroll no es
  un fundido, es un parpadeo lento»—. El cierre se quedó con el valor que la
  entrada ya había descartado. Cuando se afina un tramo, conviene mirar su
  simétrico.
- Ahora el cierre va en **0,88 → 1**, o sea 518 px. Igualar los 605 pedía
  arrancar en 0,86 y eso se come la llegada, que está afinada aparte: el
  camión aparca en 0,84 y entre eso y el fundido tiene que quedar un respiro.
  Si hiciera falta más fundido, lo que toca es **adelantar el final del
  recorrido (`ROAD_RUN.to`)**, no robarle a la pausa.

##### Cómo se mide un fundido, y cómo no

- Medido con el **brillo medio del cuadro**, barriendo el scroll de 20 en 20
  px y quedándose con el tramo entre el 5 % y el 95 % de la caída: entrada
  **420 px**, salida **340 px**. La salida pasa de durar el 64 % de la entrada
  a durar el **81 %**.
- **El primer intento contaba píxeles «azul noche» y daba 80 px**, o sea «la
  salida es un corte». Era falso: a mitad de fundido el telón es
  semitransparente y lo que hay en pantalla es un gris azulado que no pasa el
  filtro de «esto es azul noche». El contador se quedaba plano durante todo el
  fundido y solo saltaba al final. **Mentía en la dirección más peligrosa:
  confirmando lo que se esperaba encontrar.** Para medir una transición entre
  dos colores, la magnitud tiene que ser continua —brillo, no pertenencia a
  un color—.

#### El parpadeo del blanco: la franja es finita y la cámara gira

- **Al entrar la carretera aparecía un blanco, desaparecía y volvía a
  aparecer.** Medido de 25 en 25 px: el crema subía al 17 %, **volvía a 0** y
  después al 26 %. Con el barrido de 146 px que se usó antes no se cazaba; hay
  que medir fino para verlo.
- **La causa es geométrica, no de tiempos.** La franja oscura que llena la
  pantalla en `InRoute` es un cajón de 600 × 600: **finito**. Se retiraba
  bajándola mientras la cámara giraba a cenital, y al girar su borde entraba y
  salía del encuadre. Con cámara ortográfica un plano **no se encoge al
  alejarlo**, así que mientras esté en escena ocupa lo que ocupa y su borde
  acaba cruzando el cuadro sí o sí. Por eso no se arregla moviendo fracciones.
- **La solución es la que ya usaba el cierre de la intro: un telón pegado a la
  cámara** (`cover` en `Scene.tsx`), que no tiene bordes porque mide más que el
  encuadre. Se funde a azul noche sobre la franja —son el mismo color, no se
  nota—, la franja se apaga debajo cuando ya no se ve nada, la cámara gira
  detrás, y al final el telón se abre y descubre la carretera ya dibujándose.
  Un fundido, no un borde moviéndose. Medido: **0 cambios de sentido**.
- **El apagado de la franja va con `coverIn`, que solo sube, y no con `cover`,
  que vuelve a bajar al abrirse el telón.** Con `cover` la franja reaparecería
  en mitad del fundido y volvería a verse su borde, que es el fallo que esto
  arregla.

#### La escena acababa fuera de pantalla

- **La nave de destino no entraba en cuadro nunca.** `RoadIntro` terminaba su
  disparador en `bottom top`, o sea una pantalla después de que su bloque fijo
  se suelte: el **19 % final** de la coreografía —la llegada y el fundido de
  cierre— ocurría con el bloque ya subiendo. Es el mismo fallo que el hero ya
  tuvo, y el mismo arreglo: `data-scene-end="bottom bottom"`.
- **Y eso destapó el segundo, que es el que de verdad conviene recordar.** El
  cuentakilómetros y la barra de avance **crean su propio `ScrollTrigger`** y
  se habían quedado con el final antiguo. Resultado: el camión aparcaba y el
  contador marcaba **393 km**. Es exactamente la trampa que ya estaba escrita
  para `ScrollFade` —dos disparadores que miden tramos distintos no comparten
  fracciones— solo que con otras piezas.
- Por eso el tramo vive ahora en **`ROAD_TRIGGER` (`lib/route.ts`)** y lo usan
  los cuatro: la escena, el contador, la barra y el texto. Si añades algo que
  dependa del avance de la carretera, sácalo de ahí.
- **La cámara deja de seguir al camión al llegar y se posa sobre la nave**
  (`arriving` + `ARRIVAL_VIEW`). El camión frena en el muelle y los edificios
  quedan por delante de él, así que siguiéndolo se veía un camión yéndose a la
  esquina y la escena fundiendo: el viaje no terminaba en ningún sitio. El
  punto se **deriva** de la posición y el giro de la nave, así que si se mueve
  la nave la cámara la sigue sola.
- Entre que el camión aparca (0,84) y empieza el cierre (0,92) hay ahora unos
  **300 px de llegada a la vista**. Fueron 76 y la nave se veía ya oscurecida.

#### Las naves no llevan nombre escrito, y es decisión del cliente

- **Se probaron y se quitaron.** Cada nave llevó su nombre pintado en la
  cubierta —`ALMAZORA / CASTELLÓN` y `FUENLABRADA / MADRID`— y funcionaba:
  medido para leerse a 30 px de altura de mayúscula en escritorio. El cliente
  los descartó, así que **no volver a ponerlos sin preguntar**.
- Lo que sí hacía falta de ese trabajo se queda: **la cámara se posa sobre la
  nave de llegada**, que es lo que hace que el viaje termine en un sitio y no
  en la esquina de la pantalla. Eso era la mitad del arreglo y es la que vale
  por sí sola.
- El que sigue en pie es el **cartel de dirección** del arcén (`roadSign.ts`),
  que es otra cosa: una señal de tráfico dentro de la escena, no un rótulo
  sobre un edificio.

#### La cuña gris, que llevaba ahí desde siempre

- Al medirlo salió otra cosa que no se buscaba: justo en el relevo, **el 79 % de la pantalla se ponía gris** durante unos 90 px de scroll. No era nueva —estaba desde antes, solo que en otro punto del scroll— y es de las que no se ven mirando el código.
- **Qué era:** el suelo oscuro de `InRoute` es un plano enorme que se aparta bajándolo, y la cámara es **ortográfica**, así que bajarlo no lo hace más pequeño: sigue ocupando la pantalla entera hasta que se apaga. Se apagaba cuando la cámara ya estaba al 94 % de su giro a cenital, o sea visto desde arriba y teñido de gris por la niebla a medio virar.
- **La solución no es apagarlo antes a secas**: si se quita mientras la cámara sigue metida dentro, lo que queda es crema vacío —eso ya está avisado en el propio código—. Lo que funciona es apagarlo **antes en relación al giro**, cuando la cámara todavía está baja y el plano aún se lee como una franja en el horizonte, y a la vez adelantar el asfalto para que haya algo que mirar al quitarlo.
- Medido: de **78,9 % a 3,9 %**.

### Las naves de los extremos (`Facility.tsx`)

- **El fallo que tenían era de valor, no de forma.** La nave iba en `#edeae5` sobre un patio en `#e3e0da`: **más clara que su propia explanada**. Desde la cenital eso no se lee como un edificio, se lee como una mancha pálida con dos cajas de colores encima — y es lo que se veía en la llegada, que es el momento de pago de toda la escena. No faltaba detalle: faltaba que el edificio y el suelo midieran distinto.
- **Lo que la hace reconocible desde arriba son tres cosas, y ninguna es la planta:**
  1. **Los lucernarios.** Una nave industrial vista desde el aire se reconoce por las bandas claras del tejado antes que por nada. Van estrechas a propósito: a 1,05 m de ancho y en blanco casi puro, cinco bandas convertían la cubierta en una cebra.
  2. **Dos cuerpos pegados a distinta altura**, uno bajo de hormigón y otro alto de chapa, con un escalón entre ellos. Es lo que son las naves de verdad de la casa y la misma lectura que usan las del fondo del patio: lo que las identifica no es la silueta, es que son **dos construcciones**.
  3. **Semirremolques aparcados en los muelles**, no cajas sueltas por el patio. Un remolque de culo a un muelle dice «terminal de transporte» sin una palabra.
- **Los remolques van en los muelles de fuera (±7,5) y eso no es estética.** El trazado sale del origen del componente hacia +X y la calzada mide 10 m, así que ocupa de `z = −5` a `z = 5`: en el muelle de 2,5 el remolque quedaba literalmente aparcado **sobre el asfalto por el que entra el camión**.
- **El patio va por debajo del arcén de la carretera, y esto costó una captura.** Estuvo a `y = 0.02`, que es exactamente la altura del arcén, y donde los dos se solapan —la boca del patio— salía un rayado roto de libro: dos planos coplanares peleándose por el mismo píxel. **El orden de alturas del suelo de esta escena es patio (0,012), arcén (0,02), asfalto (0,04) y marcas (0,06).** Si añades otra capa, métela en esa escalera.
- Por lo mismo, la cumbrera y los lucernarios **se meten dentro del techo** en vez de apoyarse encima: con la cara inferior justo en la cubierta son dos caras coplanares y vuelve el rayado.
- Los grises son **cálidos**, como los de `TerminalYard`: todo lo gris frío de esta escena se ha leído siempre como «día lluvioso».

### Las sombras en la carretera: intentado y no conseguido

- **La hipótesis era buena y resultó falsa.** Parecía que toda la maquinaria estaba montada —la luz proyecta, su encuadre de 110 m sigue al punto que mira la cámara, el camión está marcado como proyector— y que lo único que faltaba era que **el asfalto y el arcén recibieran**. Dos propiedades. Se les puso `receiveShadow`, se le puso `castShadow` al quitamiedos y a las farolas, y **no cambió ni un píxel**.
- **Tres medidas, para que nadie repita el camino:**
  1. El arnés visual da **0,00 %** en las dos tomas de media ruta, que es donde hay farolas, barrera y camión a la vez.
  2. Recorriendo una columna de píxeles por el arcén junto al camión, el arcén sale **plano en 200** de arriba abajo: no hay ninguna franja más oscura.
  3. Ensanchar el encuadre del mapa de sombras de ±55 a ±140 m tampoco movió nada — **ni siquiera en el patio**, que sí tiene sombras. Esa última es la pista buena: **lo que hay que mirar no es la carretera, es el aparejo de luz**.
- **Y una trampa de medición, que casi me la cuela.** Antes de mirar el arnés comparé dos capturas mías del «km 200», una de antes y otra de después, y daban un 1,54 % de diferencia: parecía que las sombras sí se dibujaban. No era verdad. El cuentakilómetros solo tiene resolución de kilómetro entero, así que **dos capturas que marcan 200 km pueden estar separadas por píxeles de scroll**, y eso desplaza toda la cinta de asfalto. Está avisado en la sección del arnés y aun así piqué: **para medir en la carretera hay que usar `check:3d`, que busca el punto a ±1,5 km, no una captura a ojo**.
- Las banderas se quitaron, porque una propiedad que no se ejecuta solo añade coste.
- **Qué sería lo siguiente, si se retoma:** mirar el `directionalLight` y su `shadow-camera` en `Scene.tsx` con la escena de la carretera delante, no la del patio. Y antes de nada, comprobar si el ensanche del encuadre se aplica de verdad: que no moviera **nada** en el patio es, en sí mismo, un resultado que no cuadra.

### Los hitos de kilómetro

- **No se pueden leer, y eso se sabía antes de ponerlos.** Un hito mide un metro de alto; desde la cenital —16° de la vertical— eso se queda en 26 cm, y su placa sale de cinco píxeles. Ni orientándola hacia la cámara, que es el truco del cartel, cabría un número.
- **Están por el ritmo, que es otra cosa y era lo que faltaba.** Una cinta de asfalto con un camión encima no dice cuánto se avanza; una fila de marcas pasando a intervalos regulares, sí. Es el mismo trabajo que hacen las naves del fondo en el patio —sin algo fijo contra lo que medir, el avance no se lee— y en la carretera no lo hacía nadie: las farolas son once en todo el trayecto y quedan demasiado sueltas para marcar un compás.
- **Son 32 y el número no es estético.** El tramo con marcas viales son 319 de los 420 km del relato, así que uno cada diez kilómetros salen 32. En escritorio caen a unos 90 px unos de otros y se ven ocho a la vez; en móvil, a 50 px y se ven dieciséis.
- Van **instanciados** —una llamada el cuerpo y otra el remate azul— y con `frustumCulled={false}`, como todo lo instanciado de esta escena.
- **Se descubren moviendo `count`, no escondiéndolos uno a uno.** Van ordenados a lo largo de la curva, así que basta con decirle a la malla cuántos dibujar: es lo mismo que hace el asfalto con su índice y sale gratis. Las matrices se suben una sola vez al montar; lo que cambia por fotograma es solo el recuento, que no toca el búfer.
- **El efecto es pequeño en área y grande en el tiempo**, y conviene no confundirlo: el arnés visual los mide en un **0,02–0,03 % del cuadro**, porque son 32 marcas de seis píxeles. Lo que aportan no se ve en una captura parada, se ve bajando.

### El quitamiedos

- **Dónde va se calcula del trazado, no se escribe a mano.** Una barrera de verdad no recorre la carretera entera: se pone donde hay peligro, y en un trazado libre como este eso es el lado de fuera de cada curva. Se recorre la curva midiendo cuánto gira en cada punto —el mismo producto vectorial con el que el camión se inclina—, se juntan los trechos seguidos que giran para el mismo lado, se tiran los que se quedan cortos y cada uno sale por el lado contrario al que gira. Si se cambia el trazado, la barrera se recoloca sola.
- **Salen tres tramos** de 47, 50 y 24 m, en lados alternos, porque la carretera hace una ese. Un cuarto trecho de longitud cero se cae solo por el filtro de largo mínimo. Son tres llamadas de dibujo.
- **Desde arriba un quitamiedos es una línea, y está bien que lo sea.** La chapa tiene unos 30 cm de alto a 78 del suelo, y desde la cenital —16° de la vertical— esa altura se queda en 8 cm: nada. Lo que sí se ve en planta es **el canto de arriba**, 34 cm. Medido sobre una captura: la barrera sale a **144 contra un arcén de 200 y un fondo de 241**, casi cien niveles de contraste. Es una línea clara siguiendo la curva, que es justo lo que se ve en una foto aérea. Aquí no hay nada que fingir: la barrera se modela como es y se ve como se tiene que ver.
- **Cada tramo se descubre sobre su propio trecho**, no sobre la curva entera, porque empiezan y acaban en sitios distintos.
- **En la vista cenital no hay sombras proyectadas**, y eso tiene su propia sección más abajo: se intentó arreglar y no bastó con lo que parecía que faltaba. Lo que asienta al camión sobre el asfalto en esta vista son las sombras de contacto, que van pintadas.

### El cartel de dirección, y por qué está tumbado

- **Un cartel de verdad, plantado vertical, no se puede leer desde esta cámara, y eso es geometría, no opinión.** La cenital mira a 16° de la vertical, así que un panel vertical se ve casi de canto: la proyección le deja **el 26 % de su altura**. Con el encuadre de escritorio —16 píxeles por metro— un panel de 7 × 3,2 m saldría de **112 × 8 px**: se vería que hay algo azul en el arcén y no se leería ni una letra.
- **Así que el panel se orienta hacia la cámara y no hacia el tráfico.** Queda casi tumbado, levantado esos mismos 16°, y entonces se ve entero y se lee. Los pies siguen verticales, así que lo que se ve desde arriba es un cartel sobre sus postes.
- **Es una licencia, y de las que esta escena ya usa**: la grúa que se coloca detrás del camión, el lote de palés pegado a la lona por fuera. Vale por lo mismo: **esta carretera solo se ve desde una cámara**, y desde esa cámara la imagen es correcta. Si algún día se mira desde otro sitio, el cartel se verá tumbado; ahí es donde habría que volver.
- **La orientación se deriva, no se escribe a mano.** Sale de `roadCamDirection()`, así que si se mueve la cenital el cartel la sigue solo. Por eso la altura y la inclinación de esa cámara se mudaron de `Scene.tsx` a `lib/route.ts`: es el mismo caso que `roadFrameWidth`, dos sitios que tienen que usar el mismo número y que si se desincronizan rompen algo en silencio.
- **El texto corre hacia −Z y no hacia +X**, porque en cenital el «arriba» de la pantalla es −X y la derecha es −Z. Si se gira la cámara, esto se gira con ella.
- **Las medidas son de un cartel real** (7 × 3,2 m) y no «de maqueta», justo para que se lea: así la palabra sale con unos 20 px de altura de mayúscula en escritorio y unos 12 en móvil, que es el límite. Un cartel más pequeño habría sido un rectángulo azul.
- **El azul no es el corporativo.** El `#34548a` es más apagado y más violáceo que el de una señal, y puesto aquí el cartel dejaba de leerse como señal de tráfico y pasaba a leerse como un panel de la empresa plantado en el arcén.
- Va **sin luz** (`meshBasicMaterial`), como las marcas viales: una señal es retrorreflexiva y lo que tiene que hacer aquí es leerse, no coger el gradiente de la luz principal.
- Aparece cuando el asfalto ya ha llegado hasta él, igual que las farolas.

### El camión se inclina en las curvas

- Un camión que gira sin bascular se lee como una pegatina que se desliza. Ahora bascula **hacia fuera**, como uno de verdad.
- **Cuánto gira sale del propio trazado, no de medir el rumbo entre fotogramas**: el producto vectorial entre la tangente de la cola y la cuerda hasta el morro da el seno del ángulo que tiene por delante, con su signo. Los dos vectores ya estaban calculados para orientarlo, así que sale gratis — y, sobre todo, **no depende de lo rápido que se haga scroll**, que es lo que pasaría midiendo diferencias por fotograma.
- **El factor está medido, no puesto a ojo**: ese seno llega como mucho a 0,44, así que con `TRUCK_BANK = 0.09` la inclinación máxima son unos **2,3°**. Un camión real bascula entre 2 y 4; por encima deja de leerse como peso y pasa a leerse como que el modelo se cae.
- Va amortiguado con `damp`, como todo lo que se mueve por fotograma aquí: la curvatura cambia de golpe al entrar y salir de una curva y veinte toneladas no se enderezan en un fotograma. **El retraso es lo que se lee como peso.**
- **El grupo del camión lleva `rotation-order="YXZ"` y es obligatorio.** Con el orden por defecto (`XYZ`) el giro en X se aplica por fuera del rumbo, o sea sobre el eje X del mundo: en una curva el camión no se habría inclinado, se habría ido de morro contra el suelo. Con `YXZ`, `rotation.x` bascula sobre el eje del propio camión. El `rotation.z` que ya había —el morro levantado en llano— sigue siendo local con los dos órdenes, así que no cambia.
- **Comprobado que se aplica**, que en este proyecto ya ha habido efectos montados que no se ejecutaban: capturando la misma curva con el factor puesto y a cero cambian **19.881 píxeles (0,43 % del cuadro), 57 niveles de media**.

- **En la cenital de la carretera la niebla se quita casi del todo** (`FOG_ROAD`). Allí la cámara está a 70 m de altura y lo que se ve —asfalto, camión, naves de los extremos— está todo a una distancia parecida: la niebla no tiene nada que separar, lo único que hace es lavar, y lava justo lo que hay que mirar. Con el alcance del perfil el camión salía como un fantasma gris sobre el asfalto negro en la segunda mitad del recorrido. Lo que da profundidad en esa escena no es el aire, es el contraste: asfalto negro, camión claro.
- **El alcance de la niebla va por vista, y es el detalle que más fácil se pasa por alto.** La niebla se mide **desde la cámara**, y las dos vistas no están ni de lejos a la misma distancia: en perfil la cámara se planta a 60 m del camión, y en tres cuartos está a unos 20 m del primer término. Con un alcance único no hay manera —el que separa las filas en el arranque deja el camión lavado en perfil, y se comprobó: salía translúcido y el rótulo rosa—, así que hay `FOG_QUARTER` y `FOG_SIDE` y se interpolan con la propia cámara. **Si mueves la cámara, revisa estos números.**
- En el **primer plano del camión** la niebla se cierra por detrás (`FOG_CLOSE`): es el desenfoque de maqueta que no se puede montar con postprocesado. El `near` casi no se mueve a propósito, porque el camión está a 60 m y bajarlo lo difuminaría a él.
- **Ojo con el orden de los ángulos de Euler en la pintura del suelo** (`YardMarkings.tsx`). Los dos bordes del carril que van hacia el camión llevaban `angle={Math.PI / 2}` y salían **en la dirección contraria**: en vez de ir hacia el camión tiraban hacia el fondo, y en la vista en tres cuartos se veían como dos barras claras verticales de treinta y tantos metros plantadas en la franja baja derecha, sin venir de nada. La raya ya viene tumbada con `rotation={[-Math.PI/2, 0, angle]}`, y en el orden XYZ de three.js **el giro en Z se aplica primero, en los ejes locales**: gira el plano sobre sí mismo antes de tumbarlo, así que el largo acaba apuntando a Z. Sin ese giro, `width` va en X y `depth` en Z. Si añades una raya nueva, compruébalo mirándola, no asumiendo.
- **Las naves del fondo son las de verdad**, sacadas de `public/media/camion-02.jpg`, que es el mismo sitio del vídeo corporativo. Y lo que las hace reconocibles no es la forma: es que son **dos construcciones distintas pegadas** —un cuerpo bajo de hormigón liso, en gris verdoso cálido y sin nervios, y otro más alto de chapa, en gris frío casi blanco y con los nervios verticales marcados—, con un escalón claro entre ambos. Van alternando bajo-liso / alto-nervado. Antes eran cajas iguales de un solo gris, que es exactamente lo que ese sitio no es.
- La **escalera enjaulada** de la pared de chapa es un detalle tonto y es lo que más la reconoce: en la foto es la única vertical que rompe la chapa de arriba abajo.
- **Cada nave del fondo va a su profundidad y a su altura, con aire entre ellas.** Estaban las tres a la misma distancia, casi a la misma altura y pegadas: sumadas daban un rectángulo gris de borde recto que cruzaba la pantalla de lado a lado y se leía como un muro. Separarlas en `z` escalona la silueta **y** —esto es lo que de verdad importa— las mete en tramos distintos de la niebla, así que cada una sale de un gris. Esa diferencia de valor entre volúmenes es lo que se lee como profundidad; el escalón solo sería una cartulina recortada. Los huecos entre ellas tampoco son descuido: un hueco de fondo entre dos naves es lo que las separa en dos edificios.
- **Y son cálidas, no grises azuladas.** Lo fueron (`#b7bdc3` la de chapa) y medido daban (204,208,211): más azul que rojo, justo al revés que el crema de la página (245,243,239). En la vista de perfil estas naves ocupan **media pantalla detrás del camión**, así que esa dominante fría era buena parte de lo que se leía como «parece un día lluvioso»: no es que la escena tuviera poca luz, es que tenía el color del cielo encapotado. Ahora el rojo va por delante del azul en las dos, y la diferencia entre hormigón y chapa se sostiene con el valor, no con el matiz.
- **Las naves del fondo no pueden ser casi del color de la bruma.** Lo eran, y la niebla nueva las borraba del todo: el fondo se quedaba en una banda lisa. Un edificio lejano en un día de bruma no es del color del aire, es una silueta un punto más oscura. Van en gris medio: lo que se lleva la distancia es el detalle, no el volumen.
- La fila de atrás de la pila lleva además un **tinte a mano** hacia la bruma (`ROW_HAZE`), porque a 13 m de separación la niebla sola hace poco y la pila es lo primero que se ve.
- **Hay dos torres en primerísimo término** (`FOREGROUND_STACKS`), cortadas por el borde del encuadre. La escena tenía **dos distancias** —la grúa y la pila— y nada delante, y el solape de algo grande y cercano es la pista de profundidad más fuerte que existe. Es además el sustituto del desenfoque de maqueta: si no se puede desenfocar el primer término, se **solapa**. Van a `x < -19` como todo lo del patio, así que en perfil quedan fuera de plano por la izquierda.
- **Parallax falso** (`Scene.tsx`): con cámara ortográfica **no hay parallax**, no hay perspectiva, así que todo se mueve clavado a la cámara y el patio se desliza como una lámina. Se finge al revés de lo que parece: para que algo avance *menos* en pantalla hay que moverlo **en la misma dirección** que la cámara, una fracción de lo que ella se mueve. Las naves van al 50 % y el vallado al 26 %.
- Ese parallax se ata al **avance del camión** y no a la bajada a perfil: ahí el desplazamiento es mucho mayor y el fondo acabaría metiéndose debajo del titular. Y **las dos piezas del vallado llevan la misma fracción**, que están a la misma profundidad y son la misma valla: con fracciones distintas se abre un escalón en la junta.
- **Las naves entran escalonadas**, una detrás de otra. Las tres a la vez se leen como un telón que se enciende; separadas por un suspiro, se leen como que el mundo se construye según baja la cámara.
- La **luz principal va más rasante** que antes (de unos 47° a unos 29° sobre el suelo). El suelo del patio es un campo crema enorme y vacío: lo que lo estructura son las sombras, y para que haya sombra que ver tiene que ser larga.
- La bajada a perfil usa **`easeLag` y no `smoothstep`** (`lib/utils.ts`). `smoothstep` es simétrico: entra y sale igual, y eso es lo que hace que una cámara parezca interpolada en vez de manejada. Con `easeLag` la cámara se queda arriba viendo la maniobra y resuelve el descenso al final.
- Y la cámara lleva un **empuje lento** durante todo el hero: un 4 % repartido en toda la sección. Por sí solo no se ve; lo que se nota es que la escena deja de estar congelada.

- **El desenfoque de maqueta no se puede montar con estas versiones.** Se probó `TiltShift2` de `@react-three/postprocessing` 3.1.1 con three 0.186 y revienta el render (`uniform2fv ... cannot be converted to a sequence`), dejando el Canvas en negro. Se quitó. Si se reintenta, hará falta subir o bajar versiones y comprobarlo, no darlo por hecho.
- **Hay viñeta, y solo viñeta** (`Postproceso.tsx`). Es el recurso que más asienta una escena de maqueta: oscurece un pelo las esquinas y la imagen deja de parecer un recorte pegado sobre la página.
- **La viñeta no se estaba aplicando, y nadie lo había visto.** Se descubrió midiendo el borde superior de las referencias del arnés visual: salía **plano en 245 de lado a lado**, sin rastro de caída hacia las esquinas. O sea que el efecto estaba montado, documentado y afinado… contra nada. Las dos notas que había escritas sobre él eran, en consecuencia, falsas las dos.
- **Primera nota falsa: `darkness: 0.42` no era «muy baja», era demasiado.** En cuanto el efecto empezó a ejecutarse, el rojo del borde superior caía de 241 en el centro a **192 en las esquinas**: un lavado gris en las cuatro puntas, exactamente el fallo del que avisaba la propia nota. Afinada por medida, va en **0,14**, que deja la caída en 253 → 250. Un 1,5 %, que es lo que se buscaba.
- **Segunda nota falsa: «la viñeta es casi gratis».** Con la pasada funcionando de verdad y un móvil frenado a 1/4 de CPU:

  | | con viñeta | sin viñeta |
  | --- | --- | --- |
  | patio | 30 fps | **88 fps** |
  | en ruta | 47 | 106 |
  | carretera | 57 | 97 |

  Una pasada a pantalla completa sobre un teléfono **cuesta la mitad de los fotogramas**. En escritorio no se nota —144 fps con y sin—, así que **la viñeta se queda en escritorio y se apaga por debajo de 768 px** (`Postproceso.tsx`). Va con `enabled`, no desmontando el componente: montarlo y desmontarlo al girar el teléfono recrearía el render target en mitad de la animación y eso sí se ve.
- La lección general, que vale para el siguiente efecto: **un efecto que parece gratis puede estar sin ejecutarse**. Comprobar que se ve no basta si es sutil; hay que mirar los píxeles.
- **No se añade oclusión ambiental y es una decisión, no un olvido.** Con cámara ortográfica y materiales planos aporta poco, y cuesta otra pasada entera.
- Al mirar el 3D tras recargar, **dale unos segundos**: el Canvas tarda en pintar el primer fotograma y es fácil confundir eso con que está roto. Ha pasado ya varias veces.

## Detalles de acabado
- **El crema es `#f7f3ec`, no `#f6f4f1`**, y va en **dos sitios**: el `body` y la tabla `COLORS` de `Backdrop.tsx`. Ahí se había quedado el valor anterior, así que el fondo que pinta el componente y el del `body` eran dos cremas distintos por dos puntos. No se ve de uno en uno; se ve en el borde donde uno tapa al otro. El anterior estaba a dos puntos del valor que el criterio de diseño señala como el más repetido en webs generadas. Este es un punto más cálido y un punto menos gris —sube el rojo y el verde, baja el azul—, que es lo que separa el papel de un gris claro con algo de color. El cambio es pequeño a propósito: la marca pide mucho blanco, no un fondo con carácter.
- **Grano de papel** sobre toda la página (`body::after` en `globals.css`). El crema plano se lee como pantalla; con la textura se lee como papel. No captura clics y no se imprime.
- El menú marca la **página activa** con `aria-current` y un subrayado rojo.
- El blog **no lleva portadas ahora mismo** y es a propósito (ver la sección «Blog»). Cuando las haya, `cover` en `content/blog.ts` las enseña en el listado, en el artículo, en Open Graph y en el marcado para buscadores: es lo que hace que al compartir el enlace por WhatsApp o LinkedIn aparezca la foto.

## Sistema de diseño de la página (detalles que no son adorno)

- **Las tarjetas de servicio no llevan número**, y antes llevaban **dos**: un fantasma grande en la esquina y uno rojo pequeño sobre el titular, con la misma cifra. Lo repetido era un descuido; que no vaya ninguno es una decisión, y es la misma regla de siempre: los seis servicios no son pasos de nada —se contrata grupaje **o** camión completo, no uno detrás de otro—. Los pasos de `RouteSteps` sí llevan número porque aquello sí es una secuencia. Para saber por dónde vas están el contador y la barra del pie.
- El recuento «06 · Servicios» del pie de Servicios **se quitó**: era una etiqueta en versales con prosa ancha y un punto medio de separador, los tres recursos de plantilla a la vez, y no decía nada que no dijeran las seis tarjetas.
- **Cabeceras de sección** (`SectionHeading.tsx`): el titular, y nada más. Llevó número, filete rojo y antetítulo, y los tres se quitaron por el criterio de diseño (ver esa sección): el número afirmaba una secuencia que no existe, el antetítulo repetía el titular y el filete acompañaba a los dos. Lo que queda es el titular haciendo el trabajo con tamaño y condensación, que es para lo que se eligió una condensada robusta. **No le vuelvas a poner número**: si una lista sí va en orden, el número va en la lista, como en `RouteSteps`.
- El antetítulo **no puede repetir el titular**. Ya pasó con "Dónde estamos / Dónde estamos" y con "Cobertura / Rutas y cobertura": se lee como un error, no como jerarquía.
- **Banda de marca** (`Marquee.tsx`): tira rotulada en rojo y en movimiento continuo que cierra la sección de Servicios. Nació como bisagra entre el oscuro y el claro; ahora que Servicios va en crema es **el único bloque de color macizo de la portada**, que es justo como el brief quiere el rojo. Son **dos copias idénticas** de la lista y la animación desplaza la mitad del conjunto: así el bucle no tiene costura. La segunda copia va con `aria-hidden`, que si no los lectores de pantalla leen todo dos veces.
- Esa banda va **dentro** de la sección de Servicios, no entre secciones. `Backdrop` elige el color de fondo mirando qué `[data-bg]` cruza el centro de la pantalla: un bloque suelto entre dos secciones deja un hueco sin dueño y el fondo pega un parpadeo a crema.
- **Las fotos salen de un solo sitio** (`src/content/media.ts`). La lista estaba copiada en dos archivos —la portada y la página de Servicios—, así que cambiar una foto era cambiarla en dos sitios y acordarse de los dos.
- Ese manifiesto declara además, por hueco, **el ancho que necesita de verdad** y **qué debería verse**. El ancho lo comprueba `npm run check:fotos`, que mide cada archivo y canta las que no llegan. No es burocracia: una foto de 403 px en un hueco de 1.150 se ve «un poco blanda» y se le echa la culpa a la cámara, cuando lo que pasa es que está ampliada al triple. El comando lo dice con un número.
- Ese script **distingue lo grave de lo justo** a propósito. Un 6 % de menos no se ve, y marcarlo en rojo solo consigue que se deje de mirar el aviso; lo que sí se ve es una foto ampliada al doble o recortada a la mitad. Solo falla por lo segundo.
- No usa ninguna librería: lee la cabecera del JPEG/PNG/WebP a mano. Meter `sharp` por esto sería añadir una dependencia nativa de decenas de MB que el proyecto no necesita para nada más.
- **Hoy no dan la talla tres de ocho**, y las tres por lo mismo: son verticales metidas en huecos apaisados (`ftl`, `intl`, `grupaje`). El encargo de las fotos nuevas está en el propio manifiesto, campo `brief`, que es donde se mira al cambiarlas.
- El `alt` de las fotos de servicio va **vacío a propósito**: al lado de cada una está su titular, así que describirla otra vez se la lee dos veces a quien usa lector de pantalla. Si alguna pasa a contar algo que el texto no diga, entonces sí lleva `alt`.
- **Revelado común de las fotos** (`.photo` en `globals.css`). Las fotos de la casa vienen de días y sitios distintos: unas frías, otras doradas, unas contrastadas y otras planas. Juntas se nota que es un montaje. Esto les pasa a todas el mismo revelado —menos saturación, luces hacia el papel, sombras y matiz hacia el azul noche— y dejan de ser fotos sueltas. Va en CSS y no tocando los archivos: se quita en una línea si algún día llegan ya tratadas. **`isolation: isolate` es obligatorio**, o las capas de mezcla se comen también lo que haya detrás de la foto.
- **Hubo un raíl de ruta** en el margen izquierdo de la portada (`RouteRail.tsx`), un hilo fijo que recorría Castellón ⇄ Madrid contando kilómetros. Se quitó: acompañaba la página entera, también las secciones que no tienen nada que ver con el viaje, y ahí dejaba de significar nada. El componente está borrado; si alguna vez vuelve, que sea solo durante la intro.
- **El progreso global del store llevaba roto desde el principio** y nadie lo había notado porque nadie lo leía. El disparador maestro usaba `document.documentElement`, y como **el que hace scroll es el propio `html`, su altura medida es la de la ventana**: el disparador salía de largo cero y `progress` se quedaba en 0 para siempre. Va con `document.body`, que sí mide el alto del contenido.
- **Hubo palabras gigantes en contorno** detrás de Servicios y del CTA (`GiantWord.tsx`, ya borrado). Se fueron las dos. La de Servicios era además la que daba el relieve del desfile, porque se movía menos que las tarjetas, y aun así sobra: esta página gasta toda su audacia en un sitio, la intro 3D, y una palabra de 22vw detrás de las tarjetas es una segunda apuesta por lo mismo que encima compite con el titular de la sección. Lo que dice cuánto falta son la barra de avance y el contador, que es su trabajo y lo hacen mejor.
- El titular de `InRoute` va a **tamaño cartel** con medida fluida. Es el centro emocional de la portada y pedía peso.
- **Una sola escala de titulares** (`--text-display-xl/lg/md/sm` en `@theme`). Antes cada sección se montaba su propio salto —`text-4xl sm:text-5xl lg:text-6xl` aquí, un `clamp` a mano allá— así que no había dos titulares que midieran lo mismo y la página se leía como maquetada a trozos. Si añades un titular, sale de la escala; si la escala no te vale, cámbiala, no la esquives.
- Van en `clamp` y **no por puntos de corte**: un titular en versalitas condensadas que salta de golpe entre 768 y 769 px canta mucho, y entre medias siempre hay un ancho en el que queda ridículo o se desborda.
- **Las cifras no usan esa escala** aunque lo parezcan (`Route.tsx`). Un titular puede partirse en dos líneas sin pasar nada; «+4.000 m²» partido es una errata, así que lleva su propio `clamp`, ajustado para que la cifra más larga quepa en media columna de móvil **y** en una cuarta parte de escritorio. Si cambias una cifra por otra más larga, vuelve a mirar ese número.
- Y esas cifras van **sin `uppercase`**: a tamaño de pie de foto no se notaba, pero a tamaño cartel «+4.000 m²» salía «+4.000 M²», y un metro cuadrado en versal no es una unidad.
- Los **antetítulos aflojan el espaciado en móvil** (`tracking-[0.18em] sm:tracking-[0.3em]`). A 12 px con 0,3em, «Transporte nacional e internacional» se partía en dos líneas desiguales.
- **El titular de `SectionHeading` no entra animado.** Lo hizo, línea a línea desde detrás de su propia caja (`RevealHeading`), y no estaba mal hecho: estaba mal puesto. Repetido en todas las secciones, un mismo gesto de entrada deja de ser un momento y pasa a ser un tic, y esta página ya tiene su momento orquestado —la intro 3D—. `RevealHeading` sigue existiendo por si alguna pieza suelta lo necesita.
- **Banda de cifras a sangre** (`Route.tsx`): cuarenta años, ciento cincuenta pueblos y cuatro mil metros de nave son lo que vende la empresa, y estaban a tamaño de pie de foto en una fila gris. Ahora cruzan la pantalla de lado a lado. Se sale del `Container` a propósito: lo que la hace funcionar es justamente que no respete el margen del resto. Los filetes entre celdas los dibuja `gap-px` sobre fondo gris, para no ir poniendo bordes a mano cuando pasa de cuatro columnas a dos.
- **El CTA es una sección entera, no una tarjeta** (`Cta.tsx`). Era la pieza más pequeña de la página y es el final: tarjeta azul centrada, titular a tamaño de subtítulo. Ahora va en azul noche a todo lo ancho, con el titular a tamaño cartel y alineado a la izquierda como el resto. Lleva `data-bg="night"`, así que el oscuro no entra como un rectángulo: lo funde `Backdrop`. Y como el pie es blanco, la página cierra con un corte azul → blanco.
- **Las sedes van sin marco** (`Sites.tsx`). En dos columnas con tarjeta blanca sobre crema, el mapa quedaba en un sello, la dirección en dos líneas apretadas y el borde no se distinguía: se pagaba un marco por no ganar nada. Ahora cada sede ocupa el ancho entero y se separan con un filete, igual que la lista de cobertura de justo encima.
- Las **páginas interiores** abren todas con `PageHeader` y sus bloques usan el mismo `SectionHeading` que la portada. Antes entraban en la rejilla sin avisar y parecían de otra web.
- **Esa cabecera está compuesta, no apilada** (`PageHeader.tsx`). Era un `h1` y un párrafo uno encima de otro con `py-20`: no estaba rota, estaba sin componer, y por eso las siete páginas abrían igual y ninguna parecía tener detrás una empresa de cuarenta años. Ahora lleva cuatro cosas y cada una se gana el sitio:
  - **Miga de pan.** Es lo único de la cabecera que dice dónde estás y por dónde se vuelve, y va con marcado `BreadcrumbList`, así que en Google el resultado enseña «Inicio › Servicios» en lugar de la dirección cruda.
  - **Dos columnas en escritorio**, con el párrafo alineado a la **última** línea del titular. El titular va en condensada a cuerpo grande: puesto encima se come el ancho entero y empuja el texto a una franja fina debajo.
  - **Filete rojo corto** sobre el titular, el mismo gesto que abre el destacado de Servicios.
  - **Banda de datos** opcional, con los filetes dibujados por `gap-px`, como la banda de cifras de la portada.
- Esa banda **solo la llevan las páginas que tienen datos de verdad**: servicios, contacto y blog. Las legales y la de preguntas no, y es a propósito: si la llevaran todas dejaría de informar y pasaría a ser mobiliario. Los dos datos del blog (cuántos artículos y de cuándo es el último) **se calculan del contenido**, no se escriben en `messages`: un recuento a mano se queda viejo en cuanto se publica algo.
- Los filetes de la banda **cruzan la pantalla, pero las cifras van dentro del `Container`**. A sangre del todo, el primer dato quedaba 64 px a la izquierda del titular que tiene justo encima, y ese desajuste entre dos cosas que se leen seguidas no parece una decisión, parece un descuido.
- **`PageHeader` es asíncrono y se traduce solo**: el «Inicio» de la miga es la misma palabra en las siete páginas, y pasarlo por props son siete sitios donde se puede olvidar. Lo que sí pide a cada página es su `path`, que lo necesita el marcado.
- Y el destacado de `/servicios` **ya no lleva `01`**. Lo llevaba porque la cabecera de la lista de abajo llevaba un `02`; quitados los números de `SectionHeading`, ese se quedó solo, y un `01` que no abre ninguna cuenta se lee como un resto de plantilla.
- **El azul noche no va plano** (`.bg-night-depth` en `globals.css`). Un fondo oscuro de un solo color se lee como «pintado»: no tiene ni un punto de luz, así que no parece un sitio, parece un rectángulo. Lleva una mancha de luz muy suave en el centro.
- **Los cuatro bordes de ese degradado acaban en `--color-night` exacto, y eso no es acabado, es lo que lo hace posible.** El fondo de la página lo pinta `Backdrop` con ese mismo azul y la sección de arriba trae el suelo del 3D: si el degradado no cerrara justo en ese color, se vería la costura por los dos lados. Y va a `alpha 0` del mismo color, no a `transparent`: varios navegadores interpolan `transparent` pasando por el negro y dejan un halo sucio en el borde.
- **Las tarjetas del desfile son más claras que la sección.** Fueron azul sobre azul con un filete, y costaba separarlas porque el filete hacía el trabajo que tenía que hacer el fondo; después fueron blanco al 5,5 % sobre azul noche, y hoy son **blancas sobre crema con un filete**. La regla que sobrevive a los tres cambios es la misma: **lo que separa la tarjeta del fondo es el fondo, no el borde**.
- **Se quitó la retícula de filetes verticales** que había detrás del desfile. Estaba para dar al oscuro una estructura contra la que leer el movimiento, pero a ese contraste no llegaba a leerse como retícula: se leía como rayas sueltas en el fondo. Lo que sostiene el desfile son la barra de avance y el contador.

### Servicios iba en azul noche, y ahora va en crema

- **El motivo es del brief, no de gusto.** Dice «mucho espacio en blanco, azul y rojo solo como acentos, bordes y detalles, **nunca como fondos masivos**», y autoriza **una** sección oscura: «la que sube desde abajo en la intro». Servicios era una segunda, a toda altura, y el cierre una tercera.
- **Y dejaba la portada en zigzag**: oscuro en `InRoute`, claro en `RoadIntro`, oscuro en Servicios, claro en Cobertura y Sedes, oscuro en el cierre. Ahora la página va clara de principio a fin y los dos oscuros que quedan son los dos extremos —el momento de la intro y el cierre—, que es un arco y no un parpadeo.
- **Arregla además una incoherencia que ya estaba ahí:** el modal que abren estas tarjetas **siempre fue blanco**, así que al pulsar se saltaba de azul noche a papel sin ningún motivo.
- **Qué hubo que tocar, por si se quiere volver atrás:** el `data-bg` y el fondo de la sección, el tono de la cabecera, el bloque destacado (de `bg-white/[0.055]` a blanco con filete), las seis tarjetas igual, los dos degradados de foto —que tienen que ir **al color del panel que tienen al lado**, o se ve la costura— y el contador, la barra y el pie del desfile. Son dieciocho clases de color en dos archivos.
- **Las fotos de Servicios no llevan velo, ni las seis del desfile ni la del destacado, y no hay que volver a ponérselo.** Los dos degradados tenían sentido con la sección en azul noche: allí llevaban la foto **hacia el oscuro**, en el desfile se leían como viñeta y en el destacado cosían la imagen con el panel de texto. Con la sección en crema y las tarjetas en blanco hacen justo lo contrario —**lavan la foto**, y por el lado por el que más se mira—, y tres de estas ocho fotos ya andan justas de resolución. Lo que cose la imagen con el texto ahora es el propio marco de la tarjeta, y entre las dos hay un corte limpio, que es lo normal.
- El rojo de la banda va en **tira fina**. La marca lo quiere como acento, nunca como fondo masivo.

## Servicios (`Services.tsx` y `ServicesTrack.tsx`)

- El bloque destacado no es una tarjeta más: es el servicio de la casa. Lleva filete rojo arriba, la foto sangrando por el borde y un **degradado hacia el panel de texto**. Sin el degradado la foto entra de golpe y el bloque se parte en dos mitades que no se hablan.
- El desfile horizontal lleva **dos referencias**, y las dos son por lo mismo: un bloque fijo sin ellas no se lee como desfile, se lee como que la página se ha quedado enganchada.
  - La **barra de avance** dice cuánto queda.
  - El **contador** nombra en qué tarjeta vas.
  - (Hubo una tercera, la palabra gigante del fondo, que daba relieve moviéndose menos que las tarjetas. Se quitó; ver la sección de criterio de diseño.)
- **El bloque se fija también en móvil.** Hubo una temporada en que por debajo de 640 px esto pasaba a ser un carrusel de scroll nativo, por aquello de no secuestrar el gesto vertical. Se descartó: el desfile es el momento de esta sección y en el teléfono es justo donde más falta hace que algo ocurra al bajar; un carrusel al lado se queda en una fila de tarjetas que hay que descubrir.
- Lo que sí hay que cuidar al fijar en una pantalla pequeña son **la barra de avance y el contador**, y por eso ya no se ocultan en móvil: es ahí donde de verdad se necesitan, porque un bloque clavado sin referencias se lee como que la página se ha colgado. Solo desaparecen con movimiento reducido.
- **La fila no puede ser desplazable por su cuenta.** Quien la mueve es la timeline; si además llevara `overflow-x-auto`, el dedo la movería por un lado y el scroll por otro, y las dos cosas se pelearían por la misma posición.
- Se sigue montando con **`gsap.matchMedia`** aunque ya no haya corte por ancho: así se rehace solo al girar la pantalla o cambiar de tamaño, que es cuando cambia cuánto sobresale la fila.
- El pin le suma a la portada **unos 1.900 px de scroll en móvil**. Es el precio del efecto y está contado.
- La barra y el contador se escriben **directamente sobre el DOM** desde `onUpdate`, no con estado de React: cambian en cada fotograma del scroll y no deben provocar ni un render. Misma regla que el 3D.
- **Cuidado con `scale-x-*` de Tailwind v4 si vas a animar por JS.** Esa clase escribe la propiedad CSS `scale`, no `transform`, así que un `transform: scaleX(...)` en línea **no la pisa**: el elemento se queda a cero para siempre y no da ningún error. Por eso la barra arranca con `style={{ transform: 'scaleX(0)' }}` y no con la clase.
- La fila de avance deja hueco a la derecha (`pr-16`): ahí vive el botón flotante de WhatsApp y se comía el final de la barra.
- **El texto largo de cada servicio vive en `messages`, no en los componentes** (`services.items[i].long`, `.includes`, `.bestFor`). Lo usan dos sitios: el modal de la portada y las fichas de `/servicios`. Es el mismo contenido en los dos, así que si cambia un servicio se toca un único sitio y se arreglan los dos. Las etiquetas («Qué incluye», «Cuándo te interesa»…) van en `services.detail`.
- **En la portada el detalle se abre en modal** (`ServiceDialog.tsx`), y es por el sitio donde está: ahí lo que manda es el desfile horizontal, y nadie va a pararse a leer cuatro párrafos dentro de una tarjeta que se mueve. El modal saca el texto del desfile sin sacarte a ti de la portada.
- Ese modal va con **`<dialog>` nativo y `showModal()`**, no con un div y un overlay montado a mano. Así vienen de serie el foco atrapado dentro, el Escape, el resto de la página marcada como inerte para los lectores de pantalla y la capa de fondo (`::backdrop`). Y, lo que aquí importa más: un diálogo modal se pinta en la **capa superior** del navegador, así que se salta el `overflow` del carrusel de móvil y los `transform` del bloque fijo de escritorio. Montado a mano habría que pelearse con los dos.
- **Hay un solo diálogo para los seis servicios** y lo que cambia es su contenido. Con uno por tarjeta habría seis nodos en el DOM y seis sitios donde se puede quedar el foco.
- **Al `<dialog>` NO se le puede poner `position: relative`.** El navegador le da `fixed` cuando está abierto en modal; ponerle `relative` lo devuelve al flujo normal del documento, o sea al principio de la página, y entonces al abrirlo **el foco se va al diálogo y el navegador scrollea hasta allí**. Medido: la portada se iba del píxel 11.200 al 1.000 al abrir, y al 0 al cerrar.
  - Costó encontrarlo porque el síntoma es de scroll y la causa es de posicionamiento, y porque **no lo hacía ningún código nuestro**: se comprobó instrumentando `window.scrollTo`, `Element.scrollTo` y el `scrollTop` del documento, y no se llamaba a ninguno. También pasaba llamando a `showModal()` a mano, sin React y sin el bloqueo de scroll.
  - El ancla del aspa va en un `<div className="relative">` **dentro** del diálogo. Si hace falta posicionar algo más, que sea ahí.
- El diálogo se pinta en un **portal a `document.body`**. No arregló el salto de arriba —eso era el `relative`— pero es donde debe estar: colgaba del bloque que ScrollTrigger deja fijado durante el desfile, y un modal no debe depender de un contenedor que el scroll está moviendo.
- **El panel del modal lleva `data-lenis-prevent` y es obligatorio.** Sin él no hace scroll y parece que el modal está roto, pero el `overflow` está bien puesto: lo que pasa es que **Lenis engancha la rueda en toda la página y le hace `preventDefault`** para moverla él. Pararlo —que es lo que hace `lockScroll`— no basta, porque el escuchador sigue ahí y sigue cancelando el evento. Ese atributo es la forma que tiene Lenis de que le digas «aquí no te metas», y vale igual para la rueda y para el dedo.
- **Hay un botón de cerrar con aspa, arriba a la derecha y siempre visible.** Antes solo había un enlace de texto al final del todo: para cerrar había que leerse el servicio entero o saberse el Escape. Va fuera del contenedor que hace scroll, en posición absoluta, así que no se va nunca.
- **Al abrirlo se bloquea el scroll** (`lib/scrollLock.ts`), y ahí hay otra trampa ya pisada: **ese bloqueo no puede poner `overflow: hidden` en el `<html>`**. El elemento que hace scroll aquí es el propio `<html>`, así que volverlo no desplazable no congela la posición, la deja sin sitio donde estar y el navegador la recorta.
  - Con Lenis montado **basta con pararlo**: engancha la rueda y el dedo en toda la página y les hace `preventDefault`, así que parado la página no se mueve sola. No hace falta tocar el `overflow`.
  - **Sin Lenis sí hace falta otra cosa**, porque entonces nadie cancela la rueda: con movimiento reducido `SmoothScroll` no llega a montarlo. Ahí se usa la técnica del cuerpo fijo con `top` negativo, que **sí conserva la posición** y la devuelve al soltar.
  - El bloqueo lleva cuenta de cuántos hay abiertos para que cerrar uno no desbloquee lo que abrió otro.
- **La tarjeta entera es el botón**, no un enlace pequeño al final: en una tarjeta con foto, lo que la gente toca es la tarjeta. Y es un `<button>` de verdad, así que llega por tabulador y se abre con Intro. Lleva además una línea «Ver detalle»: sin ella la tarjeta no dice que se pueda abrir, y una tarjeta que no lo dice no se pulsa.
- **En `/servicios` no hay modal: cada servicio es una ficha a lo ancho.** A esa página llega quien ya se ha interesado y viene a enterarse, así que una rejilla de seis cuadraditos con dos líneas cada uno no le cuenta nada nuevo —y además no hay nada que posicionar en buscadores. La foto alterna de lado: con todas al mismo lado, seis franjas seguidas se leen como una lista larguísima.
- El pie de la sección (recuento + enlace con flecha) sustituye al botón suelto en mitad del oscuro, que no cerraba nada.

### Las seis páginas de servicio (`/servicios/<slug>`)

- **Cada servicio tiene su propia página**, y es el cambio de esta web que más clientes puede traer. El texto largo llevaba tiempo escrito y solo se veía en dos sitios donde no lo lee ni Google ni casi nadie: dentro del modal de la portada, que hay que abrir a mano, y amontonado con los otros cinco en `/servicios`. **Una página con seis servicios compite por una sola búsqueda; seis páginas compiten por seis**, y lo que teclea un cliente es «grupaje Castellón Madrid», no «servicios de transporte».
- **Y por eso el listado se quedó corto.** `/servicios` ya no repite el texto largo: enseña foto, nombre, la línea corta y el enlace. No es por aligerar, es que **dos páginas con el mismo contenido compiten entre ellas** y Google acaba quedándose con una, normalmente no la que querrías. El detalle vive en un solo sitio y el listado hace de índice.
- **El slug y la foto viven en `src/content/services.ts`, no en `messages`.** Una dirección web no puede depender de la posición en una lista: si mañana se reordenan los servicios, `/servicios/3` pasaría a ser otro servicio y los enlaces de fuera apuntarían a lo que no es. Ese archivo ata `slug` ↔ índice ↔ foto; el texto sigue donde estaba.
- **Los slugs van en español también en inglés** (`/en/servicios/grupaje`). Las rutas de esta web no se traducen —`routing.ts` no declara `pathnames`— y traducirlas obligaría a mantener dos tablas de rutas y a redirigir las antiguas, a cambio de posicionamiento en inglés para una empresa cuyo mercado es Castellón y Madrid.
- Cada página lleva **titular propio** (`heading`), **título y descripción para buscadores** (`seoTitle`, `seoDescription`) y **marcado `Service`** enlazado por `@id` al nodo de empresa de `BusinessJsonLd`, para que Google entienda que lo presta esa empresa y no un negocio suelto. El `h1` dice «Grupaje de palés entre Castellón y Madrid» y no «Grupaje (LTL)»: el nombre corto sirve para una tarjeta entre otras cinco, no para la primera línea de una página a la que se llega buscando.
- **Las seis están enlazadas desde el pie, en todas las páginas.** Una página a la que solo se llega desde su listado lo tiene mucho más difícil que una enlazada desde el sitio entero.
- El modal de la portada **lleva enlace a la página completa**. No está para repetir lo que ya cuenta: está porque **un modal no se puede enlazar** y la gente guarda y comparte direcciones.
- **La foto de la ficha va a lo ancho y lo primero, no en una columna al lado del texto.** La columna lateral se veía bien en escritorio y era insalvable en móvil, que es donde se lee esto: allí no hay dos columnas, así que la foto caía **en mitad del texto** —línea de entrada, foto, resto— y partía la lectura en dos. (Antes de eso llevó `sticky` sin prefijo de pantalla, y en móvil la foto se quedaba flotando encima del texto; se arregló con `lg:sticky` y luego el `sticky` se fue entero con la columna.)
- **Por eso la cabecera de estas páginas no lleva párrafo.** Con él, la foto seguía quedando entre dos trozos de texto por mucho que se moviera. El párrafo baja a encabezar el cuerpo, debajo de la foto, a mayor cuerpo que el resto: es la frase que resume el servicio y la que lee quien no va a leer más. `intro` es opcional en `PageHeader` justo por esto, y sin él el titular se queda con todo el ancho —media columna vacía al lado se lee como que falta algo—.
- **«Qué incluye» y «Cuándo te interesa» van en la columna de al lado**, no debajo del texto largo: son de consulta, no de lectura seguida, y al final quedaban a un scroll de distancia de donde surge la pregunta. En móvil caen detrás, que es el único sitio posible.
- **El listado va en filas alternas, no en rejilla.** Estuvo en una rejilla de tres por dos con los filetes pegados, y seis cuadrados tocándose se leen como una tabla: una tabla no invita a entrar en ninguna de sus celdas. Ahora cada servicio ocupa su fila, foto a un lado y texto al otro, alternando el lado.
- **El texto de esas filas va en espejo**: cuando la foto está a la izquierda, el filete rojo, el titular y el enlace se alinean a la derecha, y al revés en la fila siguiente. Es lo que convierte seis bloques iguales en un zigzag y hace que la vista baje sola. Lo que **no** se invierte es el sentido de lectura: el párrafo va siempre en banderola y corto, nunca varias líneas justificadas a la derecha.
- **En móvil no hay espejo**, y es a propósito: una columna, foto encima y texto debajo, todo a la izquierda. Alternar dentro de una sola columna no se lee como ritmo, se lee como que algo baila.
- **Cada fila lleva tres datos cortos** (`highlights` en `messages`), y son los que le faltaban a esta página. Medido: cada fila ocupaba unos 440 px para dar **dos líneas de texto**; la foto se quedaba en la mitad del ancho y al lado sobraban doscientos píxeles de columna vacía. Seis seguidas hacían una página larguísima que no contaba nada, y es la página que debería vender.
- **No son el `includes` recortado, y la diferencia importa.** `includes` son cuatro frases enteras y viven en la ficha; copiarlas al listado recrearía justo lo que esta página resolvió a propósito —dos páginas con el mismo contenido compiten entre ellas—. `highlights` son condensaciones de tres a cinco palabras, y cada una dice **un dato**: una cifra, una medida, una limitación. «+150 localidades de recogida», no «servicio excelente».
- Van separados por filete y **no por viñetas**: una viñeta a la derecha, en las filas en espejo, cuelga del lado que no es. El filete funciona en los dos sentidos.
- **Si añades un servicio son tres sitios**: el texto en `messages.services.items` —con sus tres `highlights`—, la foto en `content/media.ts` y la entrada en `content/services.ts`. El sitemap lo recoge solo, porque `lib/seo.ts` lee esa lista.

## La página de cobertura (`/cobertura`)

- **«Rutas y cobertura» vivía solo como sección de la portada**, o sea cuatro frases de una línea a once pantallas de scroll de la cabecera. Dicho de otra forma: la web no competía por **ninguna** búsqueda de cobertura, que es justo lo que teclea un cliente —«transporte Castellón Madrid», «recogida de palés en Onda», «envío a Madrid desde Castellón»—. Es el mismo razonamiento que partió `/servicios` en seis páginas: **una página con seis cosas compite por una búsqueda; seis páginas compiten por seis.**
- Y no es una página de relleno: el corredor diario **es** el producto de esta empresa. Hasta ahora lo contaba el 3D, que no lee Google, y cuatro renglones al final de la portada.

### De dónde sale el contenido, que es la parte delicada

- **De cosas ya publicadas, no de afirmaciones nuevas.** Los cuatro niveles salen de `route.coverage`; los tres puntos de cada uno, de los `includes` de los servicios; las paradas del mapa, de `route.mapStops`. Ni una afirmación nueva sobre la empresa.
- **Y no repite lo que ya dice otra página.** Dos páginas con el mismo contenido compiten entre ellas, que es lo que se corrigió al acortar el listado de servicios. Aquí no se cuenta qué es el grupaje: se cuenta **hasta dónde llega**.
- **La excepción, y hay que confirmarla con el cliente: la lista de localidades.** La web ya publica «+150 localidades de recogida en la provincia de Castellón», y la provincia tiene 135 municipios, así que ese número solo cuadra si se cuenta prácticamente toda la provincia y sus pedanías. Sobre esa base se nombran doce del clúster azulejero —Almazora, Castellón, Onda, Vila-real, l’Alcora, Nules, Betxí, Borriol, Burriana, la Vall d’Uixó, Alquerías, Sant Joan de Moró— con un «entre ellas» por delante y un «¿no ves la tuya? pregúntanos» por detrás. **Es el texto de esta web que más fácil puede estar mal, y es el primero que hay que enseñarle al cliente.**

### Las decisiones de maquetación

- **El mapa de la ruta es el mismo componente de la portada** (`RouteMap`). Repetir el componente no es repetir contenido: lo que posiciona es el texto de alrededor, que aquí es otro, y esa pieza explica el corredor sin una palabra de más.
- **Los cuatro ámbitos van en rejilla pegada con filete**, como la banda de cifras y las sedes, y no en tarjetas con marco: cuatro tarjetas convertirían cuatro ámbitos en cuatro productos, y no lo son —son el mismo servicio llegando más o menos lejos—.
- **Las localidades van como etiquetas**, el mismo recurso que las del bloque destacado de Servicios. Son nombres sueltos, no frases: en columna darían una lista de doce renglones de dos palabras.
- **Aquí no va `Sites`**, aunque haya un bloque de sedes. Aquel componente monta el hueco del mapa, que arrastra el consentimiento de cookies y un bloque alto por sede. En esta página las naves son un dato de cobertura —de dónde sale y dónde llega—, no una invitación a visitarlas: para eso está `/contacto`.

### Cómo se llega, y por qué no desde el menú

- **Desde el pie**, que va en todas las páginas, y **desde la propia sección de cobertura de la portada**, con un enlace al lado de la línea de las dos sedes. Un resumen sin salida se lee como todo lo que hay.
- **No desde el menú.** Son ya cinco entradas, y una sexta en condensada y versales empieza a apretar en portátiles. El pie es enlazado de sitio completo igualmente, que es lo que importa.
- **Si añades otra página, son tres sitios**: `SITE_PATHS` en `lib/seo.ts` (o no entra en el sitemap), la lista `RUTAS` de `scripts/audit-seo.mjs` (o el arnés no la mira — ya pasó: auditaba 30 páginas con 32 publicadas) y el pie.

### El aviso «1 Issue» que salió al mirarla

- La página salió bien a la primera, pero la captura enseñó el aviso de las herramientas de Next. Era un **descuadre de hidratación**, y no era de esta página: medido, salía en **todas** y **solo cuando ya había cookie de consentimiento**.
- La causa es el script de la cabecera: pone `data-cookies="hecho"` en el `<html>` **antes** de que React hidrate, así que React se encuentra un atributo que él no había renderizado. Se arregla con `suppressHydrationWarning` en el `<html>`, que es el apaño que usa `next-themes` y por el mismo motivo —un script que decide algo antes de pintar tiene que tocar el `<html>`, y el `<html>` lo renderiza React—.
- Silencia **ese elemento y su texto directo, nada más**: cualquier descuadre de verdad más adentro sigue avisando.

## La calculadora de palés: quitada

- **Estuvo en `/blog/calculadora-palets` y la quitó el cliente.** Contestaba
  cuántos metros lineales ocupa una expedición y si compensaba grupaje o
  camión completo. **No volver a montarla sin que la pida.**
- Lo que se fue con ella: la página, `PalletCalculator.tsx`, `lib/pallets.ts`
  —toda la aritmética del semirremolque—, el bloque `tools` de `messages`, su
  entrada en `SITE_PATHS` y en el guion de `check:seo`, y la tarjeta que
  tenía en el blog.
- **Dejaba hueco en dos sitios y los dos se recolocaron**, que es lo que de
  verdad hay que saber si alguna vez vuelve:
  - **El índice de la portada** tenía cinco tarjetas y una era la
    calculadora. Con cuatro, la rejilla de 3 × 2 se llena poniendo
    `row-span-2` en Servicios y `col-span-2` en la foto: sin huecos y con la
    foto al doble de ancho, que es como mejor se lee una foto.
  - **El «Seguir leyendo» de los artículos** eran dos artículos más la
    herramienta, en tres columnas. Ahora son tres artículos.
- La fórmula, por si hiciera falta rehacerla: metros lineales = (largo ×
  ancho) / 2,40, y en grupaje cada 1.750 kg cuentan como un metro lineal, con
  facturación por el mayor de los dos números.

## El cierre de los artículos del blog

- Un artículo que acaba y ya está deja a quien lo ha leído entero —o sea, a quien más interés tiene— sin ningún sitio al que ir. Ahora cierran con dos cosas.
- **«Seguir leyendo»**: los tres artículos más recientes que no sean ese. Se ordenan solos; **no hay lista de relacionados escrita a mano**, porque una lista a mano se queda desfasada en cuanto se publica algo y nadie se acuerda de repasarla. Fueron dos más la calculadora; al quitarla entró un tercero para que la rejilla no quedara coja.
- **El bloque de llamada va a sangre y en azul noche, no en una tarjeta con marco.** Era un recuadro de la anchura del texto al final de la columna, o sea una nota más del artículo, y se leía como tal. Un artículo termina; esto es lo que pasa después y tiene que notarse que cambia la cosa. Lleva `data-bg="night"`, así que lo funde `Backdrop` en vez de entrar como un rectángulo.
- Por lo mismo, el `<article>` pasó de `py-20` a `pt-20`: con el relleno de abajo quedaba una franja de crema entre el azul y el pie.
- **El titular pregunta en vez de ofrecer** («¿Mueves palés a Madrid?»). Quien acaba de leerse cuatro minutos sobre palés ya sabe que mueve palés; lo que no sabe es que esto se lo hacemos nosotros todos los días.
- Y ese pie va **centrado, no pegado a la derecha**. Alineado al borde tenía sentido cuando compartía fila con el recuento «06 · Servicios»: eran dos cosas repartidas a los extremos. Quitado el recuento, un enlace solo contra el margen derecho se lee como que falta algo a su izquierda.

## Secciones con efecto (cómo están montadas)
- **Servicios en horizontal** (`ServicesTrack.tsx`): el bloque se fija y la fila de tarjetas se desplaza lo que sobresale por la derecha. La sección que lo contiene **no puede llevar `overflow-hidden`**: recorta el `position: sticky` con el que ScrollTrigger fija, y el efecto deja de funcionar sin dar ningún error.
- **Nosotros abre con su titular, y el vídeo viene debajo enmarcado** (`VideoFrame.tsx`). Antes era al revés: el vídeo a sangre, a pantalla casi completa, con el titular encima. El problema de aquello era que se entraba a Nosotros sin saber que se había entrado a Nosotros —lo primero que se veía era un plano en movimiento sin nada que lo presentara—, y además costaba caro:
  - **Hacía falta recortar.** A pantalla completa, `object-cover` se comía los bordes del plano. Dentro del marco se ve entero, con su proporción.
  - **Se veía peor.** El archivo tiene **848 px de ancho**. A 1920 de ventana se ampliaba **2,26 veces**; dentro del `Container` se queda en **1,26** y la diferencia se nota. (La solución de verdad sigue siendo pedirle al cliente el original en 1080p: lo que hay es una copia reducida.)
  - **Había texto encima**, con un velo degradado tapando el tercio inferior por si caía letra ahí. Ya no hace falta ninguna de las dos cosas.
- **El marco no es un rectángulo, y la forma está sacada del camión.** Tres piezas:
  - **Dos esquinas cortadas en diagonal**, arriba a la izquierda y abajo a la derecha. Van en esquinas opuestas a propósito: así la figura es simétrica respecto al centro y se lee como una forma, no como un fallo de recorte en una esquina suelta.
  - **La muesca de arriba va en rojo macizo**, rellenando exactamente el triángulo que el recorte le quita al vídeo. Es el único sitio de la página donde el rojo aparece en bloque, que es como la marca lo quiere: en acento y pequeño.
  - **Abajo, un zócalo azul noche con las dos rayas de la casa**, roja fina sobre azul gruesa, las mismas de la puerta de la tractora (`public/media/camion-02.jpg`). El corte de abajo a la derecha **atraviesa ese zócalo**, y eso es lo que ata los dos cortes: se ve que la diagonal corta algo, así que se lee como decisión y no como un borde raro.
- El tamaño del chaflán va en una variable (`--cut`) con `clamp`, y **no por puntos de corte**: 72 px fijos son un detalle en escritorio y se comen la esquina entera en un móvil de 390. La usan el recorte del marco y el triángulo rojo; si se desincronizan, se ve el escalón.
- **Va mudo siempre y no hay botón para activarlo.** Arranca mudo por obligación —ningún navegador deja reproducir solo con sonido—, pero que se quede así es decisión.
  - **Consecuencia a tener presente:** en el vídeo habla alguien a cámara y no hay forma de oírlo. Si ese audio llega a importar, lo que toca es llevarlo a un reproductor con controles, no devolver un botón flotante.
- **No hay pie de vídeo.** Decía «Vídeo corporativo de la empresa.» y explicar que eso es un vídeo no le dice nada a nadie. El `videoLabel` sigue como `aria-label` del elemento, que es donde hace falta de verdad.
- **Cuidado al comprobar la reproducción desde un panel de navegador oculto:** el observador informa de área cero y pausa el vídeo, que es exactamente lo que debe hacer. Parece una regresión y no lo es. Para verificarlo de verdad hay que abrirlo en una ventana visible (o con `playwright-core`, como hace `check:3d`). Ya me ha engañado una vez.
- El vídeo se **reanuda solo** al volver a la pestaña: el navegador lo suspende al perder visibilidad y no lo recupera por su cuenta. Y se pausa al salir de pantalla, pero **solo si la ventana tiene tamaño**: con la ventana minimizada o tapada el navegador informa de área cero, así que "nada intersecta", y sin esa comprobación el vídeo se quedaba congelado para siempre. Ya pasó.
- `RevealText` usa **IntersectionObserver y no ScrollTrigger** a propósito: encima hay un vídeo que cambia la altura de la página al cargar, y un disparador calculado antes de eso deja el texto invisible para siempre. Ya pasó, y sigue valiendo aunque el vídeo ya no ocupe la pantalla entera.
- **Formulario de presupuesto en tres pasos** (`QuoteForm.tsx`): qué mueves → de dónde a dónde → cómo te llamamos, con barra de avance. Los campos que no están en pantalla siguen registrados, así que al volver atrás no se pierde nada. El submit está interceptado para que Intro en un paso intermedio avance en vez de enviar. **Sigue sin enviar de verdad**: abre WhatsApp o el correo.
- **Mapa de la ruta** (`RouteMap.tsx`): la silueta de la península es un trazado **simplificado a mano**, proyectando longitud y latitud de los puntos de costa reconocibles sobre el lienzo. No es cartografía y no hace falta que lo sea: pesa unos cientos de bytes en vez de los cientos de kB de un SVG real.
- **Los hitos de esa ruta van sin hora, y no se pueden volver a poner.** Llevaban una cada uno (06:00, 09:00, 14:00, «24 h») y ninguna era real: estaban para que la lista pareciera un horario. Una hora concreta en una web de transporte es un compromiso, y publicar uno que no se cumple es peor que no publicar ninguno. Lo cierto —el orden de los pasos y que se entrega al día siguiente— ya lo cuentan el propio orden de la lista y el texto de entrada. Se quitaron también de `messages`, no solo de la vista, justo para que no vuelvan solas.

## Las vías de contacto (`/contacto`)

- **Eran cuatro tarjetas sueltas con tres maquetaciones distintas entre ellas:** WhatsApp ponía el nombre y el número en la misma línea, el correo etiqueta arriba y valor abajo, y las dos sedes etiqueta, número y horario. Cuatro cajas flotando en columna, cada una con su forma, al lado de una tarjeta de formulario que sí es una pieza entera.
- Ahora es **una sola tarjeta con cuatro filas** separadas por filete, y las cuatro con la misma forma: antetítulo, el dato sobre el que se actúa y, si lo tiene, su nota (`Via` en esa página). Las que no tienen nota no la pintan, y en una pila vertical eso no deja hueco —al revés que en una rejilla—.
- **WhatsApp ya no repite el número, y eso era un fallo.** La tarjeta enseñaba `sites[0].phone`, que es exactamente el fijo de Castellón que aparece dos filas más abajo con su horario: el mismo número dos veces en la misma pantalla y una de ellas etiquetada como otra cosa. Ahora lo que se anuncia es la vía.
- **Aviso para el futuro:** `whatsappUrl` apunta a `wa.me/34964532400`, que **es** el fijo de Castellón. Si algún día hay un móvil de WhatsApp distinto, esto hay que volver a mirarlo.

## Los huecos de foto de las páginas interiores

- **`/faq` y `/contacto` eran tipografía sobre crema de arriba abajo.** La portada va cargadísima —intro 3D, mosaico, desfile, banda de cifras— y las interiores van desnudas: ese salto entre unas y otras se nota, parecen dos sitios distintos.
- Los dos huecos están **declarados y vacíos a propósito** (`PAGE_PHOTOS` en `content/media.ts`), con su `brief`, su ancho y su proporción al lado, igual que los de las sedes. Mientras no lleguen los archivos los pinta `CoverPlaceholder`, que es la misma pieza del blog: un bloque en los tonos de la casa con la proporción exacta que tendrá la foto. **No hay nada que quitar el día que lleguen**: basta con rellenar el `src`.
- **Dónde va cada una es parte de la decisión:**
  - En `/faq`, **detrás de las respuestas y no delante**. Quien entra aquí viene a leer; una imagen antes de la primera pregunta se interpone. Al final hace de bisagra hacia el cierre: se acaban las respuestas, se ve a quien las da, y entonces se pide presupuesto. Apaisada y ancha.
  - En `/contacto`, **debajo de las vías**, donde sobraban trescientos píxeles de columna vacía: el formulario de al lado es alto y la lista de vías es corta. Cuadrada, que es lo que cabe en una columna estrecha sin quedarse en una tira. Solo en escritorio: en móvil esa columna va debajo y no hay hueco que llenar.
- **El blog ya lo tenía resuelto** y conviene no tocarlo: su listado pinta `CoverPlaceholder` en la columna de portada desde que existen los artículos sin foto.

## Blog

- Los artículos viven en `src/content/blog.ts`, en español e inglés, como bloques (`p`, `h`, `ul`) y no como HTML suelto. Entran solos en el sitemap y cada uno genera su página con su canonical y su hreflang.
- **El hueco de portada lo ocupa `CoverPlaceholder`**: pinta la foto si existe y, si no, un bloque de color en los tonos de la casa con la proporción exacta que tendrá. Está para ver cómo va a quedar la página el día que lleguen las fotos, que es lo que no se podía juzgar con el hueco ausente. No lleva texto ni icono a propósito —un «foto pendiente» se lee como un error si esto se publica—, el tono sale del `slug` para que no cambie entre recargas, y **desaparece solo** en cuanto el artículo tenga `cover`.
- **Ahora mismo no hay fotos de portada y es a propósito**: las añadirá el cliente más adelante. El campo `cover` sigue existiendo pero es **opcional**, y todo lo que lo usaba sabe apañarse sin él: el listado se queda sin columna de foto (el titular pasa de seis a nueve columnas), el artículo abre directamente con el texto, y Open Graph y el marcado `Article` **omiten la imagen** en vez de apuntar a un archivo que no existe. El día que lleguen las fotos basta con rellenar `cover`.
- Los temas se eligen por **búsqueda real, no por lucimiento**: medidas y peso de un palé, metros lineales, cuánto cuesta enviar un palé a Madrid, qué cubre el seguro de transporte y cuándo compensa un almacén regulador. Todos responden a algo que un cliente teclea de verdad y todos acaban donde acaba el negocio: la ruta Castellón ⇄ Madrid y el azulejo.
- Las fechas van repartidas por el año y **nunca en el futuro**: un artículo fechado mañana se lee como un error y los buscadores lo tratan como tal.
## Seguridad de la cabecera (`next.config.ts`)

- **No había ninguna cabecera de seguridad.** Ese archivo tenía once líneas y lo único que hacía era apagar el distintivo de desarrollo. Sin `frame-ancestors`, cualquiera puede meter esta web dentro de un iframe y hacerla pasar por suya: es el fraude más barato que existe con la web de una empresa.
- Van seis: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` y `Strict-Transport-Security`.

### La política se puede apretar porque esta web casi no tiene terceros

Y eso no es casualidad, es la regla del proyecto. Comprobado antes de escribirla:

- Las tipografías van por **`next/font/google`, que las descarga en el build y las sirve desde nuestro dominio**. No hay ni una petición a Google en tiempo de ejecución, así que `font-src` no se abre.
- El 3D monta su `Environment` con `Lightformer` dentro de la escena, no con un HDRI descargado.
- **El único tercero es el iframe de Google Maps**, y solo existe en el DOM cuando hay consentimiento. De ahí el `frame-src`.

Lo que sí hay que abrir, con el motivo:

- **`'unsafe-inline'` en scripts**: Next inyecta scripts en línea para la hidratación. Quitarlo pide nonces por petición, o sea pasar todo por el proxy y renunciar al prerenderizado estático de las 30 páginas. No compensa.
- **`'unsafe-inline'` en estilos**: Tailwind y Next escriben estilos en línea. El riesgo es mucho menor que en scripts.
- **`'unsafe-eval'` y `ws:` solo en desarrollo**, que son el recargado en caliente. En producción no se abren.

### `wasm-unsafe-eval`: sin ella, en producción no hay 3D

- **Esta cabecera ha roto el 3D dos veces, por dos directivas distintas, y las dos veces de la misma manera: pasando la comprobación en el sitio equivocado.**
- `truck.glb` **requiere** `EXT_meshopt_compression` —lo declara en su propio `extensionsRequired`, se lee abriendo el archivo— y ese descompresor es **WebAssembly**. Con `script-src 'self' 'unsafe-inline'` el navegador lo bloquea: «Could not load /models/truck.glb: WebAssembly.instantiate() violates the following Content Security policy directive». Sin camión no hay escena, así que la página entera se iba al modo `sin3d` **en producción**.
- **Y se coló porque `'unsafe-eval'` se abrió solo en desarrollo**, que es donde se comprobó que el 3D seguía funcionando. En desarrollo el wasm pasa por esa puerta; la cabecera de producción **no se había mirado nunca con la escena delante**.
- La directiva que hace falta es la estrecha: **`'wasm-unsafe-eval'`**, que permite compilar WebAssembly y nada más —en particular **no** permite `eval()` de cadenas de JavaScript, que es el riesgo de verdad—. Va en producción también. La entienden Chrome 97+, Firefox 102+ y Safari 16.4+; uno más viejo la ignora, no abre wasm y cae en el respaldo `sin3d`, que para eso está.
- **Cómo se cazó, que es lo que vale para la próxima**: no mirando la página —se pintaba entera— sino **leyendo la consola de una compilación de producción servida con `next start`**. Está en `tests/perf/medidas/motivo-sin3d.mjs`: carga la portada y imprime el aviso que `marcarSin3D()` deja siempre con el motivo. Si el 3D vuelve a no salir, ese guion lo dice en una línea.
- **Regla que queda:** cualquier cambio en esta cabecera se comprueba contra `next start`, no contra `next dev`. Son dos políticas distintas a propósito, así que probar una no dice nada de la otra.

### `connect-src` es el que rompe el 3D, y no se ve venir

- Con `connect-src 'self'` a secas **el 3D no arranca**. `GLTFLoader` saca las texturas de los GLB **creando un blob por cada una y pidiéndolas con `fetch`**, así que el navegador las bloquea una a una («Couldn't load texture blob:...») y el lienzo se queda sin montar, a 300 px.
- **Se vio leyendo la consola, no mirando la página**: la portada seguía pintándose entera —navbar, titular, textos— y el fallo era que detrás no había nada. Una cabecera escrita sin comprobar habría llegado a producción con el 3D muerto, que es lo único que esta web tiene y la competencia no.
- La política lleva `blob:` en `img-src`, `worker-src` **y `connect-src`**.
- **Cómo se comprueba, y son cuatro vías**: que las cabeceras se sirvan (`curl -sI`), que el canvas monte a su tamaño real y no a 300 px, que **una pestaña nueva** no dé ni un error en consola —en la misma pestaña quedan los del cargue anterior y engañan— y que `check:3d` siga a 0,00 %.

## Comprobaciones automáticas (`.github/workflows/comprobaciones.yml`)

- **No había CI.** `lint`, `build`, `check:fotos`, `check:seo` y `check:3d` solo se lanzaban a mano, o sea cuando alguien se acordaba.
- Entran los que no necesitan nada más que Node: **`lint`, `check:fotos`, `build` y `npm audit`**. El audit mira **solo producción**: una vulnerabilidad en una herramienta de desarrollo no la sufre el visitante.
- **`check:3d` y `check:seo` no entran**, y es decisión. Los dos necesitan un servidor levantado, y el visual además un Chrome y las referencias versionadas: en una máquina distinta a la de las capturas las diferencias de renderizado darían falsos fallos, y un arnés que salta solo se deja de mirar a la tercera. Siguen siendo una puerta local.
- **`check:fotos` informa pero no bloquea** (`continue-on-error`), y también es decisión: hoy ya falla, porque tres de las ocho fotos son verticales en huecos apaisados, y eso lo arregla el cliente mandando archivos. Una comprobación que nace en rojo y seguirá en rojo durante semanas enseña a ignorar el aviso. **Cuando lleguen las fotos buenas, se quita esa línea y pasa a bloquear.**
- El build de la CI va **sin `--webpack`** y en Linux, así que comprueba de paso la compilación que hará el servidor de producción.

## Rendimiento de la portada, medido en producción

Todo lo de aquí sale de medir una **compilación de producción** servida con
`next start`, no el servidor de desarrollo. Los guiones están en
`tests/perf/medidas/` y el informe en `tests/perf/linea-base.md`.

### Lo primero: la nota que había era falsa

- La portada marcaba **58** de rendimiento en móvil, y era mentira: se estaba
  midiendo **una página sin 3D**, porque la cabecera de seguridad bloqueaba el
  wasm del camión y la escena no llegaba a montarse (ver «`wasm-unsafe-eval`»).
  Sin 3D, el hilo principal casi no tiene trabajo.
- Arreglada la cabecera, la nota honesta era **46**. O sea que la mejora
  aparente de la pasada anterior era el precio de haber roto lo único que esta
  web tiene y la competencia no.
- **Lección, y es general:** una métrica que mejora de golpe sin que nadie haya
  optimizado nada es sospechosa. Lo primero que hay que preguntarse no es
  «cuánto he ganado», es **«qué ha dejado de ejecutarse»**.

### El CLS de 0,383, que era el mismo fallo por otra puerta

- Lighthouse señalaba **un único desplazamiento** que se llevaba 0,3827 de los
  0,3830: la sección del índice aparecía a **508 px** del principio de la
  página cuando, detrás de un hero de 420svh, tendría que estar a más de 3.400.
- Medido con `tests/perf/medidas/cls.mjs`: al cargar, el hero medía 3.457 px
  y el índice estaba a 3.538; asentada la página, el hero medía **427** y el
  índice **508**. La página se encogía de 20.677 px a 14.059 **después del
  primer pintado**.
- Era el respaldo `sin3d` activándose —correctamente— al caerse la escena, solo
  que **después de pintar**. Arreglada la cabecera: **0,3831 → 0,0003** en
  móvil y 0,3912 → 0,0001 en escritorio.
- **Lo que queda escrito de esto:** el modo `sin3d` cambia el alto de la página
  en varias pantallas. Mientras la decisión se tome en JavaScript después de
  pintar, activarlo **siempre** costará un CLS enorme a quien lo sufra. Hoy no
  le pasa a casi nadie porque casi todo el mundo tiene WebGL; si algún día hay
  que decidirlo antes, lee lo de abajo sobre scripts que bloquean.

### El 3D no se carga hasta que el navegador tiene un hueco

- Medido: el LCP tenía **5,7 s de «render delay»** sobre 0,45 de servidor, y
  había **8.812 ms de evaluación de JavaScript**, con un trozo de 1,1 MB
  —three, r3f, drei y el postprocesado— bloqueando casi un segundo.
- `dynamic(..., { ssr: false })` ya partía ese trozo en un archivo aparte, pero
  **no lo apartaba del momento crítico**: en cuanto React hidrata, el
  componente se renderiza y el trozo se pide y se evalúa justo mientras la
  portada intenta pintar su primera línea. Lo que hacía falta no era
  separarlo, era **no renderizarlo todavía**.
- Ahora `ExperienceCanvas` espera **lo primero de tres cosas**: que el
  navegador diga que está libre (`requestIdleCallback`, y no antes del primer
  pintado), que alguien toque la página, o un tope de 1.200 ms. Las tres hacen
  falta: sin la segunda, quien baje el dedo enseguida entra en cuatro
  pantallas de intro vacía; sin la tercera, una pestaña que no se queda quieta
  nunca podría no montar la escena jamás.
- **No cambia lo que ve el visitante**, y es lo que lo hace barato: el
  `Preloader` vive **dentro** de `Experience`, así que ya hoy aparecía después
  del primer pintado —sobre 1,5 s con red normal—. Lo que se mueve son unos
  centenares de milisegundos de algo que ya pasaba en ese orden.
- Resultado medido: evaluación de JavaScript **8.812 → 6.466 ms**, hilo
  bloqueado **2.760 → 1.540 ms**, Speed Index 4,5 → 3,8 s. Y el arnés visual a
  **0,00 % en las quince tomas**.
- **El que no se puede diferir es GSAP**, y conviene saberlo antes de
  intentarlo: lo importan **catorce** módulos repartidos por toda la página
  —`ScrollFade`, `Backdrop`, `SmoothScroll`, `CountUp`, `RevealText`…—, así que
  entra en el primer paquete haga lo que haga el 3D. Son 132 KB y, medido, la
  tarea más larga de la carga (2.050 ms). Apartarlo pide refactorizar esos
  catorce sitios, no una línea.

### Fuera el cargador de Draco, que era una mina

- drei trae `useDraco = true` por defecto en `useGLTF`, así que construye un
  `DRACOLoader` y le apunta el descompresor a
  **`https://www.gstatic.com/draco/...`**. Hoy no se dispara, porque ninguno de
  los tres GLB usa esa extensión —se comprobó leyendo el `extensionsRequired`
  de cada archivo—, pero el cargador entra en el paquete **y** queda una
  petición a Google esperando el día que alguien comprima un modelo con Draco.
  Eso va contra la regla de este proyecto de no cargar nada de terceros.
- Los tres `useGLTF(MODEL)` y los tres `useGLTF.preload(MODEL)` llevan ahora un
  `false` detrás. **Si añades un modelo, pónselo también.**

### El banner de cookies era el elemento del LCP

- **Es el bloque de texto más grande que se pinta en la portada**, así que es
  el elemento que mide esa métrica. Y llevaba `useHydrated()` en su condición,
  que vale `false` en el servidor: no existía en el HTML y aparecía **cuando
  hidrataba la página entera**. Medido: **LCP de 5,8 s con 5,4 de «render
  delay»**, cuando el primer pintado ya había ocurrido a los 0,9 s.
- O sea que la peor métrica de la portada **no la causaba el 3D**: la causaba
  un banner esperando a JavaScript para aparecer.
- Ese `useHydrated()` estaba ahí por un motivo bueno, y no se puede quitar a
  secas: en el servidor no se puede leer la cookie, así que un banner servido
  en el HTML **le parpadearía en cada página a quien ya decidió**. Eso es peor
  que tardar.
- Lo que lo resuelve es tomar la decisión **antes del primer pintado**: el
  banner sale en el HTML y un script que bloquea en la cabecera lee la cookie
  —que es **propia**, así que no hay ninguna petición a nadie— y pone
  `data-cookies="hecho"` en el `<html>`; el CSS lo esconde con eso.
- **Comprobado en el primer pintado y con la hidratación bloqueada** (abortando
  solo los `.js`, no los `.css`, que en Turbopack viven en la misma carpeta y
  bloquear los dos da un falso fallo): primera visita → banner en el DOM y
  visible; quien ya decidió → atributo puesto y banner invisible. Sin
  parpadeo.
- Vive en **`src/lib/consentCookie.ts`**, un archivo sin nada de React, porque
  el layout es un componente de servidor y Next rechaza de plano importar algo
  que dependa de `useSyncExternalStore`. `consent.ts` lo vuelve a exportar para
  que el resto del proyecto no note la diferencia. El nombre de la cookie, la
  versión, el atributo y el script salen **del mismo sitio**: con la cadena
  copiada a mano, subir `CONSENT_VERSION` dejaría el script mirando la versión
  vieja y **nadie volvería a preguntar**, que es justo lo que la AEPD exige que
  no pase.
- `useHydrated()` **sigue haciendo falta en `MapEmbed`**, y es otro caso: allí
  lo que no puede existir antes de saberlo es un **iframe de Google**, y eso no
  se arregla con CSS, porque un iframe escondido ya ha hecho la petición.

### Un script que bloquea solo se gana el sitio si lo que pregunta es gratis

Esta es la regla que sale de las dos decisiones de arriba, y están medidas las
dos:

| | cuesta | ¿va en la cabecera? |
| --- | --- | --- |
| leer una cookie propia | microsegundos | **sí** (el consentimiento) |
| abrir el primer contexto WebGL | **1.277 ms** | **no** |

El segundo número es el que importa y es el que no se ve venir: se midió con
`tests/perf/medidas/sonda-webgl.mjs`, diez veces. La **primera** vez cuesta
1.277 ms —es el proceso de la GPU arrancando— y las nueve siguientes 1,8 ms de
mediana. O sea que mover la comprobación de WebGL a un script que bloquea
habría cambiado 0,38 de CLS por **un segundo y cuarto de pantalla en blanco**.
Se descartó antes de escribirlo.

### Simulado contra frenado real: 50 contra 86

- Con el modo por defecto de Lighthouse (`--throttling-method=simulate`) la
  portada da **50**, con un LCP de 5,9 s. Con frenado **real**
  (`--throttling-method=devtools`) da **86**, con un LCP de 2,0 s.
- La diferencia no es ruido: el modo simulado **supone** que el párrafo del
  banner no puede pintarse hasta que acabe todo el JavaScript que bloquea, y
  medido eso no es verdad. Observando lo que declara el propio navegador con
  la CPU a 1/4 (`tests/perf/medidas/lcp.mjs`), ese párrafo es el único
  candidato a LCP y **se pinta a 1.420 ms, con el primer pintado**.
- **Cuál es el bueno, para no discutirlo cada vez:** el objetivo del proyecto
  es «Performance ≥ 80 en móvil» y hoy se cumple con frenado real. El número
  simulado se apunta igual, porque es el que enseña PageSpeed Insights y es el
  que va a ver el cliente si lo prueba.

| | simulado | frenado real |
| --- | --- | --- |
| FCP | 0,9 s (100) | 2,0 s (85) |
| LCP | 5,9 s (14) | **2,0 s (97)** |
| CLS | 0 (100) | **0 (100)** |
| hilo bloqueado | 1.580 ms (12) | 450 ms (63) |
| Speed Index | 3,9 s (83) | 2,6 s (97) |
| **nota** | **50** | **86** |

### El postprocesado ya no viaja al móvil

- La viñeta llevaba tiempo apagada por debajo de 768 px, porque medido cuesta
  **la mitad de los fotogramas** en un teléfono (30 fps contra 88 en el
  patio). Lo que no se había mirado es que **el módulo viajaba igual**:
  `postprocessing` y `@react-three/postprocessing` entraban en el trozo de
  1,1 MB del 3D y se descargaban y se evaluaban en un teléfono para no pintar
  nada.
- Ahora va con `lazy`, y **la decisión se toma una sola vez, al montar**. Esto
  no contradice la nota de `Postproceso` —«va con `enabled`, no desmontando el
  componente»—: son dos cosas distintas. `Experience` decide si el módulo
  **llega a cargarse**, que es de una vez; el componente sigue decidiendo si
  **se ejecuta**, que sí reacciona al tamaño. Girar el teléfono no monta ni
  desmonta nada.
- **El umbral se mudó a `lib/pantalla.ts`**, y no es manía de orden:
  `Experience` lo necesita sin importar `Postproceso`, porque importarle una
  constante lo traería entero y el aplazamiento no serviría de nada. Mismo
  caso que `roadFrameWidth` en `lib/route.ts`.
- **Va en su propio `Suspense`**, fuera del de la escena: compartiendo
  boundary, la espera de este módulo volvería a suspender el de arriba y la
  escena **ya montada** desaparecería un instante mientras llega la viñeta.
- Medido sobre producción, sumando lo que el navegador pide de verdad
  (`tests/perf/medidas/bytes.mjs`): móvil **1.854 → 1.778 KB**, o sea **76 KB
  menos**, que es exactamente el trozo de la viñeta. Escritorio se queda en
  2.000 KB.
- **El trozo del 3D baja de 1.148 a 868 KB**, pero no todo ese recorte es
  ahorro: Turbopack reparte lo demás en otro trozo que el escritorio sigue
  pidiendo. El número honesto es el de arriba, el de bytes pedidos.

#### Dos trampas al comprobarlo

- **El arnés visual no sirve para esto.** Dio 0,00 % en las quince tomas con
  la viñeta cargando y sin cargar, y es correcto: la viñeta oscurece las
  esquinas un **1,5 %** y el umbral del arnés es del 1 %. Que una comprobación
  pase no significa que el efecto esté.
- **Y hay que reiniciar `next start` después de `next build`.** Sin eso el
  servidor sigue sirviendo la compilación anterior, los trozos cambian de
  nombre y lo que se ve son errores 500 y «Refused to execute script because
  its MIME type is text/plain». Con el servidor viejo la medida decía que
  **ni escritorio ni móvil** pedían la viñeta, o sea que el cambio estaba
  roto; con el servidor bueno, escritorio sí y móvil no. Una medida contra un
  servidor caducado miente en la dirección más peligrosa: hacia «lo has
  roto».
- La comprobación que sí vale es **si el trozo se pide**, no si se ve:
  localizar el archivo con `grep -l VignetteEffect .next/static/chunks/*.js` y
  mirar si el navegador lo solicita en cada ancho.

### Lo que queda, por orden de lo que devolvería

1. **Partir `Scene.tsx`**, que son 1.665 líneas y entra entero en el paquete
   del 3D.
2. **GSAP**, que es la tarea más larga de la carga y hoy no se puede diferir
   sin tocar catorce archivos.

## Accesibilidad: los dos fallos reales, arreglados

Medido con Lighthouse, que es quien los encontró: **93 → 97**. Lo único que
queda marcado es el `color-contrast` de seis textos de la portada, y **son
falsos positivos demostrados**: el auditor no ve el `<canvas>` y los mide
contra el crema de la página cuando viven sobre el suelo azul noche del 3D.
Medidos con píxeles dan 16,7:1 y 5,04:1.

### El nombre del enlace del logo (WCAG 2.5.3)

- Llevaba `aria-label="Inicio"` y el enlace **enseña** «Transportes José María
  Ibáñez». Para quien navega por voz, decir lo que ve en pantalla **no
  activaba el enlace**. Salía en todas las páginas, porque el navbar va en
  todas.
- **No se arregla escribiendo la cadena a mano en el `aria-label`.** Se probó
  —«Transportes José María Ibáñez, Inicio»— y **seguía fallando**: el texto
  visible son dos `span` apilados y en versales, así que lo que lee el auditor
  no es la cadena que uno escribe. Acertar con el espaciado y el salto de
  línea exactos es un juego que se pierde al primer retoque de maquetación.
- Lo que no falla: **quitar el `aria-label`**. Entonces el nombre accesible
  **es** el texto del enlace, y el destino se añade en un `sr-only` dentro,
  que cuenta para el nombre pero no es texto visible. Correcto por
  construcción, no por coincidencia.

### Los puntos del carrusel de reseñas medían 8 px

- El mínimo táctil de la WCAG son **24 × 24**, y el botón entero medía 8 × 8:
  con un dedo eso es fallar el tiro la mayoría de las veces.
- **El punto que se ve y el que se toca son dos cosas distintas**, y antes
  eran la misma. El punto pasa a ser un `::after` y el botón se queda de
  contenedor transparente de 24 px. **No cambia ni un píxel de lo que se ve.**
- Los dos estados —el `:hover` y el `data-active` que lo estira a raya— van
  ahora en el pseudoelemento. Si tocas uno, mira el otro.

## Cookies y consentimiento (obligatorio)
- **Nada de terceros se carga antes del consentimiento.** Si añades un servicio externo (analítica, píxel, vídeo incrustado, fuentes de terceros), va detrás del gate, no suelto.
- El estado vive en `src/lib/consent.ts`: cookie propia `tjmi_consent` (12 meses) con la fecha y la versión. Se lee con `useConsent()` (usa `useSyncExternalStore`, no `useState` en efectos).
- Categorías actuales: `necesarias` (no configurable) y `maps`. Al añadir una categoría o un servicio nuevo hay que **subir `CONSENT_VERSION`**: eso invalida los consentimientos antiguos y vuelve a preguntar, que es lo que exige la AEPD.
- Para incrustar algo de terceros se usa el patrón de `src/components/legal/MapEmbed.tsx`: si no hay permiso, el iframe **no existe en el DOM** (ni oculto ni con `src` vacío) y en su lugar va una alternativa útil.
- El banner no lleva aspa de cerrar y "Aceptar" y "Rechazar" tienen el mismo peso visual. No tocar eso: es justo lo que se sanciona.
- Las páginas legales viven en `/cookies`, `/privacidad` y `/aviso-legal`, con los textos en `messages/*.json`. Los huecos marcados `[PENDIENTE: ...]` son datos societarios reales que faltan.
- Los créditos de los modelos 3D con licencia CC-BY van en el aviso legal.

## Regresión visual de la intro 3D (`npm run check:3d`)

- **Qué problema resuelve.** La intro está gobernada por constantes que dependen unas de otras —el alcance de la niebla por vista, el adelanto de la cámara cenital, el encuadre de la carretera, el reparto del scroll— y tocar una mueve otras. El fallo **no rompe nada**: compila, pasa el lint y el build, y simplemente se ve mal tres pantallazos más abajo. Esto recorre la portada parándose en 12 puntos fijos, captura, y compara contra referencias versionadas en `tests/visual/baseline/`.
- **Necesita el servidor levantado** (`npx next dev --webpack`). Si no hay nadie escuchando, lo dice y sale.
- Para aceptar un cambio como bueno: `npm run check:3d -- --update`. **Mira las capturas nuevas antes de hacer commit**: una referencia mala da por bueno un fallo para siempre.
- Las referencias **se versionan**; `tests/visual/salida/` (capturas del fallo y mapas de diferencias) va en `.gitignore`.

### Las cuatro decisiones que lo hacen fiable

- **Usa `playwright-core` y el Chrome ya instalado, no descarga ningún navegador.** `playwright` a secas se baja su propio Chromium al instalarlo, y en este equipo Control de aplicaciones de Windows ya bloquea binarios (es el motivo de que el proyecto vaya con `--webpack`). `pngjs` y `pixelmatch` son JavaScript puro. Aquí sí tocaba usar librería: leer cuatro bytes de cabecera a mano como en `check-media.mjs` es razonable, escribir un decodificador de PNG no lo es.
- **Espera a que la escena se pare, no un tiempo fijo.** Los disparadores van con `scrub: 1`, así que la escena llega tarde al scroll a propósito, y los muelles se asientan despacio. Captura en bucle hasta que dos fotogramas seguidos son casi iguales.
- **Hay tolerancia y no es pereza.** La carga respira y las ruedas giran: la escena nunca se queda del todo quieta. El umbral base es **1 %**, y sale de medir: las tomas que caen en mitad de un movimiento (la lona abriéndose, el primer plano) dan de forma reproducible un 0,3–0,6 % entre pasadas idénticas. Un arnés que salta solo se deja de mirar a la tercera.
- **Las tomas que se buscan por kilómetro llevan umbral propio, 2,5 %** (`FAIL_SOUGHT`), y también está medido. No caen en un píxel fijo: caen donde el buscador consigue parar, y el cuentakilómetros solo tiene resolución de kilómetro entero, así que dos pasadas pueden marcar los mismos 210 km separadas por unos píxeles de scroll, y eso desplaza **toda** la cinta de asfalto. En móvil, con el plano más cerrado, llegó a dar un 7 % sin que nada hubiera cambiado. Con el buscador afinado a ±1,5 km esas tomas van ahora a 0,00 %, pero el margen se deja por si vuelve.
- Sigue detectando de sobra: la prueba de sabotaje da entre **7,5 % y 23 %** en esas mismas tomas, o sea de 3 a 9 veces por encima del umbral más ancho.
- **`seekKm` sondea el tramo del disparador, no el de la sección.** No son el mismo: la escena empieza una pantalla antes de su sección y acaba una pantalla antes de su final. Con el tramo de la sección, el segundo sondeo caía **pasada la llegada**, donde el contador ya está clavado en 420: el ritmo salía mal y la búsqueda se iba al kilómetro 0.
- **La toma de llegada volvió a ir por fracción**, y conviene saber por qué cambió dos veces. Se pasó a kilómetros porque la escena no terminaba dentro de su sección y no había fracción que dijese «llegando». Ahora la escena acaba justo donde su bloque fijo se suelta, así que 0,85 **sí** es la llegada; y por kilómetros ya no se puede pedir, porque el contador se clava en 420 antes de que la cámara se pose sobre la nave y cualquier objetivo cercano cae en una meseta donde la búsqueda no tiene dónde agarrarse.
- **Las tomas de carretera se piden por kilómetro, no por fracción de la sección**, y esto costó dos intentos. La fracción parece la medida natural y no lo es: la carretera no empieza hasta el 42 % de la escena y **tampoco termina dentro de ella** (al 100 % del recorrido el camión va por el km 350 de 420), así que no existe fracción que signifique «llegando». Con fracciones, la toma «a media ruta» capturaba el **kilómetro 5**: parecía correcta y medía otra cosa, que es la forma más tonta de que una suite de regresión dé por bueno un fallo durante meses. `seekKm()` busca el punto por aproximaciones.

### Detalles que ya costaron una pasada

- **El informe imprime los kilómetros de cada toma**, y es lo que destapó el error de arriba en la primera ejecución. Si alguien mueve `ROAD_RUN` y las tomas dejan de caer donde dice su etiqueta, se ve en el número.
- **Las tomas que van por fracción de sección hay que reapuntarlas si se toca el arranque de esa sección**, y es el mismo error con otra cara. Una toma se sitúa en `offsetTop + (alto − pantalla) · at`, o sea por fracción de la **sección**; la coreografía va por fracción del **disparador**. Mientras las dos empiezan en el mismo sitio da igual, pero al mover el arranque de `InRoute` a `top top` dejaron de coincidir y las cuatro tomas de esa escena pasaron a capturar otro momento: salían un 25–46 % distintas **sin que la escena hubiera cambiado**. Recalculadas, bajan al 3–14 %, que es lo que de verdad había cambiado (el texto). La regla: cuando una toma se mueva, **mírala** y comprueba que sigue enseñando lo que dice su etiqueta.
- **El consentimiento de cookies se escribe antes de cargar**, no se tapa con CSS. El banner se comía un quinto de cada captura, y taparlo obligaba a acertar con un selector que se invalida en cuanto cambie el marcado.
- **La espera del Canvas lleva reintento con recarga.** Falló una vez y en el sitio menos evidente: el pase de escritorio terminó bien y el de móvil se quedó sin canvas, porque el servidor de desarrollo estaba compilando para un contexto nuevo.
- `deviceScaleFactor: 1` fijo: con la escala del sistema, la misma página da capturas de distinto tamaño en dos equipos y no habría referencia que valiera.

### Comprobado que funciona

Poniendo `ROAD_LEAD = 0` (deshacer el adelanto de la cámara cenital) el script señala **las 5 tomas de carretera**, entre 7,5 % y 23,3 % de diferencia, y deja las otras 7 en 0,00–0,03 %. Los kilómetros no se mueven, así que lo que mide es el cambio visual y no otro momento del viaje.

## Cuando algo se cae (red de seguridad)

- **No había ninguna.** Ni `error.tsx`, ni `global-error.tsx`, ni boundary alrededor del Canvas, ni forma de enterarse de un fallo en el navegador de un visitante. Y no era hipotético: en este proyecto un efecto de postprocesado ya dejó el Canvas en negro. Ese mismo fallo se llevaba por delante la página entera.
- **Las tres formas de quedarse sin 3D están cubiertas, y cada una por su mecanismo** (`lib/sin3d.ts`):
  - **No hay WebGL** (tarjeta en lista negra, navegador antiguo, WebGL desactivado). Se comprueba **antes de montar nada**, con `soportaWebGL()`.
  - **Se pierde el contexto** o **revienta algo construyendo la escena** (un GLB ilegible, un efecto incompatible). Eso sí pasa por el render, así que lo atrapa `Canvas3DBoundary`.
- **Un error boundary de React NO basta, y esto costó una pasada.** Se probó primero solo con el boundary y se comprobó simulando una tarjeta bloqueada: three lanza «Error creating WebGL context» **fuera de la fase de render**, así que el boundary no se entera. El error se escapaba a la consola, quedaba un `<canvas>` muerto, el hero seguía midiendo cuatro pantallas de nada y no se activaba ningún respaldo. Por eso la comprobación va antes y el boundary se queda solo para lo que sí pasa por el render.
- **Está medido.** Con WebGL bloqueado a propósito, la portada pasa de **17.408 px a 9.355 px**, el hero de 3.780 a 597, la carretera de 4.320 a 598, `InRoute` se pinta su azul noche, y **no se escapa ni un error**. Sin esto, lo que quedaba eran ocho pantallas de scroll vacío.
- **Dos trampas ya pisadas, por si vuelven:**
  - `dataset.sin3d` escribe `data-sin3d`, **sin el guion antes del número**, y el selector del CSS busca `data-sin-3d`. Se ponía el atributo, avisaba la consola, y la maquetación seguía igual. Por eso se escribe con `setAttribute` y el nombre vive en una constante.
  - El estado de WebGL tiene **tres valores, no dos**: en el servidor no se puede saber si hay WebGL, así que el valor de partida es `null` («todavía no se sabe»). Puesto a `false`, el primer render del navegador marcaba como «sin 3D» **todas** las visitas y nadie lo volvía a quitar.
- **`error.tsx` y `global-error.tsx` son dos cosas distintas.** El primero atiende lo que falla dentro de una página y mantiene navbar, pie e idioma, con tres salidas: reintentar (`reset()`, que recompone sin recargar ni perder el scroll), inicio y contacto. El segundo sustituye al documento entero cuando se cae el propio `layout`: trae su `<html>` y su `<body>`, no tiene traducciones ni garantía de estilos, y por eso va con colores a mano y en los dos idiomas. No es una página de la web: es la nota que queda cuando la web no está, y su único trabajo es dejar un teléfono a la vista.
- **El error no se enseña, se registra.** El mensaje técnico no le dice nada a quien está delante y a veces filtra rutas internas. Va a la consola con su `digest`. **`marcarSin3D()` y `error.tsx` son los dos únicos puntos por los que pasa un fallo de esta web**: ahí es donde engancharía un servicio de avisos el día que se añada.

## Rendimiento del 3D (medido, no estimado)

Todo lo de esta sección sale de contar llamadas de dibujo interceptando el
contexto WebGL y de medir fotogramas con la CPU frenada. Los números son
reproducibles; los fotogramas en el perfil más lento no, porque la máquina de
desarrollo influye —ahí la medida buena son las llamadas de dibujo—.

### El punto de partida

| escena | llamadas/fotograma | triángulos |
| --- | --- | --- |
| **Patio (la apertura)** | **1.323** | 681.000 |
| Carga | 1.284 | 803.000 |
| En ruta | 582 | 378.000 |
| Carretera | 450 | 500.000 |

El presupuesto razonable para una escena móvil fluida son **unas 150
llamadas**. La apertura iba a nueve veces eso, y es lo primero que ve todo el
mundo: 26 fps en un teléfono de gama baja.

### Lo que se hizo, por orden de lo que más devolvió

- **Los palés iban sueltos y eran el pozo más grande.** Cada palé se montaba
  con **cuatro mallas**, cada una con su geometría y su material: madera,
  carga, fleje y un marcador invisible. Entre el lote de la grúa (12), lo que
  lleva el camión (10) y las pilas del patio (14) son **36 palés**, o sea 144
  mallas y, con la pasada de sombras, unas **216 llamadas**. Instanciados son
  **tres por grupo**. Ver `Pallets.tsx`.
- **El vallado, igual**: más de cincuenta cajas idénticas, una llamada cada
  una. Instanciado, una.
- **El camión marcaba sus 117 mallas como proyectoras de sombra.** Cada
  proyector se dibuja dos veces, en pantalla y en el mapa de sombras, y la
  mitad de esas mallas son tornillos y manillas cuya sombra, a 60 m y sobre un
  mapa de 2048, no llega ni a un píxel. Ahora el corte va por el lado mayor de
  la pieza: **0,45 m**. La silueta de la sombra no cambia —comprobado con el
  arnés: esa toma se mueve un 0,33 %—.
- **Los contenedores proyectaban con sus cinco piezas.** Los herrajes van
  pegados a la chapa, así que se pagaba cuatro veces el mismo contorno. Solo
  proyecta la chapa.

| escena | antes | después |
| --- | --- | --- |
| **Patio** | 1.323 | **606** |
| Carga | 1.284 | 636 |
| En ruta | 582 | 339 |
| Carretera | 450 | 273 |

### `frustumCulled={false}` en lo instanciado es obligatorio

Un `InstancedMesh` calcula su esfera envolvente a partir de **la geometría
base**, que está en el origen del grupo, no de dónde acaban las instancias.
Las pilas de palés están a `x ≈ -31` y la valla va de −62 a 78: con el recorte
activado, en cuanto la cámara deja de ver el origen, three da por fuera de
plano el grupo entero y **desaparece de golpe**.

No es teoría: pasó al instanciar. Lo cazó el arnés visual —los palés del
primer término estaban en la referencia y ya no en la captura— y por eso está
escrito. Si añades otro `<Instances>` cuyas piezas queden lejos de su origen,
dale lo mismo.

### El lienzo deja de dibujar cuando la intro ya no se ve

El Canvas está fijo a pantalla completa detrás de toda la portada y no se
desmonta nunca, así que **seguía dibujando a toda velocidad bajo Servicios,
Cobertura y el pie**:

| dónde estás | llamadas por segundo |
| --- | --- |
| En la intro | 184.000 |
| En Servicios | 64.650 |
| En Cobertura | 64.650 |
| En el pie | 64.650 |

Dos tercios de la página gastando batería para pintar algo tapado. Ahora
`useIntroVisible` observa las secciones con `[data-scene]` —las únicas que
dejan ver el lienzo— y el Canvas pasa a `frameloop="never"` cuando ninguna
está en pantalla. Medido después: **0 llamadas** en Cobertura y en el pie.

Al volver no hay salto porque el `delta` del fotograma ya estaba acotado a
0,05 s desde antes, por el caso de volver de una pestaña en segundo plano.

### Cuidado al medir

- **Los fotogramas con la CPU frenada son ruidosos** en esta máquina: tres
  pasadas seguidas al mismo código dieron 26, 38 y 37 fps. Lo que sí es
  estable y comparable son **las llamadas de dibujo**.
- **Prettier no está configurado en este proyecto** y por defecto pasa las
  comillas a dobles. Si lo lanzas sobre un archivo, revisa el diff: ya metió
  ruido una vez. Y si reformatea un JSX largo en varias líneas, los reemplazos
  de texto que esperaban la versión de una línea dejan de encajar en silencio.

## Sombras de contacto (`ContactShadow.tsx`)

- **Qué resuelve.** La luz principal va rasante (29°), así que tira la sombra de cada objeto lejos y a un lado: **justo bajo el apoyo no queda nada**. Eso es lo que hacía que la pila, los palés y el camión se leyeran como pegados encima del suelo en vez de apoyados. El mapa de sombras tampoco puede ayudar: cubre el patio entero con 2048 px, y el contacto son centímetros.
- **No es un truco de dibujo animado.** No es un óvalo negro: es oclusión ambiental puesta a mano donde se sabe que la hay. **Si se nota como forma propia, está mal puesta.** Medido en la vista en tres cuartos: 4.330 píxeles de suelo oscurecidos, **11 niveles de media y 33 el máximo**. Eso es lo que se buscaba.
- **`alphaMap` de three lee el canal VERDE, no el alfa de la imagen, y eso costó una pasada entera.** La textura se pintó primero en negro con alfa variable, que es lo intuitivo: el verde salía 0 en todo el lienzo, la máscara valía cero y la sombra era **completamente invisible**. Se cazó midiendo —solo 7 píxeles del suelo cambiaban más de seis niveles en toda la escena—, no mirando. Pintada en luminancia (blanco opaco, negro transparente) funciona. **Es el mismo patrón que la viñeta: un efecto montado que no se estaba ejecutando.**
- **Dónde paga y dónde no, que es geometría pura:**
  - **Vista en tres cuartos**: paga. Es donde se ve el suelo.
  - **Vista de perfil**: **no paga y no hay forma de que pague.** La cámara está casi a ras de suelo, así que un plano tumbado no tiene área en pantalla. Ahí lo que asienta el camión es la sombra proyectada que ya había.
  - **Cenital de la carretera**: paga, y es donde más se nota el camión sobre el asfalto.
- **Las coordenadas del patio no se escriben a mano**: `YARD_CONTACTS` en `Scene.tsx` sale de las mismas constantes que colocan contenedores y palés (`PILE_STACKS`, `FOREGROUND_STACKS`, `PALLET_STACKS`). Duplicarlas sería garantizar que algún día una pila esté en un sitio y su sombra en otro. Por eso `PALLET_STACKS` se exporta.
- **Las del camión y la grúa cuelgan de su propio grupo**, así que los siguen solas por el patio y por la carretera. Las del camión son **dos y no una**: un articulado toca el suelo en dos sitios y entre ellos hay siete metros de chasis al aire; una sola mancha de punta a punta sería la silueta de una barcaza. Sus posiciones **están medidas sobre una captura** (a 1280 px el conjunto ocupa de 478 a 1200, o sea 41,7 px/m), igual que `CENTRE_NUDGE`.
- **Va instanciada y con `frustumCulled={false}`**, como todo lo instanciado de esta escena.
- **Lleva el `polygonOffset` más adelantado del suelo (−5).** Ya hay dos capas antes: el pavimento a −1 y la pintura del carril a −3. Si añades otra capa al suelo, dale la suya y más adelantada todavía.

## El cristal de las cabinas

- **El GLB del camión traía los cristales como chapa**: material opaco, rugosidad media y nada que reflejar. Desde fuera la tractora parecía una maqueta de madera pintada, porque lo único que distingue un cristal de una chapa blanca a diez metros **es el reflejo**, no la transparencia.
- La escena ya monta un `Environment` con `Lightformer`, así que había algo que reflejar sin pedirle nada a nadie: faltaba decirle al material que lo mirara. Rugosidad 0,08, metalicidad 0,55 y **`envMapIntensity` a 2,4** —sin subir eso, el entorno apenas se nota sobre un material casi dieléctrico—.
- **El del camión va opaco y el de la grúa translúcido**, y la diferencia es deliberada: dentro de la cabina del camión no hay nada modelado, así que un parabrisas translúcido enseñaría el respaldo del asiento flotando en el vacío. Dentro de la grúa **sí hay un operario**, que es el único sitio de la intro donde se ve a alguien trabajando.
- **Es un cambio pequeño y conviene saberlo**: al tamaño al que sale el camión, la diferencia es una ventanilla que pasa de casi negra a un gris azulado con filo. Correcto, pero no espectacular. El arnés lo mide en un 0,12 % de la toma.

## El desenfoque de maqueta: probado y descartado, con el motivo

- **No es que `DepthOfField` no se monte: es que no sirve con esta cámara**, y conviene separar las dos cosas. La nota anterior decía que el desenfoque «no se puede montar con estas versiones», y eso era verdad de **`TiltShift2`**, que reventaba el render y dejaba el Canvas en negro. `DepthOfField` **arranca sin un solo error** con three 0.186 y postprocessing 6.39.5.
- Lo que pasa es otra cosa: **esta cámara es ortográfica y su `near` es −400**, con `far` a 600. El efecto calcula el círculo de confusión desde la profundidad normalizada y con ese rango la cuenta no da: sale un desenfoque **constante en toda la imagen**, sujeto incluido.
- **Probado y medido, cuatro veces**: `focusDistance` a 0,015 y a 0,4; enfoque por `target` (el punto del mundo al que apunta la cámara, escrito desde `Scene.tsx`); y el rango enfocado de 0,015 a 0,25. Las cuatro capturas salen igual de borrosas.
- Lo que lo sustituye sigue siendo lo que ya había: la niebla que se cierra en el primer plano (`FOG_CLOSE`) y las dos torres de primerísimo término que solapan (`FOREGROUND_STACKS`). Si no se puede desenfocar el primer término, se solapa.
- **Si alguien lo reintenta**, el camino no es tocar los parámetros —eso está agotado—: es mirar el `near` negativo de la cámara. Y hay que medir el coste, porque sería una **segunda** pasada a pantalla completa sobre una que ya cuesta la mitad de los fotogramas en un teléfono.

### Lo que queda de la fase 2

- ~~Rodadas en el asfalto.~~ **Hechas**, junto con el arcén y las líneas de borde. Ver «Lo que hace que el asfalto parezca una carretera».

**Descartado a propósito:** polvo y suciedad del suelo. Son los dos recursos que más rápido se van a dibujo animado, y el encargo era lo contrario.

## Rendimiento y accesibilidad (obligatorio)
- Modelos GLB optimizados: Draco o Meshopt, texturas ≤ 1024 px (KTX2/WebP), objetivo < 2 MB total de 3D.
- `dpr={[1, 1.5]}`, sombras baratas (`ContactShadows` o sombras horneadas), postprocesado mínimo.
- **Hay una sola definición de «esta página va sin 3D», y es la variante `sin3d:`** (`@custom-variant` en `globals.css`). Responde a **tres** disparadores y los tres piden lo mismo de la maquetación: movimiento reducido, que el navegador no abra WebGL, y que la escena se caiga montándose. Lo que hace: Hero y RoadIntro sueltan el `sticky` y dejan de medir pantallas que ya no enseñan nada, e InRoute se pinta su propio fondo azul noche porque ya no tiene detrás el suelo 3D que se lo daba. **Si añades una sección que dependa del 3D para su fondo o su altura, dale su `sin3d:`** — y no solo `motion-reduce:`, que cubre un caso de tres.
- `motion-reduce:` sigue usándose donde el asunto es el **movimiento** y no el 3D: el desfile de servicios.
- Los componentes animados (`ScrollFade`, `RevealHeading`, `RouteOdometer`, `RouteProgress`, `CountUp`) ya salen por `prefersReducedMotion()` dejando su estado final en el HTML. Mantén ese patrón: nunca escondas algo en el marcado y lo enseñes solo por animación.
- Móvil: misma historia, escena simplificada (menos objetos, sin postprocesado). Probar en móvil real antes de cerrar cada fase.
- Preloader con progreso real (`useProgress` de drei) y máximo ~2 s percibidos.
- Lighthouse objetivo: Performance ≥ 80 en móvil, Accesibilidad ≥ 95.
- Todo el texto importante existe en HTML (SEO), nunca solo dentro del Canvas.

## SEO

Esto se auditó midiendo el HTML que de verdad se sirve en las 32 páginas (16 rutas × 2 idiomas), no leyendo el código. Lo que estaba bien se dejó como estaba; lo que sigue son los fallos que salieron y cómo quedaron.

### Lo que ya estaba bien y no se toca

- `src/app/sitemap.ts` genera `/sitemap.xml` y `src/app/robots.ts` el `/robots.txt`. Van fuera de `[locale]` a propósito: el proxy de idiomas no las toca porque su filtro deja fuera todo lo que lleva punto en el nombre. Son 52 URL: 16 rutas fijas y 10 artículos, por dos idiomas.
- **Si añades una página, son tres sitios**: `SITE_PATHS` en `src/lib/seo.ts` (o no entra en el sitemap), la lista `RUTAS` de `scripts/audit-seo.mjs` (o el arnés no la mira — ya pasó con `/cobertura`: auditaba 30 páginas con 32 publicadas) y el pie, que es el enlazado interno. Dos excepciones, que se sacan solas: los artículos del blog salen de `content/blog.ts` y las seis páginas de servicio de `content/services.ts`.
- **Canonical y hreflang** (`pageAlternates`) correctos en las 32 páginas, con `x-default` al español.
- **Un solo `h1` por página** en las 32, y **ninguna imagen sin `alt`**.
- Las direcciones inventadas devuelven **404 de verdad**, no un 200 vacío. Comprobado en `/es/loquesea`, `/es/servicios/no-existe` y `/es/blog/no-existe`. La raíz redirige a `/es` y `/es/` redirige a `/es`.
- Los datos societarios estructurados viven en `src/lib/business.ts`, **no en `messages`**: una dirección o un teléfono no se traducen. Si cambia una dirección, un teléfono o un horario, hay que tocarlo en los dos sitios (ahí y en `messages`, que es lo que se ve en pantalla).

### El grafo de entidades llevaba roto desde que se escribió

- **Las seis fichas de servicio decían que su proveedor era `#empresa`, y la empresa se declara como `#organizacion`.** O sea que apuntaban a un nodo que no existe en ninguna parte: para Google, seis servicios sin empresa detrás. Y esto estaba **documentado aquí mismo como que funcionaba**. Una referencia por `@id` a la nada no es medio correcta, es nada.
  - La causa es trivial y por eso vuelve: el identificador estaba **escrito a mano en dos archivos**. Ahora vive solo en `ORGANIZATION_ID` (`lib/seo.ts`) y se usa por `organizationRef()`.
  - **`organizationRef()` devuelve el nodo, no una referencia suelta**, y eso importa: el nodo de la empresa solo se declara en la portada y en contacto, así que en una ficha de servicio un `{ '@id': ... }` a secas no resuelve contra nada. Declarando el mismo `@id` con su nombre, Google funde las dos en la misma entidad.
- **Los artículos declaraban dos `Organization` sueltas sin identificador** como `author` y `publisher`. Diez artículos sumando autoridad a una entidad nueva por página, en vez de a la empresa. Ahora van por `organizationRef()`.
- **No existía el nodo del sitio web.** Ahora `WebSite` (`WEBSITE_ID`) cuelga de la empresa, y los servicios y los artículos se declaran `isPartOf` suyos.
- La empresa lleva además **`contactPoint`** (teléfono, correo, idiomas y país: `telephone` dice cuál es el número, esto dice para qué sirve) y **`hasOfferCatalog`** con los seis servicios. Cada ficha ya decía quién la presta; esto lo dice por el otro lado y convierte seis páginas sueltas en el catálogo de un negocio.
- **Los artículos eran las únicas páginas sin miga de pan**, y son las más hondas de la web. El marcado vivía dentro de `PageHeader`, que es la cabecera que ellos no usan. Ahora lo genera `breadcrumbJsonLd()` en `lib/seo.ts` y lo usan los dos.
- **No hay coordenadas a propósito.** No las tenemos medidas y es peor ponerlas mal que no ponerlas. Si se sacan de Google Maps, se añaden como `geo` en `business.ts`.
- Falta `priceRange`, que Google recomienda para negocios locales, y **`sameAs`** (ficha de Google, LinkedIn). Los dos están sin poner por el mismo motivo que los huecos `[PENDIENTE: ...]` de las legales: no inventárselos.

### Compartir un enlace: 30 de 32 páginas enseñaban la portada

- **Este era el fallo con más efecto práctico y no se ve desde el código.** Cada página declaraba `title`, `description` y `alternates`, y **ninguna declaraba `openGraph`**. Los metadatos de Next **no se funden campo a campo** entre capas: si una página no define `openGraph`, hereda el del layout **entero**, y el del layout es el de la portada. Medido sobre el HTML servido: **30 de las 32 páginas enseñaban el título y la descripción de la portada al compartirlas**. Mandar por WhatsApp la página de grupaje y mandar la portada se veía exactamente igual.
- **Y no había ni una imagen social en toda la web**, así que cada enlace salía como un renglón gris. Para una empresa cuyo cliente pide y pasa presupuestos por WhatsApp, eso es tirar el canal.
- Otros tres de la misma cabecera: **`og:locale` decía `es`**, que es inválido —Open Graph pide `idioma_TERRITORIO`, o sea `es_ES`—; faltaban **`og:url`** y **`og:type`**; y la tarjeta de Twitter iba en `summary`, el recuadro pequeño.
- **Se arregla en un sitio, no pidiéndole a cada página que se acuerde.** `pageMetadata()` en `lib/seo.ts` compone título, descripción, canonical, hreflang, Open Graph y tarjeta a la vez, y las doce páginas lo usan. Así es imposible que una vuelva a quedarse sin la mitad.
- La imagen por defecto es `camion-01.jpg` (1500 × 843), que es el camión de verdad. **Las fichas de servicio no llevan la suya**, y es decisión: tres de las seis fotos son verticales y de menos de 500 px —lo canta `npm run check:fotos`—, y como tarjeta social saldrían recortadas y borrosas, peor que el camión. Cuando lleguen las apaisadas que pide el `brief` de `content/media.ts`, ahí.

### La marca va en el título mientras quepa

- El layout añade « | Transportes José María Ibáñez» a todo, y **son 32 caracteres de los ~60 que Google enseña**. Medido: **diez de los dieciséis títulos en español se pasaban de 60**, y en las fichas de servicio el corte caía dentro del nombre de la empresa, que es la peor forma posible de gastarlo.
- La regla es **automática y se mide, no se decide página a página**: si el título con la marca pasa de 60, `pageMetadata` deja el título solo (`title.absolute`). «Grupaje de palés Castellón ⇄ Madrid» dice mucho más que media marca cortada, y la marca sigue a la vista en el dominio y en la miga de pan del propio resultado.
- Después del cambio **ningún título pasa de 60** en ninguno de los dos idiomas.

### Las descripciones no son la entradilla de la página

- Casi todas reutilizaban `intro`, que está escrita para leerla en la página. Resultado: la de `/nosotros` tenía **69 caracteres** y la de la portada **177** —cortada—.
- Las páginas que lo necesitaban llevan ahora **`seoDescription` propia** en `messages`, que es el mismo patrón que ya usaban los servicios. Donde la entradilla ya servía, se deja: no hay que duplicar texto por duplicarlo.
- Objetivo 110–160. Hoy lo cumplen todas menos las legales en inglés, que se dejan cortas a propósito: nadie busca una política de cookies y alargarla sería rellenar.

### Titulares que dicen algo

- `/servicios`, `/nosotros`, `/blog` y `/contacto` tenían como `h1` «Servicios», «Nosotros», «Blog» y «Contacto». El `h1` es la señal de contenido más fuerte después del título y estaba gastado en señalizar. Es exactamente el criterio que ya se aplicó al titular del índice de la portada.
- Ahora dicen «Servicios de transporte y logística en Castellón», «Cuarenta años en la misma ruta», «Blog de transporte de palés» y «Pide presupuesto».
- **La navegación no cambia.** Cada página pasa además `crumb` con la etiqueta corta, así que la miga de pan y el menú siguen diciendo «Servicios», «Nosotros», «Blog» y «Contacto». Si añades una página con titular largo, pásale su `crumb`.
- Al cambiar el titular de `/nosotros` hubo que cambiar su entradilla: decía casi lo mismo, y un titular y una entradilla que se repiten a 50 px se leen como una errata, no como jerarquía. Es el caso de «Dónde estamos / Dónde estamos» otra vez.

### Cómo volver a medirlo

- La auditoría no está automatizada en `package.json` a propósito: se corre contra un servidor levantado y es de las cosas que se miran al cambiar algo de cabecera, no en cada guardado. Lo que hay que mirar, por orden: que ninguna página pase de 60 de título, que ninguna baje de 110 de descripción, que todas tengan **su propio** `og:title` —no el de la portada—, y que el `@id` del proveedor de los servicios coincida con el de la empresa.
- La forma rápida de cazar el fallo del `og:title`: comparar el `og:title` de cada página con su `<title>`. Si treinta coinciden entre sí y no con su página, es la herencia del layout otra vez.

### Lo que queda, por orden de lo que más devolvería

1. **Dar de alta la ficha de Google Business** y enlazarla desde `sameAs`. Para un negocio local es lo que más mueve, y no es código.
2. **Coordenadas (`geo`) y `priceRange`** en `business.ts`, cuando se puedan dar sin inventarlos.
3. **Fotos apaisadas a 1200 × 630** para las tarjetas sociales de las seis fichas de servicio.
4. **Las portadas de los artículos**, que además son las que se ven al compartirlos.
5. **Rendimiento de la portada**, que es factor de posicionamiento: la intro 3D es lo más caro de la web y está medida en «Rendimiento del 3D».

## El icono y el manifiesto

- **El único icono que había era el logo tal cual, 420 × 286.** Un favicon no es rectangular: el navegador lo mete en una caja cuadrada de 16 px, así que el escudo salía aplastado a 16 × 11 con dos franjas vacías a los lados. Y no había `apple-icon`, de modo que guardar la web en la pantalla de inicio de un iPhone daba **una captura de la página** en vez del logo.
- Tampoco había manifiesto, así que «añadir a la pantalla de inicio» —que en un móvil es lo que hace un cliente que va a volver— guardaba un acceso con el título de la pestaña recortado. Para un negocio al que se le escribe por WhatsApp desde el teléfono, ese acceso directo es un contacto guardado.
- Ahora son cuatro tamaños generados **del mismo logo**: 512 y 192 para el manifiesto, 180 para Apple y 48 para el favicon, que es el que de verdad se ve pequeño.

### Generados, no dibujados a mano

- Los hace `node scripts/gen-iconos.mjs` a partir de `public/logo.png`. **Si cambia el logo, se vuelve a lanzar**: son archivos derivados, no originales.
- **Con el navegador y no con una librería de imagen.** Este proyecto evita dependencias nativas a propósito —`check-media.mjs` lee las cabeceras de los JPEG a mano justo por eso, y `sharp` no está instalado como dependencia propia—, y aquí ya hay un Chrome y `playwright-core` para el arnés visual. Componer la imagen en una página y capturarla no añade **nada** al proyecto y sale igual en cada pasada.
- **Fondo crema, no transparente.** Un icono de Apple no admite transparencia —iOS la rellena de negro— y en un favicon sobre pestaña oscura el azul del escudo se pierde. El crema es el papel de esta web, así que el icono se lee como parte de ella.
- **El logo ocupa el 76 % del ancho.** A sangre, iOS le recorta las esquinas redondeadas y se come las puntas del escudo.

### El manifiesto (`src/app/manifest.ts`)

- **`start_url` es `/`, no `/es`.** La raíz redirige al idioma que toque, así que el acceso directo respeta el idioma de quien lo guarda. Con `/es`, los clientes europeos abrirían siempre en español.
- **Va en español y no traducido**, porque Next genera **un** manifiesto para todo el sitio, no uno por idioma. El nombre de la empresa no se traduce y la descripción corta va en el idioma del mercado principal.
- `theme_color` en el azul de marca y `background_color` en el crema: el primero tiñe la barra del sistema y el segundo es lo que se ve mientras arranca, así que el arranque no da un flash blanco.
- El `theme-color` se declara **además** en el `viewport` del layout, porque el manifiesto solo cuenta si la web está instalada y esa etiqueta vale en cualquier visita.
- Y ahí va también **`colorScheme: 'light'`**, que no es un detalle: esta web es clara y no tiene modo oscuro. Sin declararlo, un navegador en modo oscuro repinta por su cuenta los controles de formulario —los del presupuesto— y los campos salen con fondo gris oscuro sobre una tarjeta blanca.
- El proxy de idiomas no toca esta ruta porque su filtro deja fuera todo lo que lleva un punto en el nombre, igual que `sitemap.xml` y `robots.txt`.

## Preguntas frecuentes

- Vive en `src/app/[locale]/faq/page.tsx` y los textos en `messages`, bajo `faq`. Las preguntas y las respuestas son literalmente las que dio el cliente: se pasaron a caja baja (venían en mayúsculas), se corrigieron un par de erratas y se ajustó el tuteo. El contenido no se toca sin preguntar.
- Lleva marcado **`FAQPage`** para buscadores, y eso no es adorno de SEO: una página de preguntas con ese marcado puede salir en Google con las preguntas desplegables debajo del resultado y ocupar el triple de alto en la lista. Es de lo poco que da un resultado visible y rápido. Los datos salen de los mismos textos que se pintan, así que no pueden desincronizarse.
- **Las preguntas no llevan número, y antes sí.** Numerar afirma que hay una secuencia, y estas ocho se leen en cualquier orden: el `01` decoraba y mentía. Es la misma regla que vació las cabeceras de sección. (Los pasos de la ruta sí lo llevan, porque recoger va antes de entregar.)
- Y quitarlo arregló **lo que de verdad se veía mal**: el número empujaba la pregunta 27 px hacia abajo con un `mt-3`, así que la pregunta y su respuesta **no arrancaban a la misma altura**. En las respuestas de una línea eso dejaba un escalón que parecía un hueco sin rellenar.
- Las respuestas van **abiertas, no en acordeón**. Un acordeón tiene sentido con treinta preguntas; con ocho, lo único que consigue es obligar a ocho clics para leer una página que cabe entera. Y lo que está plegado no lo lee casi nadie.
- Si se añaden preguntas, van en `messages` y aparecen solas: la página las recorre y el marcado se genera de ahí.

## Páginas de error
- El 404 propio vive en `src/app/[locale]/not-found.tsx` y **necesita la ruta comodín** `src/app/[locale]/[...rest]/page.tsx`, que solo llama a `notFound()`. Sin ella, cualquier URL inventada cae en la pantalla de error por defecto de Next, sin navbar, sin pie y sin idioma. No borres esa carpeta.

## Los prototipos de dirección (`prototipos/`)

- Son tres maquetas sueltas de portada que se hicieron para enseñar caminos posibles. **No son parte de la web**: no las enlaza nada, no entran en el sitemap y no pasan por Next.
- **Estuvieron en `public/`, y eso es un problema de verdad, no de orden.** `public/` se publica entero, así que cualquiera podía abrir `transportesjosemariaibanez.es/direcciones/b-torre.html` y encontrarse una maqueta a medio hacer con el logo de la empresa: una web paralela sin navegación, sin aviso legal, sin consentimiento de cookies y sin `noindex`. Y Google indexa lo que alcanza, enlazado o no, en cuanto alguien comparte la dirección. Comprobado antes y después: daban 200 y ahora dan 404.
- Siguen en el repositorio, que es donde se querían —para poder volver a mirarlas—, pero fuera de lo que viaja al servidor. Se abren a doble clic; su `LEEME.md` explica cada una.
- **La decisión que salió de enseñarlas fue no rehacer la portada, sino mejorar la que hay.** Si alguien las retoma, que sea sabiendo eso.

## Estructura
```
src/
  app/[locale]/(layout, page, servicios, nosotros, contacto, blog)
  components/3d/        Experience.tsx, Scene.tsx, Postproceso.tsx, models/
  components/sections/  Hero, Overview, InRoute, Services, Route, Cta
  content/              blog.ts, media.ts, services.ts
  components/ui/        botones, tarjetas, inputs
  components/layout/    Navbar, Footer, WhatsAppButton, SmoothScroll
  lib/                  gsap.ts, store.ts (zustand), utils.ts
  messages/             es.json, en.json
public/models/          *.glb
```

## Servidor de desarrollo: Turbopack ya funciona

- **Durante mucho tiempo este proyecto fue con `--webpack`**, porque Control de Aplicaciones de Windows bloqueaba el binario nativo de Next (`@next/swc-win32-x64-msvc`), Next caía a WASM y entonces Turbopack no arrancaba: `npm run dev` moría con código 1.
- **Con Next 16.4.5 arranca.** Comprobado: `next dev` levanta en **300 ms** y `next build` compila en **514 ms**, contra los ~800 ms y los 8,6 s de webpack. Y lo que de verdad importaba: el arnés visual da **0,00 % en las quince tomas** compilado con Turbopack, así que la escena sale idéntica.
- Se han quitado todas las banderas: la entrada `transportes-jmi-webpack` de `.claude/launch.json` y los mensajes de `check-3d.mjs` y `audit-seo.mjs` que mandaban levantar el servidor con ella. **Los comandos son `npm run dev` y `npm run build`, sin más.**
- Si algún día vuelve a fallar, el síntoma es el mismo de siempre —muere con código 1 nada más arrancar— y el apaño sigue siendo `--webpack`. Pero no se vuelve a eso sin comprobar antes que es eso.

## Forma de trabajar (para el agente)
- Trabaja por fases (ver abajo). Antes de programar una fase, propone un plan breve y espera confirmación.
- Cambios pequeños y verificables. Al terminar: qué has hecho, qué archivos, cómo probarlo (`npm run dev` + qué mirar).
- No refactorices ni cambies dependencias fuera del alcance de la tarea.
- Si falta un modelo 3D, usa placeholders (cajas/cilindros con las proporciones reales) y déjalo marcado con `// TODO: modelo`.
- `npm run build` y `npm run lint` deben pasar antes de dar una fase por cerrada.

## Fases
- [ ] F0 Setup: proyecto, dependencias, Git, Vercel conectado.
- [ ] F1 Esqueleto: layout, i18n ES/EN, navbar, footer, secciones HTML con textos reales, sin 3D.
- [ ] F2 Coreografía con placeholders: Canvas fijo, store, timeline maestra, las 6 escenas con cajas.
- [ ] F3 Modelos reales: GLB optimizados, gltfjsx, materiales, luces, sombras.
- [ ] F4 Tipografía animada y servicios horizontales (ScrambleText, pin, Motion en UI).
- [ ] F5 Escena ruta cenital Castellón → Madrid con hitos.
- [ ] F6 Conversión: formulario de presupuesto, email, WhatsApp flotante, blog (MDX), SEO.
- [ ] F7 Pulido: móvil, reduced-motion, rendimiento, Lighthouse, deploy a producción.
