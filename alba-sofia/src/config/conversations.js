// The script for the conversation at the end of each level: the guest (Sofia
// or Alba, both nine) talks to whoever was waiting at the end of it — Auntie
// Pili after level 1, Uncle Joe after level 2, the two of them after the boss
// — and has to find the right thing to say before they tell her what comes
// next in the adventure. Pili and Joe are galactic pirates: she is the bossy
// captain of the starship Stinky Sock, he is "the bravest pirate in the
// galaxy" and scared of everything.
//
//   date     — after level 1, with Pili: what to do on Mars (level 2)
//   location — after level 2, with Joe: how to beat the warship (the boss)
//   full     — after the boss, with both: the reward (a place in the crew), then the end screen
//
// (The step names are the getaway's, which this game was copied from; here
// nothing is said about the getaway itself.)
//
// Every joke lives in this file, so a line can be changed without touching
// any code. Rules the tests check (game/tests/alba-sofia/conversations.test.js):
// three rounds per conversation, three or four options per round, exactly one
// right option, and English and Spanish with the same shape. The Spanish is
// written as its own jokes, not translated word for word — keep it that way,
// but keep the instructions identical and true to the levels (hop the lava
// on the rocks, jump the small blue monsters because shooting splits them,
// shoot the big red ones and the giant; shoot up at the warship, dodge, three
// hearts).
//
// It is written for nine-year-olds: silly, never mean, nothing scary, and
// nobody gets hurt (the alien captain lands in jelly).
import { getLang } from '../../../game/src/config/i18n.js';

// Who is talking in each conversation. Where there are two, every line and
// answer in the script says whose it is, with pili() / joe() below.
export const SPEAKERS = { date: ['pili'], location: ['joe'], full: ['pili', 'joe'] };

const pili = (text) => ({ who: 'pili', text });
const joe = (text) => ({ who: 'joe', text });
const said = (line) => (typeof line === 'string' ? { text: line } : line);

// One round: the host's `line`, the `right` reply (its answer moves the
// conversation on) placed at position `at` among the `wrong` ones (each gets
// a joke answer and is crossed off). `who` (on the round for its line, on an
// option for its answer) is only set in a two-host conversation.
function round(line, at, right, ...wrong) {
  const option = ([text, reply], correct) => ({ text, reply: said(reply).text, who: said(reply).who, correct });
  const options = wrong.map((w) => option(w, false));
  options.splice(at, 0, option(right, true));
  return { line: said(line).text, who: said(line).who, options };
}

