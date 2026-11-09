# Prototipos de dirección visual

Tres maquetas sueltas que se hicieron para enseñar caminos posibles de
portada. **No son parte de la web**: no las enlaza nada, no entran en el
sitemap y no pasan por Next.

## Por qué no están en `public/`

Porque `public/` **se publica entero**. Mientras estuvieron ahí, cualquiera
podía abrir `transportesjosemariaibanez.es/direcciones/b-torre.html` y
encontrarse una maqueta a medio hacer con el logo de la empresa: una web
paralela sin navegación, sin aviso legal, sin consentimiento de cookies y sin
`noindex`. Y Google indexa lo que puede alcanzar, enlazado o no, en cuanto
alguien comparte la dirección.

Aquí fuera siguen en el repositorio —que es donde se querían, para poder
volver a mirarlas— y no viajan al servidor.

## Cómo verlas

No hace falta servidor: son HTML de un archivo. Se abren a doble clic, o
desde la terminal:

```bash
start prototipos/index.html
```

Si alguna necesita servirse por `http://` —hay un par de cosas que los
navegadores no dejan hacer desde `file://`—, vale cualquier servidor estático
apuntando a esta carpeta, nunca copiándolas de vuelta a `public/`.

## Qué es cada una

- `index.html` — el índice, con el enlace a las otras dos.
- `a-papel.html` — la dirección «papel»: el recorrido dibujado con animaciones
  de scroll nativas de CSS (`animation-timeline`), sin una línea de
  JavaScript.
- `b-torre.html` — la dirección «torre»: tarjetas que se apilan con `sticky` y
  un recorrido con `offset-path`.

Las dos se quedaron como estudio. La decisión que salió de enseñarlas fue no
rehacer la portada, sino mejorar la que hay.
