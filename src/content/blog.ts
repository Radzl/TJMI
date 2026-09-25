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
  content: Record<Locale, PostContent>;
};

export const posts: Post[] = [
  {
    slug: 'grupaje-o-camion-completo',
    date: '2026-05-14',
    minutes: 4,
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
];

export function sortedPosts() {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

export function findPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}