const EN = {
  date: [
    round(
      "Shiver me space-socks! 73 coins! Thank you, cadet. I am Auntie Pili, Terror of the Milky Way, Captain of the starship Stinky Sock. You may bow.",
      1,
      ["Captain Auntie Pili! *bows so low her nose touches the moon*", "Perfect bow. Ten out of ten. You have moon dust on your nose now, but that's the pirate look."],
      ["Why is your ship called the Stinky Sock?", "Because Uncle Joe named it. After his sock. We can't find it, but we can ALWAYS smell it."],
      ["Can I keep the coins?", "No. Those are for my space parrot. He eats nine a day and then sings in three languages."],
    ),
    round(
      "Now listen, cadet. Your next mission is on a planet. A red one. Hot. Smells a bit like burnt toast. Can you guess which?",
      2,
      ["Mars!", "MARS! Correct! You're so clever I'm slightly scared of you."],
      ["Planet Broccoli?", "Ugh, no. Nobody goes to Planet Broccoli. Not even the broccoli."],
      ["The Sun?", "The Sun is not a planet, and also your shoes would melt. Then your socks. Then we'd have TWO stinky sock problems."],
    ),
    round(
      "Mars is full of lava and monsters. I have top-secret pirate advice for it. But I only give it to cadets who ask in proper pirate.",
      0,
      ["Arrr! Tell me the secret, Captain Auntie!", "ARRR! Hop over the lava on the rocks. JUMP the little blue monsters: shoot one and it turns into two! Shoot the big red ones. And at the end waits a GIANT. Shoot it lots!"],
      ["Pretty please with a cherry on top?", "That's proper PRINCESS, not proper pirate. Nice try. I'm keeping the cherry though."],
      ["Meow?", "That's cat. I speak cat, and what you just said was very rude."],
    ),
  ],
  location: [
    round(
      "You... you beat the GIANT? Thank you! I am Uncle Joe, the bravest pirate in the galaxy. I was not hiding behind this rock. I was guarding it.",
      1,
      ["You guarded that rock very bravely, Uncle Joe.", "Thank you. Nobody stole it. Not one single monster. That's a 100% rock-saving record."],
      ["I saw you hiding. You were shaking.", "That was a dance. It's called the Wobbly Jellyfish. Very popular on Jupiter."],
      ["Did you scream when the giant came?", "That was not a scream. That was my battle song. It just happens to be very high and very long."],
    ),
    round(
      "Bad news, cadet. There's one enemy left. Something big, mean and beepy. Guess where it is.",
      0,
      ["Up in the sky?", "Yes! A huge warship, right above our heads. I'd point at it, but pointing is rude and also I'm scared."],
      ["In your sandwich?", "*checks sandwich* No. Just cheese. And one very small alien. Hello, Kevin."],
      ["Behind you!", "AAAAH! ...Not funny. I jumped so high I banged my head on a moon."],
    ),
    round(
      "I know exactly how to beat it. I wrote the plan on my hand. Then I washed my hands, because Auntie Pili said so. But I remember most of it!",
      2,
      ["Tell me the plan, brave Uncle Joe!", "BRAVE! She called me brave! OK: it flies over your head, so shoot UP. Dodge everything it drops. You have 3 hearts, so don't lose them. I'll cheer from behind my rock."],
      ["Can't you fight it instead?", "I would, but I have a note from my mum. It says: 'Joe can't fight warships today, he has a tummy ache.'"],
      ["Let's just run away.", "I LOVE that plan. It's my favourite plan. But Auntie Pili says no. And she's the scary one."],
    ),
  ],
  full: [
    round(
      pili("You blew up the warship! Thank you, cadet! The galaxy is safe! Uncle Joe watched the whole thing from inside a barrel."),
      2,
      ["We did it together, Captains! Both of you!", joe("BOTH of us! Did you hear that, Pili? I helped! I'm a captain too! I'm telling the space parrot.")],
      ["Why were you in a barrel, Uncle Joe?", joe("It's a battle barrel. Very advanced. It also has snacks in it.")],
      ["Is the alien captain OK?", pili("He's fine. He landed in a pool of space jelly. He's cross, he's sticky, and he's going home to his mum.")],
    ),
    round(
      joe("Now you get your reward. Auntie Pili told me not to tell you what it is. I am VERY good at secrets."),
      0,
      ["Is it a pirate treasure?", pili("Almost! It's better than treasure. You can't eat it, wear it or spend it. It's a place in our crew.")],
      ["Tell me, Uncle Joe!", joe("No. My lips are sealed. ...It rhymes with 'pirate'. Because it IS 'pirate'. OH NO. Blast my big mouth!")],
      ["Is it Uncle Joe's lost sock?", pili("No. Nobody deserves that. That sock is in space jail.")],
    ),
    round(
      pili("Real space pirates only let you join the crew if you say the magic pirate words. Go on."),
      1,
      ["Permission to join the crew, Captains?", joe("GRANTED! I've always wanted to shout that! Welcome aboard, cadet. You're an official galactic pirate now, like us. But braver than me.")],
      ["Abracadabra!", pili("That's wizard. Wrong job. Wizards get a hat, pirates get a parrot. You chose parrot.")],
      ["Gimme gimme gimme!", joe("That's what I say at breakfast. It doesn't work then either.")],
    ),
  ],
};

