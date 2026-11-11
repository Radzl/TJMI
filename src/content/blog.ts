import type { Locale } from '@/i18n/routing';

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'ul'; items: string[] };

export type PostContent = {
  title: string;
  excerpt: string;
  body: Block[];
};

export type Post = {
  slug: string;
  /** Fecha de publicación en ISO, para el orden y para el marcado de SEO. */
  date: string;
  minutes: number;
  /**
   * Foto de portada: sale en el listado, en el artículo y al compartirlo.
   *
   * **Las diez son de banco** (Pexels, licencia de uso comercial sin
   * atribución obligatoria; el crédito va igualmente en el aviso legal). Son
   * provisionales: el día que el cliente mande las suyas, esto es cambiar una
   * ruta por artículo.
   *
   * **Sigue siendo opcional y no hay que volverlo obligatorio.** Todo lo que
   * la usa —el listado, Open Graph y el marcado `Article`— sabe apañarse sin
   * ella, y eso es lo que permite publicar un artículo nuevo sin tener la foto
   * el mismo día. Si se quita una, el hueco lo pinta `CoverPlaceholder`.
   */
  cover?: string;
  content: Record<Locale, PostContent>;
};

export const posts: Post[] = [
  {
    slug: 'grupaje-o-camion-completo',
    date: '2026-05-14',
    minutes: 4,
    cover: '/media/blog/grupaje-o-camion-completo.jpg',
    content: {
      es: {
        title: 'Grupaje o camión completo: cómo elegir según tu carga',
        excerpt:
          'Pagar solo por el espacio que ocupas o llevarte el camión entero. La diferencia no está solo en el precio: está en los plazos, en las manipulaciones y en el riesgo de rotura.',
        body: [
          {
            type: 'p',
            text: 'Es la primera pregunta que nos hace casi todo el mundo, y la respuesta rara vez es la misma dos veces. Depende de cuántos palés muevas, de lo frágil que sea la mercancía y de lo apretado que vayas de plazo.',
          },
          { type: 'h', text: 'Qué es cada cosa' },
          {
            type: 'p',
            text: 'En grupaje tu mercancía comparte camión con la de otros clientes. Pagas por los metros de suelo que ocupas y el coste del viaje se reparte entre todos. En camión completo el vehículo va solo para ti, de origen a destino, sin paradas intermedias.',
          },
          { type: 'h', text: 'Cuándo te sale a cuenta el grupaje' },
          {
            type: 'ul',
            items: [
              'Mueves entre uno y diez o doce palés.',
              'Tu volumen es irregular: una semana mandas tres palés y a la siguiente ninguno.',
              'Quieres servir pedidos pequeños a menudo en lugar de acumular para llenar un camión.',
            ],
          },
          { type: 'h', text: 'Cuándo compensa el camión completo' },
          {
            type: 'ul',
            items: [
              'Llenas media carga o más: a partir de ahí la diferencia de precio se estrecha mucho.',
              'La mercancía es delicada y prefieres que nadie la toque hasta el destino.',
              'Necesitas una hora de entrega concreta, sin depender de otras descargas.',
              'Son piezas voluminosas o con medidas fuera de palé estándar.',
            ],
          },
          { type: 'h', text: 'El factor que casi nadie mira: las manipulaciones' },
          {
            type: 'p',
            text: 'Cada vez que un palé se sube, se baja o se cambia de camión es una oportunidad de que algo se mueva. Con azulejo, que pesa mucho y se astilla por los cantos, eso importa más que en otras mercancías. El grupaje bien hecho reduce manipulaciones agrupando en un solo almacén; el mal hecho las multiplica pasando la carga por tres plataformas.',
          },
          { type: 'h', text: 'Cómo lo resolvemos nosotros' },
          {
            type: 'p',
            text: 'Consolidamos en nuestro propio almacén de Castellón y salimos cada día laborable hacia Madrid. Eso quita el inconveniente clásico del grupaje: tu carga no espera a que se llene el camión, porque el camión sale igual. Si tienes dudas con un envío concreto, cuéntanoslo y te decimos cuál de las dos opciones te sale mejor, aunque sea la más barata para ti.',
          },
        ],
      },
      en: {
        title: 'Groupage or full truckload: how to choose for your freight',
        excerpt:
          'Paying only for the space you use, or taking the whole truck. The difference is not just price: it is lead times, handling and the risk of breakage.',
        body: [
          {
            type: 'p',
            text: 'It is the first question almost everyone asks us, and the answer is rarely the same twice. It depends on how many pallets you move, how fragile the goods are and how tight your deadline is.',
          },
          { type: 'h', text: 'What each one means' },
          {
            type: 'p',
            text: 'In groupage your goods share a truck with other clients. You pay for the floor space you use and the cost of the trip is split between everyone. In full truckload the vehicle runs for you alone, from origin to destination, with no intermediate stops.',
          },
          { type: 'h', text: 'When groupage pays off' },
          {
            type: 'ul',
            items: [
              'You move between one and ten or twelve pallets.',
              'Your volume is irregular: three pallets one week and none the next.',
              'You want to serve small orders often rather than stockpile until a truck is full.',
            ],
          },
          { type: 'h', text: 'When a full truck is worth it' },
          {
            type: 'ul',
            items: [
              'You fill half a load or more: past that point the price gap narrows a lot.',
              'The goods are delicate and you would rather nobody touched them until delivery.',
              'You need a specific delivery time, without depending on other drops.',
              'The pieces are bulky or fall outside standard pallet dimensions.',
            ],
          },
          { type: 'h', text: 'The factor almost nobody checks: handling' },
          {
            type: 'p',
            text: 'Every time a pallet is lifted, set down or moved between trucks is a chance for something to shift. With tiles, which are heavy and chip at the edges, that matters more than with other goods. Groupage done well reduces handling by consolidating in a single warehouse; done badly it multiplies it by routing your freight through three hubs.',
          },
          { type: 'h', text: 'How we handle it' },
          {
            type: 'p',
            text: 'We consolidate in our own warehouse in Castellón and leave for Madrid every working day. That removes the classic drawback of groupage: your freight does not wait for the truck to fill up, because the truck leaves anyway. If you are unsure about a specific shipment, tell us and we will say which of the two suits you better, even when that is the cheaper one for you.',
          },
        ],
      },
    },
  },
  {
    slug: 'preparar-pale-azulejos',
    date: '2026-06-11',
    minutes: 3,
    cover: '/media/blog/preparar-pale-azulejos.jpg',
    content: {
      es: {
        title: 'Cómo preparar un palé de azulejos para que llegue intacto',
        excerpt:
          'La mayoría de roturas no pasan en la carretera: pasan porque el palé salió mal montado del almacén. Seis cosas que marcan la diferencia.',
        body: [
          {
            type: 'p',
            text: 'Llevamos cuarenta años moviendo cerámica y hay un patrón que se repite: cuando algo llega roto, casi nunca es por un frenazo. Es por cómo estaba montado el palé antes de subirlo al camión.',
          },
          { type: 'h', text: 'Empieza por el palé' },
          {
            type: 'p',
            text: 'Un palé con tablas partidas o con clavos salidos no aguanta el peso del azulejo. Revisa que esté entero y que sea del tamaño adecuado a las cajas: si la carga sobresale por los lados, ese canto va a golpear con todo lo que pase cerca.',
          },
          { type: 'h', text: 'Carga pesada abajo y hacia el centro' },
          {
            type: 'p',
            text: 'Parece obvio y se incumple constantemente. El formato grande y las cajas más pesadas van abajo. Y centrado: un palé con el peso desplazado a un lado vuelca en cuanto la carretilla lo levanta con una horquilla mal metida.',
          },
          { type: 'h', text: 'No dejes huecos' },
          {
            type: 'p',
            text: 'Los huecos entre cajas son por donde empieza el movimiento. Rellena con cartón, esquineras o el propio material hasta que el bloque quede compacto. Una carga que no se mueve no se rompe.',
          },
          { type: 'h', text: 'Protege los cantos' },
          {
            type: 'p',
            text: 'El azulejo se astilla por las esquinas, y ahí es justo donde aprieta el film. Pon esquineras de cartón o plástico en las cuatro aristas verticales antes de enfilmar.',
          },
          { type: 'h', text: 'Enfilma anclando al palé' },
          {
            type: 'p',
            text: 'El error más común es enfilmar solo la mercancía. Da dos o tres vueltas que cojan también la madera del palé: eso es lo que impide que el bloque se deslice sobre la base. Y sube en espiral solapando la mitad de cada vuelta.',
          },
          { type: 'h', text: 'Etiqueta la cara visible' },
          {
            type: 'p',
            text: 'Referencia, número de bultos y destinatario, en un lateral que se lea sin mover el palé. Ahorra llamadas y evita que tu mercancía acabe en el muelle equivocado.',
          },
          {
            type: 'p',
            text: 'Si tienes dudas con un formato concreto, pregúntanos antes de montar la carga. Es mucho más barato que una reclamación.',
          },
        ],
      },
      en: {
        title: 'How to build a pallet of tiles so it arrives intact',
        excerpt:
          'Most breakages do not happen on the road: they happen because the pallet left the warehouse badly built. Six things that make the difference.',
        body: [
          {
            type: 'p',
            text: 'We have been moving ceramics for forty years and one pattern repeats itself: when something arrives broken, it is almost never because of hard braking. It is how the pallet was built before it went on the truck.',
          },
          { type: 'h', text: 'Start with the pallet itself' },
          {
            type: 'p',
            text: 'A pallet with split boards or protruding nails will not take the weight of tiles. Check it is sound and the right size for the boxes: if the load overhangs the sides, that edge will hit everything that passes near it.',
          },
          { type: 'h', text: 'Heavy at the bottom, weight centred' },
          {
            type: 'p',
            text: 'It sounds obvious and it is broken constantly. Large format and the heaviest boxes go at the bottom. And centred: a pallet with the weight to one side tips over as soon as a forklift picks it up slightly off.',
          },
          { type: 'h', text: 'Leave no gaps' },
          {
            type: 'p',
            text: 'Gaps between boxes are where movement starts. Fill them with cardboard, corner protectors or the material itself until the block is solid. A load that cannot move cannot break.',
          },
          { type: 'h', text: 'Protect the edges' },
          {
            type: 'p',
            text: 'Tiles chip at the corners, and that is exactly where the stretch film bites hardest. Put cardboard or plastic corner protectors on all four vertical edges before wrapping.',
          },
          { type: 'h', text: 'Wrap the film onto the pallet' },
          {
            type: 'p',
            text: 'The most common mistake is wrapping only the goods. Take two or three turns that also catch the wooden pallet: that is what stops the block sliding off its base. Then spiral upwards overlapping half of each turn.',
          },
          { type: 'h', text: 'Label the visible face' },
          {
            type: 'p',
            text: 'Reference, number of packages and consignee, on a side that can be read without moving the pallet. It saves phone calls and stops your goods ending up at the wrong dock.',
          },
          {
            type: 'p',
            text: 'If you are unsure about a particular format, ask us before you build the load. It is far cheaper than a claim.',
          },
        ],
      },
    },
  },
  {
    slug: 'cuanto-tarda-castellon-madrid',
    date: '2026-07-09',
    minutes: 4,
    cover: '/media/blog/cuanto-tarda-castellon-madrid.jpg',
    content: {
      es: {
        title: 'Cuánto tarda un envío de Castellón a Madrid (y de qué depende)',
        excerpt:
          'La respuesta corta es 24 horas. La larga tiene que ver con la hora a la que nos avisas, dónde está tu fábrica y quién descarga al otro lado.',
        body: [
          {
            type: 'p',
            text: 'Son unos 420 kilómetros por carretera. En tiempo de conducción pura eso son poco más de cuatro horas. Pero el plazo que le importa a un cliente no es el del camión rodando: es desde que la mercancía sale de tu almacén hasta que está descargada en destino.',
          },
          { type: 'h', text: 'El plazo real: 24 horas' },
          {
            type: 'p',
            text: 'Recogemos en la provincia de Castellón durante el día, consolidamos en nuestro almacén y salimos hacia Madrid. Al día siguiente se reparte. Ese es el compromiso y es el que funciona el noventa y tantos por ciento de las veces.',
          },
          { type: 'h', text: 'Qué puede alargarlo' },
          {
            type: 'ul',
            items: [
              'La hora de aviso. Si nos llamas a última hora de la tarde, la recogida entra en la ruta del día siguiente.',
              'Dónde está la fábrica. Las localidades del área cerámica quedan en ruta; un punto aislado puede requerir un día más de coordinación.',
              'El destinatario. Muchos almacenes y obras descargan solo en franjas concretas, y algunos piden cita previa.',
              'El tipo de descarga. Si no hay muelle ni carretilla en destino hay que prever vehículo con pluma o transpaleta.',
            ],
          },
          { type: 'h', text: 'Lo que más retrasa entregas no es el transporte' },
          {
            type: 'p',
            text: 'Es la documentación incompleta y los datos de contacto que no responden. Un teléfono equivocado en destino puede costar un día entero: el conductor llega, no hay quien firme ni quien abra el muelle, y esa descarga se cae a la ruta siguiente.',
          },
          { type: 'h', text: 'Cómo ganar tiempo' },
          {
            type: 'ul',
            items: [
              'Avísanos en cuanto sepas que vas a tener carga, aunque no esté lista.',
              'Manda el teléfono directo de quien recibe, no la centralita.',
              'Di desde el principio si el destino necesita cita o tiene horario restringido.',
              'Indica si hace falta descarga con medios propios del camión.',
            ],
          },
          {
            type: 'p',
            text: 'Con esos cuatro datos por delante, las 24 horas dejan de ser una promesa comercial y pasan a ser una rutina.',
          },
        ],
      },
      en: {
        title: 'How long a shipment from Castellón to Madrid takes',
        excerpt:
          'The short answer is 24 hours. The long one depends on when you call us, where your factory is and who unloads at the other end.',
        body: [
          {
            type: 'p',
            text: 'It is around 420 kilometres by road. In pure driving time that is a little over four hours. But the lead time a client cares about is not the truck rolling: it is from the moment the goods leave your warehouse until they are unloaded at destination.',
          },
          { type: 'h', text: 'The real lead time: 24 hours' },
          {
            type: 'p',
            text: 'We collect across the province of Castellón during the day, consolidate in our warehouse and leave for Madrid. The next day it is delivered. That is the commitment and it holds the vast majority of the time.',
          },
          { type: 'h', text: 'What can stretch it' },
          {
            type: 'ul',
            items: [
              'When you call. Late in the afternoon and the pickup joins the next day route.',
              'Where the factory is. Towns in the ceramic cluster are on the route; an isolated point may need an extra day of coordination.',
              'The consignee. Many warehouses and building sites only unload in specific windows, and some require an appointment.',
              'The type of unloading. With no dock or forklift at destination you need to plan a vehicle with a crane or pallet truck.',
            ],
          },
          { type: 'h', text: 'What delays deliveries most is not transport' },
          {
            type: 'p',
            text: 'It is incomplete paperwork and contact numbers that nobody answers. A wrong phone number at destination can cost a full day: the driver arrives, there is nobody to sign or open the dock, and that drop falls to the next route.',
          },
          { type: 'h', text: 'How to save time' },
          {
            type: 'ul',
            items: [
              'Tell us as soon as you know freight is coming, even if it is not ready yet.',
              'Send the direct number of whoever receives it, not the switchboard.',
              'Say up front whether the destination needs an appointment or has restricted hours.',
              'Flag whether unloading needs equipment carried on the truck.',
            ],
          },
          {
            type: 'p',
            text: 'With those four details up front, 24 hours stops being a sales promise and becomes a routine.',
          },
        ],
      },
    },
  },
  {
    slug: 'documentacion-transporte-nacional',
    date: '2026-08-20',
    minutes: 3,
    cover: '/media/blog/documentacion-transporte-nacional.jpg',
    content: {
      es: {
        title: 'Qué documentación necesitas para un transporte nacional',
        excerpt:
          'Carta de porte, albarán y datos de contacto. Poco más, pero si falta alguno la mercancía se queda en el muelle.',
        body: [
          {
            type: 'p',
            text: 'La documentación de un transporte nacional de mercancía por carretera no es complicada. Lo que pasa es que casi siempre falta un dato pequeño, y ese dato pequeño para el camión.',
          },
          { type: 'h', text: 'La carta de porte' },
          {
            type: 'p',
            text: 'Es el documento que acredita el contrato de transporte y acompaña a la mercancía durante todo el viaje. Recoge quién envía, quién recibe, qué se transporta y en qué condiciones. Se firma en la entrega y es la prueba de que la mercancía llegó, y en qué estado.',
          },
          { type: 'h', text: 'Qué datos no pueden faltar' },
          {
            type: 'ul',
            items: [
              'Expedidor y destinatario: nombre, dirección completa y teléfono directo.',
              'Naturaleza de la mercancía: qué es, en qué formato y si tiene alguna particularidad.',
              'Número de bultos y peso total.',
              'Instrucciones especiales: horario de descarga, cita previa, medios necesarios.',
            ],
          },
          { type: 'h', text: 'El albarán' },
          {
            type: 'p',
            text: 'Es tu documento comercial, el que detalla lo que mandas al cliente. No sustituye a la carta de porte, pero conviene que ambos digan lo mismo: si el albarán habla de diez bultos y en el camión suben nueve, la incidencia aparece semanas después y ya no hay forma de reconstruir qué pasó.',
          },
          { type: 'h', text: 'Las reservas en la entrega' },
          {
            type: 'p',
            text: 'Si el destinatario ve algo raro al descargar, debe anotarlo en el documento antes de firmar. Una firma limpia cierra la entrega como correcta. Anotar "palé con film roto" o "esquina golpeada" cuesta diez segundos y es la diferencia entre poder reclamar y no poder.',
          },
          {
            type: 'p',
            text: 'Si trabajas con nosotros, la carta de porte la preparamos en tráfico. Solo necesitamos que los datos que nos pasas estén completos.',
          },
        ],
      },
      en: {
        title: 'What paperwork you need for a domestic road shipment',
        excerpt:
          'Consignment note, delivery note and contact details. Not much more, but if one is missing the freight stays on the dock.',
        body: [
          {
            type: 'p',
            text: 'The paperwork for a domestic road shipment is not complicated. The problem is that a small detail is almost always missing, and that small detail stops the truck.',
          },
          { type: 'h', text: 'The consignment note' },
          {
            type: 'p',
            text: 'This is the document that evidences the transport contract and travels with the goods for the whole trip. It records who sends, who receives, what is carried and under what conditions. It is signed on delivery and is the proof that the goods arrived, and in what condition.',
          },
          { type: 'h', text: 'Details that cannot be missing' },
          {
            type: 'ul',
            items: [
              'Sender and consignee: name, full address and a direct phone number.',
              'Nature of the goods: what they are, in what format and any particulars.',
              'Number of packages and total weight.',
              'Special instructions: unloading hours, appointment required, equipment needed.',
            ],
          },
          { type: 'h', text: 'The delivery note' },
          {
            type: 'p',
            text: 'This is your commercial document, the one detailing what you send the client. It does not replace the consignment note, but both should say the same thing: if the delivery note says ten packages and nine go on the truck, the discrepancy surfaces weeks later and by then there is no way to reconstruct what happened.',
          },
          { type: 'h', text: 'Reservations on delivery' },
          {
            type: 'p',
            text: 'If the consignee sees something odd while unloading, it must be written on the document before signing. A clean signature closes the delivery as correct. Noting "pallet with torn film" or "knocked corner" takes ten seconds and is the difference between being able to claim and not.',
          },
          {
            type: 'p',
            text: 'If you work with us, our traffic desk prepares the consignment note. We only need the details you give us to be complete.',
          },
        ],
      },
    },
  },
  {
    slug: 'azulejo-gran-formato-transporte',
    date: '2026-09-17',
    minutes: 4,
    cover: '/media/blog/azulejo-gran-formato-transporte.jpg',
    content: {
      es: {
        title: 'Azulejo de gran formato: qué cambia al transportarlo',
        excerpt:
          'Las placas de tres metros no son un azulejo más grande: son otra mercancía. Cambian el palé, el amarre, la carretilla y hasta quién puede descargarlas.',
        body: [
          {
            type: 'p',
            text: 'El gran formato lleva años ganando terreno en Castellón y ha cambiado la forma de cargar un camión. Una placa de 120 por 260, o de tres metros, no se comporta como una caja de baldosas de 30 por 30.',
          },
          { type: 'h', text: 'El problema no es el peso, es la esbeltez' },
          {
            type: 'p',
            text: 'Una placa grande es pesada, sí, pero lo crítico es que es muy fina en relación con su superficie. Trabaja a flexión: si se apoya mal o queda en voladizo aunque sean unos centímetros, se parte sola, sin que nadie la golpee.',
          },
          { type: 'h', text: 'Va en caballete, no apilado en horizontal' },
          {
            type: 'p',
            text: 'El gran formato viaja de canto, en bastidores o caballetes metálicos diseñados para eso, con el peso repartido y las placas separadas entre sí. Apilarlo en horizontal como baldosa pequeña es la receta para abrir una reclamación.',
          },
          { type: 'h', text: 'Amarre y estiba' },
          {
            type: 'ul',
            items: [
              'El caballete se amarra al piso del camión, no basta con calzarlo.',
              'Las cinchas van con protección donde tocan el canto de la placa.',
              'Conviene cargarlo contra el frontal o entre otras cargas firmes, para que no tenga recorrido.',
            ],
          },
          { type: 'h', text: 'La descarga es la mitad del problema' },
          {
            type: 'p',
            text: 'No todo el mundo puede descargar gran formato. Hacen falta horquillas largas, a veces útiles específicos, y espacio de maniobra. Conviene confirmarlo con el destinatario antes de cargar, no cuando el camión ya está en la puerta.',
          },
          { type: 'h', text: 'Qué preguntar antes de pedir el transporte' },
          {
            type: 'ul',
            items: [
              '¿En qué formato exacto va y sobre qué soporte?',
              '¿El destinatario tiene medios para bajar un caballete de ese peso?',
              '¿Hay que devolver los caballetes vacíos? Eso es un viaje de retorno que conviene planificar.',
            ],
          },
          {
            type: 'p',
            text: 'Lo movemos a diario dentro de nuestra ruta Castellón ⇄ Madrid. Si vas a empezar a servir gran formato, cuéntanoslo antes del primer envío y lo preparamos bien desde el principio.',
          },
        ],
      },
      en: {
        title: 'Large-format tiles: what changes when you ship them',
        excerpt:
          'Three-metre slabs are not just a bigger tile: they are a different product. They change the pallet, the lashing, the forklift and even who can unload them.',
        body: [
          {
            type: 'p',
            text: 'Large format has been gaining ground in Castellón for years and it has changed how a truck is loaded. A 120 by 260 slab, or a three-metre one, does not behave like a box of 30 by 30 tiles.',
          },
          { type: 'h', text: 'The problem is not weight, it is slenderness' },
          {
            type: 'p',
            text: 'A large slab is heavy, yes, but what matters is that it is very thin relative to its surface. It works in bending: if it rests badly or overhangs even by a few centimetres, it cracks on its own, without anyone hitting it.',
          },
          { type: 'h', text: 'It travels on an A-frame, not stacked flat' },
          {
            type: 'p',
            text: 'Large format travels on edge, in metal frames or A-frames designed for it, with the weight spread and the slabs separated from each other. Stacking it flat like small tiles is a recipe for a claim.',
          },
          { type: 'h', text: 'Lashing and stowage' },
          {
            type: 'ul',
            items: [
              'The frame is lashed to the truck floor; chocking it is not enough.',
              'Straps need edge protection where they touch the slab.',
              'Load it against the headboard or between other firm loads so it has no run.',
            ],
          },
          { type: 'h', text: 'Unloading is half the problem' },
          {
            type: 'p',
            text: 'Not everyone can unload large format. It needs long forks, sometimes specific attachments, and room to manoeuvre. Confirm it with the consignee before loading, not when the truck is already at the gate.',
          },
          { type: 'h', text: 'What to ask before booking transport' },
          {
            type: 'ul',
            items: [
              'What exact format is it, and on what support?',
              'Does the consignee have the means to lift a frame of that weight?',
              'Do the empty frames come back? That is a return trip worth planning.',
            ],
          },
          {
            type: 'p',
            text: 'We move it daily on our Castellón to Madrid route. If you are about to start serving large format, tell us before the first shipment and we will set it up properly from the start.',
          },
        ],
      },
    },
  },
  {
    slug: 'medidas-y-peso-de-un-pale',
    date: '2026-04-16',
    minutes: 4,
    cover: '/media/blog/medidas-y-peso-de-un-pale.jpg',
    content: {
      es: {
        title: 'Medidas y peso de un palé: europalé, americano y el de azulejo',
        excerpt: 'Casi todos los líos de carga empiezan en la misma frase: «es un palé normal». Las medidas estándar y, sobre todo, lo que pesan de verdad cuando van cargados.',
        body: [
          {
            type: 'p',
            text: 'Un palé normal no existe. Existen varios formatos, y cada uno ocupa y pesa una cosa distinta. Como el precio del transporte sale justo de ahí, merece la pena tener los números a mano antes de pedir presupuesto.',
          },
          {
            type: 'h',
            text: 'Los formatos que se ven en Castellón',
          },
          {
            type: 'ul',
            items: [
              'Europalé (EUR/EPAL): 1200 × 800 mm. Es el estándar europeo y el que mejor aprovecha el ancho del camión.',
              'Palé americano o industrial: 1200 × 1000 mm. Más ancho, muy habitual en material de construcción.',
              'Medio palé: 800 × 600 mm. Para pedidos pequeños y preparación por unidades.',
              'Palé de azulejo: según fábrica va en 1200 × 800 o en 1200 × 1000, con alturas de entre 60 y 110 cm según el formato de la pieza.',
            ],
          },
          {
            type: 'h',
            text: 'Cuánto pesa de verdad',
          },
          {
            type: 'p',
            text: 'El palé vacío pesa entre 20 y 25 kg. Lo que cambia todo es lo que lleva encima: un palé de cerámica ronda los 1.000 a 1.400 kg y en gran formato pasa de 1.500. Para comparar, uno de cartonaje o de embalajes se queda en 200 o 300 kg.',
          },
          {
            type: 'p',
            text: 'Ese peso decide si el camión se llena por volumen o por tonelaje. Con azulejo casi siempre se llena por peso: un tráiler llega al límite legal mucho antes de quedarse sin suelo, así que de poco sirve que sobre sitio.',
          },
          {
            type: 'h',
            text: 'La altura, que es la que se olvida',
          },
          {
            type: 'p',
            text: 'La medida que falta en nueve de cada diez correos es la altura con la carga puesta. Es la que dice si el palé se puede apilar y, por tanto, si ocupa una planta del camión o dos. Como referencia, por debajo de un metro casi siempre se puede doblar; por encima de 1,20 ya no.',
          },
          {
            type: 'h',
            text: 'Lo que conviene apuntar siempre',
          },
          {
            type: 'ul',
            items: [
              'Largo por ancho del palé.',
              'Altura total con la mercancía y el retractilado puestos.',
              'Peso real por palé, no el teórico de catálogo.',
              'Si admite otro palé encima.',
            ],
          },
          {
            type: 'p',
            text: 'Con esos cuatro datos cualquier transportista serio te da un precio cerrado. Sin ellos, lo que te dé será una estimación que luego cambia.',
          },
        ],
      },
      en: {
        title: 'Pallet sizes and weights: euro, industrial and the tile pallet',
        excerpt: 'Almost every loading problem starts with the same sentence: “it is a normal pallet”. The standard sizes and, above all, what they really weigh once loaded.',
        body: [
          {
            type: 'p',
            text: 'There is no such thing as a normal pallet. There are several formats, and each one takes up a different amount of space and weighs a different amount. Since the freight price comes straight out of that, it pays to have the numbers at hand before asking for a quote.',
          },
          {
            type: 'h',
            text: 'The formats you see around Castellón',
          },
          {
            type: 'ul',
            items: [
              'Euro pallet (EUR/EPAL): 1200 × 800 mm. The European standard and the one that uses the width of the truck best.',
              'Industrial pallet: 1200 × 1000 mm. Wider, and very common in building materials.',
              'Half pallet: 800 × 600 mm. For small orders and item picking.',
              'Tile pallet: depending on the factory it comes as 1200 × 800 or 1200 × 1000, 60 to 110 cm high depending on the tile format.',
            ],
          },
          {
            type: 'h',
            text: 'What it actually weighs',
          },
          {
            type: 'p',
            text: 'An empty pallet weighs 20 to 25 kg. What changes everything is what sits on top: a ceramic pallet runs 1,000 to 1,400 kg, and large format goes past 1,500. For comparison, a pallet of cardboard or packaging stays at 200 or 300 kg.',
          },
          {
            type: 'p',
            text: 'That weight decides whether the truck fills up by volume or by tonnage. With tiles it is almost always weight: a trailer hits the legal limit long before it runs out of floor, so spare room is of little use.',
          },
          {
            type: 'h',
            text: 'Height, the one everyone forgets',
          },
          {
            type: 'p',
            text: 'The measurement missing from nine out of ten emails is the height with the goods on. It is what decides whether the pallet can be stacked and therefore whether it takes one deck of the truck or two. As a rule of thumb, under a metre it can usually be doubled up; over 1.20 m it cannot.',
          },
          {
            type: 'h',
            text: 'What to write down every time',
          },
          {
            type: 'ul',
            items: [
              'Pallet length by width.',
              'Total height with the goods and the wrapping on.',
              'Real weight per pallet, not the catalogue figure.',
              'Whether another pallet can go on top.',
            ],
          },
          {
            type: 'p',
            text: 'With those four figures any serious carrier can give you a firm price. Without them, whatever you get is an estimate that will change later.',
          },
        ],
      },
    },
  },
  {
    slug: 'metros-lineales-de-carga',
    date: '2026-07-23',
    minutes: 4,
    cover: '/media/blog/metros-lineales-de-carga.jpg',
    content: {
      es: {
        title: 'Metros lineales: cómo se mide de verdad lo que ocupa tu carga',
        excerpt: 'La unidad con la que se cotiza un grupaje. Cómo se calcula y por qué dos envíos con los mismos palés pueden ocupar —y costar— el doble.',
        body: [
          {
            type: 'p',
            text: 'Cuando pides precio para un grupaje, lo que estás alquilando no es «un palé»: es un trozo del suelo del camión. Esa es la unidad real, y se llama metro lineal.',
          },
          {
            type: 'h',
            text: 'Qué es un metro lineal',
          },
          {
            type: 'p',
            text: 'Un semirremolque de lonas mide 13,6 metros de largo por 2,45 de ancho. Un metro lineal es una franja de un metro a lo ancho de esa caja. Como en el ancho caben dos europalés puestos de canto —dos veces 0,8 m—, cada europalé ocupa aproximadamente 0,4 metros lineales.',
          },
          {
            type: 'h',
            text: 'La cuenta rápida',
          },
          {
            type: 'ul',
            items: [
              'Europalé (1200 × 800) colocado a lo normal: 0,4 metros lineales.',
              'Palé americano (1200 × 1000): 0,5 metros lineales.',
              'Tráiler completo: 13,6 metros lineales, o 33 europalés en una sola planta.',
            ],
          },
          {
            type: 'h',
            text: 'Dónde se tuerce la cuenta',
          },
          {
            type: 'p',
            text: 'Si el palé no se puede apilar, el hueco de encima se pierde y lo pagas igual, porque nadie puede vendérselo a otro cliente. Por eso diez palés apilables y diez sin apilar pueden tener precios muy distintos aunque pesen y midan lo mismo.',
          },
          {
            type: 'p',
            text: 'Lo mismo pasa con la mercancía que sobresale. Un palé que se pasa cinco centímetros del formato ya no deja colocar otro al lado, así que se come el ancho entero del camión en esa franja.',
          },
          {
            type: 'h',
            text: 'Para qué te sirve saberlo',
          },
          {
            type: 'p',
            text: 'Para dos cosas. La primera, comparar presupuestos de verdad: dos ofertas «por palé» pueden estar midiendo cosas distintas y no te enteras hasta que llega la factura.',
          },
          {
            type: 'p',
            text: 'La segunda, decidir cuándo dejas de pagar grupaje y te llevas el camión entero. A partir de siete u ocho metros lineales la diferencia se estrecha muchísimo, y con el camión completo te ahorras además las manipulaciones intermedias.',
          },
        ],
      },
      en: {
        title: 'Loading metres: how the space your freight takes is really measured',
        excerpt: 'The unit groupage is actually quoted in. How it is worked out, and why two shipments with the same pallets can take up — and cost — twice as much.',
        body: [
          {
            type: 'p',
            text: 'When you ask for a groupage price, what you are renting is not “a pallet”: it is a stretch of the truck floor. That is the real unit, and it is called a loading metre.',
          },
          {
            type: 'h',
            text: 'What a loading metre is',
          },
          {
            type: 'p',
            text: 'A curtain-sider trailer is 13.6 metres long by 2.45 wide. A loading metre is a one-metre strip across that width. Since two euro pallets fit side by side across it — two times 0.8 m — each euro pallet takes roughly 0.4 loading metres.',
          },
          {
            type: 'h',
            text: 'The quick maths',
          },
          {
            type: 'ul',
            items: [
              'Euro pallet (1200 × 800) loaded the usual way: 0.4 loading metres.',
              'Industrial pallet (1200 × 1000): 0.5 loading metres.',
              'Full trailer: 13.6 loading metres, or 33 euro pallets on a single deck.',
            ],
          },
          {
            type: 'h',
            text: 'Where the maths goes wrong',
          },
          {
            type: 'p',
            text: 'If the pallet cannot be stacked, the space above it is lost and you pay for it anyway, because nobody can sell it to another customer. That is why ten stackable pallets and ten non-stackable ones can be priced very differently even though they weigh and measure the same.',
          },
          {
            type: 'p',
            text: 'The same goes for overhang. A pallet five centimetres over format leaves no room for another one beside it, so it eats the whole width of the truck along that strip.',
          },
          {
            type: 'h',
            text: 'Why it is worth knowing',
          },
          {
            type: 'p',
            text: 'Two reasons. First, so you can compare quotes properly: two offers priced “per pallet” may be measuring different things, and you only find out when the invoice arrives.',
          },
          {
            type: 'p',
            text: 'Second, to decide when to stop paying for groupage and take the whole truck. From seven or eight loading metres the gap narrows a lot, and with a full truck you also save the handling in between.',
          },
        ],
      },
    },
  },
  {
    slug: 'seguro-de-transporte-y-cmr',
    date: '2026-08-06',
    minutes: 5,
    cover: '/media/blog/seguro-de-transporte-y-cmr.jpg',
    content: {
      es: {
        title: 'Seguro de transporte: qué cubre y qué tienes que declarar',
        excerpt: 'La responsabilidad del transportista está limitada por ley y se calcula por kilo, no por valor. Lo que eso significa para tu mercancía y cómo se amplía.',
        body: [
          {
            type: 'p',
            text: 'Es un tema árido y por eso casi nadie lo mira hasta que pasa algo. Merece la pena dedicarle cinco minutos antes, porque la diferencia entre cobrar lo que vale tu mercancía o una parte pequeña se decide con un dato en el papel.',
          },
          {
            type: 'h',
            text: 'La responsabilidad del transportista está limitada',
          },
          {
            type: 'p',
            text: 'En transporte nacional, la Ley del Contrato de Transporte Terrestre fija una indemnización máxima por kilo de mercancía perdida o dañada. En transporte internacional por carretera hace lo mismo el convenio CMR. Son límites por peso, no por valor: da igual lo que costara lo que iba dentro.',
          },
          {
            type: 'p',
            text: 'Para mercancía pesada y de poco valor por kilo —que es justo el caso del azulejo— ese límite suele cubrir bien. Para mercancía ligera y cara, se queda corto enseguida.',
          },
          {
            type: 'h',
            text: 'Qué puedes hacer si tu mercancía vale más',
          },
          {
            type: 'ul',
            items: [
              'Declarar el valor de la mercancía en la carta de porte: eleva el límite y normalmente lleva un recargo.',
              'Contratar un seguro de daños a la mercancía, aparte del transporte. Ese cubre por valor y no por kilo.',
              'Comprobar que tu operación concreta entra en la póliza: hay exclusiones habituales, como la mercancía mal estibada en origen.',
            ],
          },
          {
            type: 'h',
            text: 'El papel que decide casi todo: el albarán',
          },
          {
            type: 'p',
            text: 'Cuando se descarga, quien recibe firma. Si firma sin mirar y el daño aparece al día siguiente, reclamar se complica mucho. Ante cualquier sospecha —film roto, esquina golpeada, palé movido— hay que escribirlo en el albarán en ese momento, con detalle y antes de firmar.',
          },
          {
            type: 'ul',
            items: [
              'Reservas por escrito en el albarán, en el momento de la entrega.',
              'Fotos del palé tal y como llega, antes de desembalar.',
              'Aviso al transportista cuanto antes: los plazos para reclamar son cortos.',
            ],
          },
          {
            type: 'h',
            text: 'Cómo lo planteamos nosotros',
          },
          {
            type: 'p',
            text: 'Trabajamos con flota propia, así que la mercancía no cambia de manos por el camino y no hay que averiguar en qué tramo pasó. Si mueves material de valor alto, dínoslo al pedir el presupuesto: esto se prepara antes, no después.',
          },
        ],
      },
      en: {
        title: 'Freight insurance: what it covers and what you need to declare',
        excerpt: 'A carrier’s liability is capped by law and worked out per kilo, not by value. What that means for your goods and how to extend it.',
        body: [
          {
            type: 'p',
            text: 'It is a dry subject, which is why almost nobody looks at it until something happens. It is worth five minutes beforehand, because the difference between recovering what your goods are worth and recovering a fraction comes down to one line on a piece of paper.',
          },
          {
            type: 'h',
            text: 'A carrier’s liability is capped',
          },
          {
            type: 'p',
            text: 'For domestic transport in Spain, the Land Transport Contract Act sets a maximum compensation per kilo of goods lost or damaged. For international road transport, the CMR convention does the same. These are limits by weight, not by value: what the contents cost makes no difference.',
          },
          {
            type: 'p',
            text: 'For heavy goods of low value per kilo — which is exactly the case with tiles — that limit usually covers things well. For light, expensive goods it falls short very quickly.',
          },
          {
            type: 'h',
            text: 'What you can do if your goods are worth more',
          },
          {
            type: 'ul',
            items: [
              'Declare the value of the goods on the consignment note: it raises the cap and normally carries a surcharge.',
              'Take out cargo insurance separately from the transport. That covers by value, not by kilo.',
              'Check that your particular operation falls inside the policy: there are common exclusions, such as goods badly stowed at origin.',
            ],
          },
          {
            type: 'h',
            text: 'The document that decides almost everything',
          },
          {
            type: 'p',
            text: 'At unloading, whoever receives the goods signs. If they sign without looking and the damage shows up the next day, claiming gets a lot harder. At any suspicion — torn wrap, a knocked corner, a shifted pallet — it has to be written on the delivery note there and then, in detail, before signing.',
          },
          {
            type: 'ul',
            items: [
              'Written reservations on the delivery note, at the moment of delivery.',
              'Photos of the pallet as it arrives, before unwrapping.',
              'Tell the carrier as soon as possible: claim windows are short.',
            ],
          },
          {
            type: 'h',
            text: 'How we approach it',
          },
          {
            type: 'p',
            text: 'We run our own fleet, so the goods never change hands along the way and nobody has to work out which leg it happened on. If you move high-value material, tell us when you ask for the quote: this gets arranged before, not after.',
          },
        ],
      },
    },
  },
  {
    slug: 'cuanto-cuesta-enviar-un-pale',
    date: '2026-09-24',
    minutes: 5,
    cover: '/media/blog/cuanto-cuesta-enviar-un-pale.jpg',
    content: {
      es: {
        title: 'Cuánto cuesta enviar un palé de Castellón a Madrid',
        excerpt: 'No hay tarifa plana, y quien te dé un precio por teléfono sin preguntar nada se lo está inventando. Esto es lo que mira de verdad quien calcula el porte.',
        body: [
          {
            type: 'p',
            text: 'Es la pregunta que más nos llega y la que peor se responde por ahí. El precio de un palé no sale de una tabla: sale de cruzar cinco o seis datos, y si falta alguno el presupuesto se queda en una estimación que luego cambia.',
          },
          {
            type: 'h',
            text: 'Qué entra en el precio',
          },
          {
            type: 'ul',
            items: [
              'El espacio que ocupa, medido en metros lineales de camión y no en palés sueltos.',
              'El peso, porque un palé de azulejo pesa lo que tres de cartonaje.',
              'El punto de recogida: no cuesta lo mismo una fábrica en Onda que una nave en el interior de la provincia.',
              'La zona de entrega: Madrid capital con restricciones no es un polígono de Fuenlabrada.',
              'Si hace falta descargar sin muelle, con carretilla o a pie de calle.',
              'La frecuencia: quien manda tres palés cada semana no paga lo mismo que quien manda tres una vez al año.',
            ],
          },
          {
            type: 'h',
            text: 'Por qué se mide en metros lineales',
          },
          {
            type: 'p',
            text: 'Un camión de lonas tiene 13,6 metros de largo. Lo que se vende en grupaje no son palés, son tramos de ese suelo: un europalé ocupa unos 0,4 metros lineales. Si tu palé es más alto de lo normal o no se puede apilar, bloquea además el hueco de arriba, y eso también se paga aunque el suelo ocupado sea el mismo.',
          },
          {
            type: 'h',
            text: 'El error más común',
          },
          {
            type: 'p',
            text: 'Pedir precio por palé sin decir si se puede apilar. Un palé apilable y otro que no lo es ocupan lo mismo en el suelo y el doble de camión. Es la diferencia más grande que hay entre dos presupuestos que a simple vista parecen iguales.',
          },
          {
            type: 'h',
            text: 'Qué darnos para que el precio sea el definitivo',
          },
          {
            type: 'ul',
            items: [
              'Número de palés, medidas y altura real con la carga puesta.',
              'Peso por palé.',
              'Si admite otro palé encima o no.',
              'Código postal de recogida y de entrega.',
              'Si hay muelle en destino o hay que descargar en la calle.',
            ],
          },
          {
            type: 'p',
            text: 'Con eso te damos un precio cerrado, no una horquilla. Y si mueves volumen de forma habitual, lo que toca no es un presupuesto por envío: es una tarifa.',
          },
        ],
      },
      en: {
        title: 'What it costs to ship a pallet from Castellón to Madrid',
        excerpt: 'There is no flat rate, and anyone who quotes you over the phone without asking anything is making it up. Here is what actually goes into the price.',
        body: [
          {
            type: 'p',
            text: 'It is the question we get most and the one answered worst elsewhere. The price of a pallet does not come off a table: it comes from crossing five or six figures, and if one is missing the quote is only an estimate that changes later.',
          },
          {
            type: 'h',
            text: 'What goes into the price',
          },
          {
            type: 'ul',
            items: [
              'The space it takes, measured in loading metres rather than in loose pallets.',
              'The weight, because a tile pallet weighs what three pallets of cardboard do.',
              'The pickup point: a factory in Onda does not cost the same as a unit inland.',
              'The delivery area: central Madrid with access restrictions is not an industrial estate in Fuenlabrada.',
              'Whether unloading needs a forklift or has to happen at street level, with no dock.',
              'Frequency: someone sending three pallets a week does not pay what someone sending three once a year pays.',
            ],
          },
          {
            type: 'h',
            text: 'Why it is measured in loading metres',
          },
          {
            type: 'p',
            text: 'A curtain-sider is 13.6 metres long. What groupage sells is not pallets but stretches of that floor: a euro pallet takes about 0.4 loading metres. If your pallet is taller than usual or cannot be stacked, it also blocks the space above, and that is charged too even though the floor used is the same.',
          },
          {
            type: 'h',
            text: 'The most common mistake',
          },
          {
            type: 'p',
            text: 'Asking for a per-pallet price without saying whether it can be stacked. A stackable pallet and a non-stackable one take the same floor and twice the truck. It is the single biggest difference between two quotes that look identical.',
          },
          {
            type: 'h',
            text: 'What to send us for a firm price',
          },
          {
            type: 'ul',
            items: [
              'Number of pallets, dimensions and real height with the goods on.',
              'Weight per pallet.',
              'Whether another pallet can go on top.',
              'Postcode for pickup and for delivery.',
              'Whether there is a dock at destination or it has to be unloaded in the street.',
            ],
          },
          {
            type: 'p',
            text: 'With that we give you a firm price, not a range. And if you move volume regularly, what you need is not a quote per shipment: it is a rate.',
          },
        ],
      },
    },
  },
  {
    slug: 'almacen-regulador-cuando-compensa',
    date: '2026-10-01',
    minutes: 4,
    cover: '/media/blog/almacen-regulador-cuando-compensa.jpg',
    content: {
      es: {
        title: 'Almacén regulador: cuándo deja de compensarte guardar en fábrica',
        excerpt: 'Fabricar por lotes y servir poco a poco no cuadra sin un sitio donde la mercancía espere. Cuándo sale a cuenta sacar ese stock de la fábrica.',
        body: [
          {
            type: 'p',
            text: 'Pasa en casi todas las cerámicas: se cuece por hornadas grandes y se sirve en pedidos pequeños. Entre una cosa y otra hace falta un sitio donde la mercancía espere, y ese sitio casi siempre acaba siendo el peor posible: el patio de la propia fábrica.',
          },
          {
            type: 'h',
            text: 'Qué es un almacén regulador',
          },
          {
            type: 'p',
            text: 'Es una nave intermedia entre quien fabrica y quien compra. No se usa para guardar por guardar: se usa para separar dos ritmos que no encajan, el de producción, que va a lotes, y el de venta, que va a goteo.',
          },
          {
            type: 'h',
            text: 'Señales de que te hace falta',
          },
          {
            type: 'ul',
            items: [
              'En temporada alta tienes palés en zonas que no son de almacén.',
              'Frenas producción porque no tienes dónde dejar lo que sale.',
              'Mandas camiones a medio llenar solo para hacer hueco.',
              'Sirves a Madrid y tardas dos días porque primero hay que localizar el material.',
            ],
          },
          {
            type: 'h',
            text: 'Qué cambia si ese stock está a las puertas de Madrid',
          },
          {
            type: 'p',
            text: 'Que el plazo deja de depender de la fábrica. Con el material ya en Fuenlabrada, un pedido que entra por la mañana puede salir esa misma tarde, sin esperar al camión que viene de Castellón.',
          },
          {
            type: 'p',
            text: 'Y que dejas de pagar transporte de urgencia. Los portes caros no son los planificados: son los que salen a medio cargar para llegar a una fecha.',
          },
          {
            type: 'h',
            text: 'Cuándo no compensa',
          },
          {
            type: 'p',
            text: 'Si tu volumen es bajo y estable, no. Un almacén regulador se paga con rotación: si la mercancía va a estar meses parada, lo que tienes no es un problema de almacenaje sino de previsión de ventas.',
          },
          {
            type: 'p',
            text: 'Nosotros tenemos más de 4.000 m² propios entre Almazora y Fuenlabrada, o sea los dos extremos del corredor. Si quieres, echamos el número contigo antes de mover nada.',
          },
        ],
      },
      en: {
        title: 'Buffer warehousing: when storing at the factory stops paying off',
        excerpt: 'Producing in batches and shipping a little at a time does not add up without somewhere for the goods to wait. When it is worth moving that stock out of the factory.',
        body: [
          {
            type: 'p',
            text: 'It happens at almost every tile factory: production runs in large batches and shipping happens in small orders. In between, the goods need somewhere to wait, and that somewhere almost always ends up being the worst possible place: the factory yard.',
          },
          {
            type: 'h',
            text: 'What a buffer warehouse is',
          },
          {
            type: 'p',
            text: 'It is a warehouse sitting between the maker and the buyer. It is not for storing for the sake of storing: it is for separating two rhythms that do not match, production in batches and sales in a trickle.',
          },
          {
            type: 'h',
            text: 'Signs that you need one',
          },
          {
            type: 'ul',
            items: [
              'In high season you have pallets in places that are not storage areas.',
              'You slow production because there is nowhere to put what comes out.',
              'You send half-loaded trucks just to clear space.',
              'You ship to Madrid and it takes two days because the material has to be found first.',
            ],
          },
          {
            type: 'h',
            text: 'What changes with stock at the gates of Madrid',
          },
          {
            type: 'p',
            text: 'Lead time stops depending on the factory. With the material already in Fuenlabrada, an order that comes in during the morning can go out that same afternoon, without waiting for the truck from Castellón.',
          },
          {
            type: 'p',
            text: 'And you stop paying for rush transport. Expensive trips are not the planned ones: they are the ones that leave half loaded to hit a date.',
          },
          {
            type: 'h',
            text: 'When it does not pay off',
          },
          {
            type: 'p',
            text: 'If your volume is low and steady, it does not. A buffer warehouse pays for itself through turnover: if the goods are going to sit still for months, what you have is not a storage problem but a sales forecasting one.',
          },
          {
            type: 'p',
            text: 'We have more than 4,000 m² of our own between Almazora and Fuenlabrada, which is to say both ends of the corridor. If you like, we can run the numbers with you before anything moves.',
          },
        ],
      },
    },
  },
];

export function sortedPosts() {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

export function findPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}
