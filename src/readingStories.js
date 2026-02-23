function story(id, title, paragraphs, questions) {
  return { id, title, paragraphs, questions }
}

function q(id, prompt, answer, options) {
  return { id, prompt, answer, options }
}

export const READING_STORY_BANKS = {
  english: [
    story(
      'en-kite-park',
      'Mia and the Kite',
      [
        'Mia went to the park with her dad after school.',
        'She brought a red kite and a small bottle of water.',
        'The wind was strong, so the kite went high in the sky.',
        'Before going home, Mia sat on a bench and ate a banana.',
      ],
      [
        q('q1', 'Where did Mia go after school?', 'The park', [
          'The park',
          'The library',
          'The beach',
          'The store',
        ]),
        q('q2', 'What color was Mia\'s kite?', 'Red', ['Blue', 'Red', 'Green', 'Yellow']),
        q('q3', 'Why did the kite go high?', 'The wind was strong', [
          'Mia ran very fast',
          'The wind was strong',
          'Her dad threw it',
          'It had a motor',
        ]),
        q('q4', 'What did Mia bring to drink?', 'A bottle of water', [
          'A bottle of water',
          'Orange juice',
          'Milk',
          'Hot chocolate',
        ]),
        q('q5', 'What did Mia eat before going home?', 'A banana', [
          'A sandwich',
          'A banana',
          'An apple',
          'Cookies',
        ]),
      ],
    ),
    story(
      'en-lunchbox-bus',
      'Ben Finds His Lunch Box',
      [
        'Ben rode the school bus in the morning.',
        'When he got to class, he could not find his blue lunch box.',
        'At lunch time, the bus driver brought it to the office.',
        'Ben had left it under his seat on the bus.',
      ],
      [
        q('q1', 'What did Ben lose?', 'His lunch box', [
          'His jacket',
          'His lunch box',
          'His notebook',
          'His shoes',
        ]),
        q('q2', 'What color was the lunch box?', 'Blue', ['Red', 'Yellow', 'Blue', 'Black']),
        q('q3', 'Who brought the lunch box to the office?', 'The bus driver', [
          'His teacher',
          'His friend',
          'The bus driver',
          'His mom',
        ]),
        q('q4', 'When did Ben get the lunch box back?', 'At lunch time', [
          'Before school',
          'At recess',
          'At lunch time',
          'After dinner',
        ]),
        q('q5', 'Where was the lunch box?', 'Under Ben\'s bus seat', [
          'In the classroom',
          'On the playground',
          'Under Ben\'s bus seat',
          'In the cafeteria',
        ]),
      ],
    ),
    story(
      'en-bean-plant',
      'Sara\'s Bean Plant',
      [
        'Sara put a bean seed in a cup with soil.',
        'She placed the cup near a sunny window in the kitchen.',
        'Every morning, she gave the plant a little water.',
        'After one week, a green sprout came out of the soil.',
      ],
      [
        q('q1', 'What seed did Sara plant?', 'A bean seed', [
          'A corn seed',
          'A flower seed',
          'A bean seed',
          'An apple seed',
        ]),
        q('q2', 'Where did she place the cup?', 'Near a sunny window', [
          'Under the bed',
          'Near a sunny window',
          'In the garage',
          'Inside a backpack',
        ]),
        q('q3', 'When did Sara water the plant?', 'Every morning', [
          'Every morning',
          'Only at night',
          'Once a week',
          'Never',
        ]),
        q('q4', 'What came out of the soil after one week?', 'A green sprout', [
          'A red flower',
          'A green sprout',
          'A big tree',
          'A rock',
        ]),
        q('q5', 'What was in the cup with the seed?', 'Soil', [
          'Sand',
          'Water only',
          'Soil',
          'Rice',
        ]),
      ],
    ),
    story(
      'en-rainy-boardgame',
      'A Rainy Afternoon',
      [
        'It rained all afternoon, so Leo stayed inside.',
        'He built a blanket fort in the living room.',
        'Later, his sister joined him and they played a board game.',
        'They ate crackers and laughed when Leo moved the wrong piece.',
      ],
      [
        q('q1', 'Why did Leo stay inside?', 'It rained all afternoon', [
          'He was sick',
          'It was too hot',
          'It rained all afternoon',
          'He had homework',
        ]),
        q('q2', 'What did Leo build?', 'A blanket fort', [
          'A sand castle',
          'A blanket fort',
          'A robot',
          'A paper plane',
        ]),
        q('q3', 'Who joined Leo later?', 'His sister', [
          'His cousin',
          'His teacher',
          'His sister',
          'His neighbor',
        ]),
        q('q4', 'What did they play?', 'A board game', [
          'Soccer',
          'A board game',
          'Hide and seek',
          'Basketball',
        ]),
        q('q5', 'What snack did they eat?', 'Crackers', [
          'Crackers',
          'Ice cream',
          'Soup',
          'Pizza',
        ]),
      ],
    ),
    story(
      'en-library-card',
      'Emma\'s Library Card',
      [
        'Emma visited the library with her aunt on Saturday.',
        'A librarian helped Emma sign up for her first library card.',
        'Emma borrowed two books about animals and one book of jokes.',
        'At home, she read the joke book to her little brother.',
      ],
      [
        q('q1', 'Who went with Emma to the library?', 'Her aunt', [
          'Her aunt',
          'Her grandpa',
          'Her teacher',
          'Her friend',
        ]),
        q('q2', 'What did Emma get at the library?', 'Her first library card', [
          'A toy',
          'A map',
          'Her first library card',
          'A lunch box',
        ]),
        q('q3', 'How many animal books did Emma borrow?', 'Two', [
          'One',
          'Two',
          'Three',
          'Four',
        ]),
        q('q4', 'What other kind of book did she borrow?', 'A joke book', [
          'A math book',
          'A music book',
          'A joke book',
          'A cookbook',
        ]),
        q('q5', 'Who did Emma read to at home?', 'Her little brother', [
          'Her mom',
          'Her little brother',
          'Her neighbor',
          'Her dog',
        ]),
      ],
    ),
    story(
      'en-market-list',
      'Noah at the Market',
      [
        'Noah and his mom walked to the farmers market.',
        'They brought a cloth bag and a short shopping list.',
        'They bought carrots, tomatoes, and sweet corn.',
        'Noah carried the corn because it was the lightest item.',
      ],
      [
        q('q1', 'Where did Noah go with his mom?', 'The farmers market', [
          'The zoo',
          'The farmers market',
          'The movie theater',
          'The post office',
        ]),
        q('q2', 'What did they bring?', 'A cloth bag and a shopping list', [
          'A toy truck and a hat',
          'A cloth bag and a shopping list',
          'A soccer ball and juice',
          'A backpack and paint',
        ]),
        q('q3', 'Which food did they buy?', 'Carrots, tomatoes, and corn', [
          'Apples, milk, and bread',
          'Carrots, tomatoes, and corn',
          'Rice, beans, and cheese',
          'Bananas, grapes, and yogurt',
        ]),
        q('q4', 'What did Noah carry?', 'The corn', [
          'The carrots',
          'The tomatoes',
          'The corn',
          'The bag of apples',
        ]),
        q('q5', 'Why did Noah carry that item?', 'It was the lightest item', [
          'It was the most expensive',
          'It was his favorite color',
          'It was the lightest item',
          'It was very heavy',
        ]),
      ],
    ),
    story(
      'en-lost-dog-tag',
      'A Friendly Dog',
      [
        'A small brown dog was waiting near Ava\'s gate after school.',
        'Ava gave the dog water and looked at its tag.',
        'The tag had a phone number and the name Max.',
        'Soon, Max\'s owner came and thanked Ava for helping.',
      ],
      [
        q('q1', 'Where was the dog waiting?', 'Near Ava\'s gate', [
          'At the park',
          'Near Ava\'s gate',
          'Inside the school',
          'On the bus',
        ]),
        q('q2', 'What did Ava give the dog?', 'Water', [
          'A toy',
          'Milk',
          'Water',
          'A blanket',
        ]),
        q('q3', 'What was on the tag?', 'A phone number and the name Max', [
          'A map and a key',
          'A phone number and the name Max',
          'A homework note',
          'A bus ticket',
        ]),
        q('q4', 'What was the dog\'s name?', 'Max', ['Rex', 'Max', 'Buddy', 'Spot']),
        q('q5', 'What did the owner do?', 'Thanked Ava', [
          'Gave Ava a bike',
          'Thanked Ava',
          'Called the police',
          'Left without speaking',
        ]),
      ],
    ),
    story(
      'en-volcano-class',
      'Science Day at School',
      [
        'Sam\'s class made a small volcano for science day.',
        'They used a plastic bottle, clay, and red paper.',
        'When the teacher poured in vinegar and baking soda, foam came out.',
        'Sam cheered because the class volcano looked real.',
      ],
      [
        q('q1', 'What did Sam\'s class make?', 'A small volcano', [
          'A bird house',
          'A small volcano',
          'A kite',
          'A robot',
        ]),
        q('q2', 'What did they use to shape the volcano?', 'Clay', [
          'Glass',
          'Clay',
          'Metal',
          'Ice',
        ]),
        q('q3', 'What happened when the teacher added ingredients?', 'Foam came out', [
          'It turned into ice',
          'Foam came out',
          'The bottle broke',
          'Nothing happened',
        ]),
        q('q4', 'Which two ingredients did the teacher pour in?', 'Vinegar and baking soda', [
          'Milk and sugar',
          'Water and salt',
          'Vinegar and baking soda',
          'Juice and flour',
        ]),
        q('q5', 'Why did Sam cheer?', 'The volcano looked real', [
          'Class ended early',
          'He got a new pencil',
          'The volcano looked real',
          'It started to rain',
        ]),
      ],
    ),
    story(
      'en-beach-shells',
      'Shells by the Water',
      [
        'Chloe visited the beach with her cousins on Sunday morning.',
        'They walked near the water and looked for shells.',
        'Chloe found one shell with pink lines and one smooth white shell.',
        'She put them in a small bucket to show her grandma later.',
      ],
      [
        q('q1', 'Who did Chloe visit the beach with?', 'Her cousins', [
          'Her teacher',
          'Her cousins',
          'Her soccer team',
          'Her uncle',
        ]),
        q('q2', 'What were they looking for?', 'Shells', [
          'Crabs',
          'Kites',
          'Shells',
          'Boats',
        ]),
        q('q3', 'What color lines were on one shell?', 'Pink', ['Blue', 'Green', 'Pink', 'Brown']),
        q('q4', 'Where did Chloe put the shells?', 'In a small bucket', [
          'In her shoe',
          'In a small bucket',
          'In the sand',
          'In a lunch box',
        ]),
        q('q5', 'Who was Chloe going to show the shells to?', 'Her grandma', [
          'Her brother',
          'Her grandma',
          'Her coach',
          'Her neighbor',
        ]),
      ],
    ),
    story(
      'en-snowman-scarf',
      'The Snowman Scarf',
      [
        'On a cold morning, Jack and Nina played outside in the snow.',
        'They built a snowman with a carrot nose and button eyes.',
        'Nina wrapped a green scarf around the snowman.',
        'Before going inside, Jack took a picture with his mom\'s phone.',
      ],
      [
        q('q1', 'What did Jack and Nina build?', 'A snowman', [
          'A fort',
          'A snowman',
          'A swing',
          'A sled',
        ]),
        q('q2', 'What did they use for the nose?', 'A carrot', [
          'A carrot',
          'A stick',
          'A rock',
          'A leaf',
        ]),
        q('q3', 'What color was the scarf?', 'Green', ['Red', 'Blue', 'Green', 'Purple']),
        q('q4', 'Who wrapped the scarf on the snowman?', 'Nina', [
          'Jack',
          'Jack\'s mom',
          'Nina',
          'Their teacher',
        ]),
        q('q5', 'What did Jack do before going inside?', 'He took a picture', [
          'He ate lunch',
          'He took a picture',
          'He made hot chocolate',
          'He cleaned the yard',
        ]),
      ],
    ),
  ],
  spanish: [
    story(
      'es-cometa-parque',
      'Mia y la cometa',
      [
        'Mia fue al parque con su papa despues de la escuela.',
        'Llevo una cometa roja y una botella pequena de agua.',
        'El viento estaba fuerte, asi que la cometa subio muy alto.',
        'Antes de volver a casa, Mia se sento en una banca y comio un guineo.',
      ],
      [
        q('q1', 'A donde fue Mia despues de la escuela?', 'Al parque', [
          'A la playa',
          'Al parque',
          'A la biblioteca',
          'A la tienda',
        ]),
        q('q2', 'De que color era la cometa?', 'Roja', ['Azul', 'Verde', 'Roja', 'Amarilla']),
        q('q3', 'Por que la cometa subio muy alto?', 'Porque el viento estaba fuerte', [
          'Porque Mia salto',
          'Porque el viento estaba fuerte',
          'Porque tenia motor',
          'Porque su papa la tiro',
        ]),
        q('q4', 'Que llevo Mia para beber?', 'Una botella de agua', [
          'Jugo de naranja',
          'Leche',
          'Una botella de agua',
          'Chocolate caliente',
        ]),
        q('q5', 'Que comio Mia antes de volver a casa?', 'Un guineo', [
          'Una manzana',
          'Un sandwich',
          'Un guineo',
          'Galletas',
        ]),
      ],
    ),
    story(
      'es-lonchera-bus',
      'La lonchera de Ben',
      [
        'Ben fue a la escuela en autobus por la manana.',
        'Cuando llego al salon, no encontro su lonchera azul.',
        'A la hora del almuerzo, el chofer llevo la lonchera a la oficina.',
        'Ben la habia dejado debajo de su asiento en el autobus.',
      ],
      [
        q('q1', 'Que perdio Ben?', 'Su lonchera', [
          'Su cuaderno',
          'Su lonchera',
          'Su chaqueta',
          'Sus zapatos',
        ]),
        q('q2', 'De que color era la lonchera?', 'Azul', ['Roja', 'Azul', 'Negra', 'Amarilla']),
        q('q3', 'Quien llevo la lonchera a la oficina?', 'El chofer del autobus', [
          'La maestra',
          'Su amigo',
          'El chofer del autobus',
          'Su mama',
        ]),
        q('q4', 'Cuando recupero Ben su lonchera?', 'A la hora del almuerzo', [
          'Antes de clases',
          'En la noche',
          'A la hora del almuerzo',
          'En el recreo',
        ]),
        q('q5', 'Donde estaba la lonchera?', 'Debajo del asiento del autobus', [
          'En la cafeteria',
          'En el patio',
          'Debajo del asiento del autobus',
          'En el salon',
        ]),
      ],
    ),
    story(
      'es-frijol-planta',
      'La planta de Sofia',
      [
        'Sofia puso una semilla de frijol en un vaso con tierra.',
        'Coloco el vaso cerca de una ventana con sol en la cocina.',
        'Cada manana, le ponia un poco de agua.',
        'Despues de una semana, salio un brote verde de la tierra.',
      ],
      [
        q('q1', 'Que semilla planto Sofia?', 'Una semilla de frijol', [
          'Una semilla de flor',
          'Una semilla de maiz',
          'Una semilla de frijol',
          'Una semilla de manzana',
        ]),
        q('q2', 'Donde puso el vaso?', 'Cerca de una ventana con sol', [
          'Debajo de la cama',
          'En el garaje',
          'Cerca de una ventana con sol',
          'Dentro de una mochila',
        ]),
        q('q3', 'Cuando regaba Sofia la planta?', 'Cada manana', [
          'Cada manana',
          'Solo de noche',
          'Una vez por semana',
          'Nunca',
        ]),
        q('q4', 'Que salio de la tierra despues de una semana?', 'Un brote verde', [
          'Una piedra',
          'Una flor roja',
          'Un arbol grande',
          'Un brote verde',
        ]),
        q('q5', 'Que habia en el vaso con la semilla?', 'Tierra', [
          'Arena',
          'Arroz',
          'Solo agua',
          'Tierra',
        ]),
      ],
    ),
    story(
      'es-tarde-lluvia',
      'Una tarde de lluvia',
      [
        'Llovio toda la tarde, por eso Diego se quedo en casa.',
        'Diego hizo una casita con sabanas en la sala.',
        'Luego, su hermana entro y jugaron un juego de mesa.',
        'Comieron galletas saladas y se rieron cuando Diego movio la ficha equivocada.',
      ],
      [
        q('q1', 'Por que Diego se quedo en casa?', 'Porque llovio toda la tarde', [
          'Porque estaba enfermo',
          'Porque tenia tarea',
          'Porque hacia mucho calor',
          'Porque llovio toda la tarde',
        ]),
        q('q2', 'Que hizo Diego en la sala?', 'Una casita con sabanas', [
          'Una casita con sabanas',
          'Un robot',
          'Un castillo de arena',
          'Un avion de papel',
        ]),
        q('q3', 'Quien jugo con Diego despues?', 'Su hermana', [
          'Su primo',
          'Su vecino',
          'Su maestra',
          'Su hermana',
        ]),
        q('q4', 'Que jugaron?', 'Un juego de mesa', [
          'Baloncesto',
          'Escondidas',
          'Futbol',
          'Un juego de mesa',
        ]),
        q('q5', 'Que comieron mientras jugaban?', 'Galletas saladas', [
          'Pizza',
          'Helado',
          'Galletas saladas',
          'Sopa',
        ]),
      ],
    ),
    story(
      'es-biblioteca-tarjeta',
      'La tarjeta de Lucia',
      [
        'Lucia fue a la biblioteca con su tia el sabado.',
        'Una bibliotecaria ayudo a Lucia a sacar su primera tarjeta.',
        'Lucia llevo dos libros de animales y un libro de chistes.',
        'En casa, leyo el libro de chistes a su hermanito.',
      ],
      [
        q('q1', 'Con quien fue Lucia a la biblioteca?', 'Con su tia', [
          'Con su abuelo',
          'Con su amiga',
          'Con su tia',
          'Con su maestra',
        ]),
        q('q2', 'Que obtuvo Lucia en la biblioteca?', 'Su primera tarjeta', [
          'Un mapa',
          'Un juguete',
          'Una lonchera',
          'Su primera tarjeta',
        ]),
        q('q3', 'Cuantos libros de animales llevo Lucia?', 'Dos', [
          'Uno',
          'Dos',
          'Tres',
          'Cuatro',
        ]),
        q('q4', 'Que otro libro llevo?', 'Un libro de chistes', [
          'Un libro de cocina',
          'Un libro de musica',
          'Un libro de chistes',
          'Un libro de matematicas',
        ]),
        q('q5', 'A quien leyo Lucia en casa?', 'A su hermanito', [
          'A su perro',
          'A su vecina',
          'A su mama',
          'A su hermanito',
        ]),
      ],
    ),
    story(
      'es-mercado-lista',
      'Mateo en el mercado',
      [
        'Mateo y su mama caminaron al mercado de agricultores.',
        'Llevaron una bolsa de tela y una lista corta.',
        'Compraron zanahorias, tomates y maiz dulce.',
        'Mateo cargo el maiz porque era lo mas liviano.',
      ],
      [
        q('q1', 'A donde fue Mateo con su mama?', 'Al mercado de agricultores', [
          'Al cine',
          'Al zoologico',
          'Al mercado de agricultores',
          'A la oficina de correo',
        ]),
        q('q2', 'Que llevaron?', 'Una bolsa de tela y una lista', [
          'Un balon y jugo',
          'Una mochila y pintura',
          'Una bolsa de tela y una lista',
          'Un juguete y una gorra',
        ]),
        q('q3', 'Que compraron?', 'Zanahorias, tomates y maiz', [
          'Manzanas, pan y leche',
          'Zanahorias, tomates y maiz',
          'Arroz, queso y habichuelas',
          'Guineos, uvas y yogur',
        ]),
        q('q4', 'Que cargo Mateo?', 'El maiz', [
          'La bolsa entera',
          'Los tomates',
          'Las zanahorias',
          'El maiz',
        ]),
        q('q5', 'Por que cargo ese producto?', 'Porque era lo mas liviano', [
          'Porque era el mas caro',
          'Porque era muy pesado',
          'Porque era su color favorito',
          'Porque era lo mas liviano',
        ]),
      ],
    ),
    story(
      'es-perro-amable',
      'Un perro amigable',
      [
        'Un perro pequeno y marron esperaba cerca de la puerta de Carla despues de clases.',
        'Carla le dio agua y miro la placa del perro.',
        'La placa tenia un numero de telefono y el nombre Max.',
        'Poco despues, llego el dueno de Max y le dio las gracias a Carla.',
      ],
      [
        q('q1', 'Donde esperaba el perro?', 'Cerca de la puerta de Carla', [
          'En el autobus',
          'En el parque',
          'Dentro de la escuela',
          'Cerca de la puerta de Carla',
        ]),
        q('q2', 'Que le dio Carla al perro?', 'Agua', ['Leche', 'Agua', 'Una manta', 'Un juguete']),
        q('q3', 'Que habia en la placa?', 'Un numero de telefono y el nombre Max', [
          'Una tarea',
          'Un mapa y una llave',
          'Un numero de telefono y el nombre Max',
          'Un boleto de autobus',
        ]),
        q('q4', 'Como se llamaba el perro?', 'Max', ['Rex', 'Luna', 'Max', 'Nube']),
        q('q5', 'Que hizo el dueno cuando llego?', 'Le dio las gracias a Carla', [
          'Le regalo una bicicleta',
          'Se fue sin hablar',
          'Llamo a la policia',
          'Le dio las gracias a Carla',
        ]),
      ],
    ),
    story(
      'es-volcan-ciencia',
      'Dia de ciencia',
      [
        'La clase de Nico hizo un volcan pequeno para el dia de ciencia.',
        'Usaron una botella plastica, barro y papel rojo.',
        'Cuando la maestra echo vinagre y bicarbonato, salio espuma.',
        'Nico aplaudio porque el volcan parecia de verdad.',
      ],
      [
        q('q1', 'Que hizo la clase de Nico?', 'Un volcan pequeno', [
          'Una casa para pajaros',
          'Un robot',
          'Una cometa',
          'Un volcan pequeno',
        ]),
        q('q2', 'Que usaron para dar forma al volcan?', 'Barro', [
          'Hielo',
          'Metal',
          'Barro',
          'Vidrio',
        ]),
        q('q3', 'Que paso cuando la maestra puso los ingredientes?', 'Salio espuma', [
          'No paso nada',
          'Se rompio la botella',
          'Salio espuma',
          'Se convirtio en hielo',
        ]),
        q('q4', 'Que dos ingredientes uso la maestra?', 'Vinagre y bicarbonato', [
          'Agua y sal',
          'Leche y azucar',
          'Jugo y harina',
          'Vinagre y bicarbonato',
        ]),
        q('q5', 'Por que Nico aplaudio?', 'Porque el volcan parecia de verdad', [
          'Porque termino la clase',
          'Porque empezo a llover',
          'Porque encontro un lapiz',
          'Porque el volcan parecia de verdad',
        ]),
      ],
    ),
    story(
      'es-conchas-playa',
      'Conchas en la playa',
      [
        'Elena fue a la playa con sus primos un domingo por la manana.',
        'Caminaron cerca del agua y buscaron conchas.',
        'Elena encontro una con lineas rosadas y otra blanca muy lisa.',
        'Las puso en un cubito pequeno para ensenarselas a su abuela.',
      ],
      [
        q('q1', 'Con quien fue Elena a la playa?', 'Con sus primos', [
          'Con su maestra',
          'Con sus primos',
          'Con su equipo de futbol',
          'Con su tio',
        ]),
        q('q2', 'Que estaban buscando?', 'Conchas', ['Botes', 'Cangrejos', 'Conchas', 'Cometas']),
        q('q3', 'De que color eran las lineas de una concha?', 'Rosadas', [
          'Verdes',
          'Azules',
          'Marrones',
          'Rosadas',
        ]),
        q('q4', 'Donde puso Elena las conchas?', 'En un cubito pequeno', [
          'En un zapato',
          'En la arena',
          'En una lonchera',
          'En un cubito pequeno',
        ]),
        q('q5', 'A quien iba a ensenar las conchas?', 'A su abuela', [
          'A su hermano',
          'A su entrenador',
          'A su abuela',
          'A su vecina',
        ]),
      ],
    ),
    story(
      'es-muneco-nieve',
      'La bufanda del muneco',
      [
        'En una manana fria, Pablo y Nina jugaron afuera en la nieve.',
        'Hicieron un muneco de nieve con nariz de zanahoria y ojos de botones.',
        'Nina puso una bufanda verde alrededor del muneco.',
        'Antes de entrar, Pablo tomo una foto con el telefono de su mama.',
      ],
      [
        q('q1', 'Que hicieron Pablo y Nina?', 'Un muneco de nieve', [
          'Un columpio',
          'Un trineo',
          'Una fortaleza',
          'Un muneco de nieve',
        ]),
        q('q2', 'Que usaron para la nariz?', 'Una zanahoria', [
          'Una zanahoria',
          'Una hoja',
          'Una piedra',
          'Un palo',
        ]),
        q('q3', 'De que color era la bufanda?', 'Verde', [
          'Roja',
          'Verde',
          'Azul',
          'Morada',
        ]),
        q('q4', 'Quien puso la bufanda?', 'Nina', [
          'Pablo',
          'La mama de Pablo',
          'Nina',
          'La maestra',
        ]),
        q('q5', 'Que hizo Pablo antes de entrar?', 'Tomo una foto', [
          'Preparo chocolate',
          'Almorzó',
          'Limpio el patio',
          'Tomo una foto',
        ]),
      ],
    ),
  ],
}