const ES = {
  date: [
    round(
      "¡Rayos y centellas espaciales! ¡73 monedas! Gracias, grumete. Soy la tía Pili, el Terror de la Vía Láctea, capitana de la nave Calcetín Apestoso. Puedes hacer una reverencia.",
      1,
      ["¡Capitana tía Pili! *hace una reverencia hasta tocar la luna con la nariz*", "Reverencia perfecta. Un diez. Te has puesto perdida de polvo de luna, pero eso es muy de pirata."],
      ["¿Por qué tu nave se llama Calcetín Apestoso?", "Porque el nombre se lo puso el tío Joe. Por su calcetín. No lo encontramos, pero SIEMPRE lo olemos."],
      ["¿Me puedo quedar las monedas?", "No. Son para mi loro espacial. Se come nueve al día y luego canta en tres idiomas."],
    ),
    round(
      "Escucha bien, grumete. Tu siguiente misión es en un planeta. Rojo. Caliente. Huele un poco a tostada quemada. ¿Adivinas cuál?",
      2,
      ["¡Marte!", "¡MARTE! ¡Correcto! Eres tan lista que me das un poco de miedo."],
      ["¿El planeta Brócoli?", "Puaj, no. Al planeta Brócoli no va nadie. Ni el brócoli."],
      ["¿El Sol?", "El Sol no es un planeta, y además se te derretirían las zapatillas. Y luego los calcetines. Y ya tendríamos DOS problemas de calcetines apestosos."],
    ),
    round(
      "Marte está lleno de lava y de monstruos. Tengo un consejo pirata supersecreto. Pero solo se lo doy a quien me lo pida en pirata de verdad.",
      0,
      ["¡Arrr! ¡Cuéntame el secreto, capitana tía!", "¡ARRR! Cruza la lava saltando por las rocas. A los azules pequeños, SÁLTALOS: si les disparas, ¡se vuelven dos! A los rojos grandes, dispárales. Y al final hay un GIGANTE. ¡Dispárale mucho!"],
      ["¿Porfa, porfa, porfi?", "Eso es idioma princesa, no idioma pirata. Buen intento. Pero el porfi me lo quedo."],
      ["¿Miau?", "Eso es gato. Yo hablo gato, y lo que acabas de decir es una grosería."],
    ),
  ],
  location: [
    round(
      "¿Has... has vencido al GIGANTE? ¡Gracias! Soy el tío Joe, el pirata más valiente de la galaxia. No estaba escondido detrás de esta roca. La estaba vigilando.",
      1,
      ["Has vigilado esa roca con mucho valor, tío Joe.", "Gracias. No la ha robado nadie. Ni un solo monstruo. Cien por cien de rocas salvadas."],
      ["Te he visto escondido. Estabas temblando.", "Eso era un baile. Se llama la Medusa Temblona. Está muy de moda en Júpiter."],
      ["¿Has gritado cuando ha salido el gigante?", "Eso no era un grito. Era mi canción de batalla. Lo que pasa es que es muy aguda y muy larga."],
    ),
    round(
      "Malas noticias, grumete. Queda un enemigo. Grande, malo y que pita todo el rato. A ver si adivinas dónde está.",
      0,
      ["¿Arriba, en el cielo?", "¡Sí! Una nave de guerra enorme, justo encima de nuestras cabezas. La señalaría, pero señalar es de mala educación y además me da miedo."],
      ["¿En tu bocadillo?", "*mira el bocadillo* No. Solo queso. Y un extraterrestre pequeñito. Hola, Paco."],
      ["¡Detrás de ti!", "¡AAAAH! ...No tiene gracia. He saltado tanto que me he dado un coscorrón con una luna."],
    ),
    round(
      "Sé perfectamente cómo vencerla. Me apunté el plan en la mano. Luego me lavé las manos, porque lo dijo la tía Pili. ¡Pero me acuerdo de casi todo!",
      2,
      ["¡Cuéntame el plan, valiente tío Joe!", "¡VALIENTE! ¡Me ha llamado valiente! Vale: vuela por encima de ti, así que dispara hacia ARRIBA. Esquiva lo que suelte. Tienes 3 corazones: ¡cuídalos! Yo te animo desde mi roca."],
      ["¿Y no puedes luchar tú?", "Lo haría, pero tengo una nota de mi madre. Pone: 'Joe hoy no puede luchar contra naves, le duele la tripa'."],
      ["Mejor salimos corriendo.", "ME ENCANTA ese plan. Es mi plan favorito. Pero la tía Pili dice que no. Y ella sí que da miedo."],
    ),
  ],
  full: [
    round(
      pili("¡Has reventado la nave de guerra! ¡Gracias, grumete! ¡La galaxia está a salvo! El tío Joe lo ha visto todo desde dentro de un barril."),
      2,
      ["¡Lo hemos conseguido juntos, capitanes! ¡Los dos!", joe("¡Los DOS! ¿Lo has oído, Pili? ¡He ayudado! ¡Yo también soy capitán! Se lo voy a contar al loro espacial.")],
      ["¿Qué hacías en un barril, tío Joe?", joe("Es un barril de combate. Muy moderno. Además tiene merienda dentro.")],
      ["¿El capitán extraterrestre está bien?", pili("Perfectamente. Ha caído en una piscina de gelatina espacial. Está enfadado, pegajoso y se va a casa con su mamá.")],
    ),
    round(
      joe("Ahora te toca tu premio. La tía Pili me ha dicho que no te diga qué es. Guardo los secretos FENOMENAL."),
      0,
      ["¿Es un tesoro pirata?", pili("¡Casi! Es mejor que un tesoro. No se come, ni se pone, ni se gasta. Es un puesto en nuestra tripulación.")],
      ["¡Dímelo, tío Joe!", joe("No. Soy una tumba. ...Rima con 'pirata'. Porque ES 'pirata'. ¡OH, NO! ¡Mecachis en mi bocaza!")],
      ["¿Es el calcetín perdido del tío Joe?", pili("No. Eso no se lo merece nadie. Ese calcetín está en la cárcel espacial.")],
    ),
    round(
      pili("Los piratas espaciales de verdad solo dejan entrar en la tripulación a quien dice las palabras mágicas piratas. Venga."),
      1,
      ["¿Permiso para unirme a la tripulación, capitanes?", joe("¡CONCEDIDO! ¡Siempre he querido gritar eso! Bienvenida a bordo, grumete. Ya eres pirata galáctica oficial, como nosotros. Pero más valiente que yo.")],
      ["¡Abracadabra!", pili("Eso es de mago. Te has equivocado de trabajo. A los magos les dan un gorro; a los piratas, un loro. Tú elegiste loro.")],
      ["¡Dame, dame, dame!", joe("Eso digo yo en el desayuno. Tampoco funciona.")],
    ),
  ],
};

export const CONVERSATIONS = { en: EN, es: ES };
export const CONVERSATION_STEPS = ['date', 'location', 'full'];

// The rounds of the `step` conversation, in the current language.
export function getConversation(step, lang = getLang()) {
  return (CONVERSATIONS[lang] ?? CONVERSATIONS.en)[step];
}
