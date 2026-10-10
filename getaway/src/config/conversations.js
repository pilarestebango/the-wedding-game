// The script for the conversation at the end of each level: the guest talks
// to the character they're playing (Pili or Joe, both as bickering pirates in
// the spirit of Monkey Island) and has to find the right things to say before
// the character gives up one piece of the invitation.
//
//   date     — after level 1: when the getaway is
//   location — after level 2: where it is
//   full     — after the boss: leads into the finale (house + full details)
//
// Every joke lives in this file, so a line can be changed without touching
// any code. Rules the tests check (game/tests/getaway/conversations.test.js):
// three rounds per conversation, three or four options per round, exactly one
// right option, and English and Spanish with the same shape. The Spanish is
// written as its own jokes, not translated word for word — keep it that way,
// but keep the facts identical (13-18 September 2027; Robledo de Chavela,
// direct train to Madrid, 55 minutes; ten places).
//
// Don't invent facts about the house in the jokes (pool, barbecue, number of
// rooms...): guests will believe them.
import { getLang } from '../../../game/src/config/i18n.js';

// One round: the character's `line`, the `right` reply (its answer moves the
// conversation on) placed at position `at` among the `wrong` ones (each gets
// a joke answer and is crossed off).
function round(line, at, right, ...wrong) {
  const options = wrong.map(([text, reply]) => ({ text, reply, correct: false }));
  options.splice(at, 0, { text: right[0], reply: right[1], correct: true });
  return { line, options };
}

const EN = {
  pili: {
    date: [
      round(
        "Ahoy, coin-grabber! Sixty-nine coins, and you only fell into the infinite void a normal amount. On behalf of the crew: thanks. I suppose you want something.",
        1,
        ["Captain Pili! An honour. I come seeking knowledge.", "Ooh, 'Captain'. Keep talking like that and you'll go far. About four more sentences, specifically."],
        ["Hand over the treasure, sea-witch.", "Sea-witch is my mother's title. I'm merely sea-adjacent. Try again, with manners."],
        ["Is Joe around? I'd rather talk to him.", "Joe is busy alphabetising the cannonballs. You get me. Everyone agrees that's the better deal. I asked everyone."],
      ),
      round(
        "Knowledge, eh? I know many things. How to open a coconut with a sword. Why the rum is gone. When a certain secret voyage sets sail...",
        2,
        ["That last one. The voyage. You said it weirdly on purpose.", "Did I? How careless of me. How very, deliberately careless."],
        ["Tell me about the coconut.", "You hit it with the sword. Honestly, I expected a sharper question. Unlike the sword."],
        ["Why IS the rum gone?", "Because it was Tuesday. Next."],
      ),
      round(
        "A secret getaway before the wedding. Mountains. Ten berths only. I could tell you WHEN... if you ask like a proper pirate.",
        0,
        ["Arr. On which tides do we sail, Captain?", "Now THAT is a question. We sail on the 13th of September and drop anchor until the 18th, 2027. Write it on your hand. No, the other hand, that one's for the map."],
        ["WHEN IS IT, WOMAN?", "And THAT is why you're not captain."],
        ["I'll trade you 69 slightly used coins.", "Those are MY coins. You collected them on MY level. That's not a bribe, that's a refund."],
      ),
    ],
    location: [
      round(
        "Look at you, covered in monster. You jumped the little blue ones AND shot the big purple one. Thanks for clearing my lava field. It was getting crowded.",
        0,
        ["All in a day's work for your finest deckhand, Captain.", "Deckhand! Promoted from 'coin-grabber'. Don't let it go to your head, there's a hat shortage."],
        ["It was nothing.", "It was clearly something. You screamed. I heard it from here."],
        ["Those blue ones multiply when you shoot them, you know.", "Yes. It's in the instructions. It's the ONLY thing in the instructions."],
      ),
      round(
        "So you have the WHEN. Now you want the WHERE. I have a map. It is a very good map. I drew the sea monsters myself.",
        2,
        ["A map with no sea means we're headed inland. Mountains?", "...Who told you? Was it Joe? It's always Joe."],
        ["Can I see the sea monsters?", "They're shy. And it's the mountains, there is no sea. I just like drawing them."],
        ["Is it Mars? Please say it's not Mars.", "Mars has terrible wifi and worse tapas. No."],
      ),
      round(
        "Fine, yes, mountains. Near Madrid. I'll give you the name if you can ask without making it weird.",
        1,
        ["Captain, to which port do I point my ship? Or my train?", "Train! Now you're thinking. Robledo de Chavela, up in the sierra. Direct train to Madrid, 55 minutes. Close enough for tapas, far enough that nobody hears the karaoke."],
        ["X marks the spot?", "X marks where I spilled my coffee. Don't dig there. Again."],
        ["Just whisper it. I won't tell the other nine.", "You'd tell all nine before you were off the gangplank. I've seen your group chat."],
      ),
    ],
    full: [
      round(
        "You shot down a warship. In MY sky. Over MY city. ...Thank you, actually. It was blocking the sunset.",
        2,
        ["The skies are yours again, Captain.", "They are, aren't they? Look at them. Gorgeous. I'd salute you, but I'd spill my drink."],
        ["Was that thing insured?", "It's an alien invasion, not a rental car. Although the paperwork is similar."],
        ["Three hearts was not enough hearts.", "Three is the legal maximum. Any more and you'd be an octopus."],
      ),
      round(
        "You know when. You know where. There's one thing left in my treasure chest, and it's the big one.",
        1,
        ["The house. You're going to show me the house.", "Sharp! You've been paying attention. Or guessing. I respect both."],
        ["Is it gold?", "It's better than gold. Gold doesn't come with a view."],
        ["Is it more monsters?", "No. The monsters have unionised. They only work levels one to three."],
      ),
      round(
        "Ten berths. One house. Mountains out of the window. All I need from you is the magic words.",
        0,
        ["Permission to come aboard, Captain?", "PERMISSION GRANTED! Welcome to the crew. Here it is: the whole map, the house, everything. Don't lose it. And don't show it to the monkey."],
        ["Please?", "That's the magic WORD. I said words. Plural. Standards have slipped."],
        ["Open sesame.", "Wrong franchise."],
      ),
    ],
  },
  joe: {
    date: [
      round(
        "Ah. You made it. Sixty-nine coins. I counted them twice, then once more for pleasure. Thank you, truly. Now state your business, I'm in the middle of a nap.",
        2,
        ["Sorry about the nap, mighty pirate. Got a minute?", "'Mighty pirate.' Finally, someone who has read my business card. Go on."],
        ["I demand answers, you scurvy dog!", "Scurvy is a vitamin C deficiency. I had an orange in 2019. Try again."],
        ["Where's Pili? She seems more organised.", "She IS more organised. That's why she's not here talking to you."],
      ),
      round(
        "I know three secrets. One: where I buried my dignity. Two: a recipe for grog that is technically legal. Three: the date of a certain voyage.",
        0,
        ["Number three. Obviously number three.", "Straight to business. You'd make a terrible pirate and an excellent accountant."],
        ["Where's the dignity buried?", "If I knew that, I'd have dug it up before the stag do."],
        ["Grog recipe, please.", "It's mostly lemonade. Don't tell the crew, they think they're very brave."],
      ),
      round(
        "A getaway before the wedding. A house in the mountains. Room for ten. The date is on the tip of my tongue. Next to a bit of orange.",
        1,
        ["Captain Joe, when do we weigh anchor?", "At last, some nautical respect. The 13th to the 18th of September, 2027. Six days. I counted those twice as well."],
        ["Spit it out!", "The orange? No. I'm saving it. Scurvy."],
        ["Look behind you! A three-headed monkey!", "That's Kevin. He's not invited. Nice try."],
      ),
    ],
    location: [
      round(
        "You crossed a lava field and shot a monster the size of a bus. I'd shake your hand, but I'm holding a very important sandwich. Thank you. Sincerely. Mmf.",
        1,
        ["No handshake needed, mighty pirate. A nod will do.", "*nods* That's the most exercise I've done today. You're good at this."],
        ["Can I have some of the sandwich?", "No. This is a load-bearing sandwich."],
        ["You could have helped, you know.", "I did help. I believed in you. From over here. Quietly."],
      ),
      round(
        "You've got the date. Now you'll want directions. I'm excellent at directions. I once found the fridge in the dark.",
        0,
        ["Mountains, then. Which mountains, O finder of fridges?", "The ones next to Madrid. The pointy ones. You'll know them, they're outdoors."],
        ["Which way is north?", "Up. On maps. I don't know about in real life, nobody does."],
        ["Is it far? I get seasick.", "It's in the mountains. If you get seasick up there, something has gone badly wrong with the weather."],
      ),
      round(
        "I have the name written down somewhere. It's either on my hand or on this sandwich.",
        2,
        ["Captain Joe, where shall I tell the train to take me?", "Hand! It was on my hand. Robledo de Chavela. Direct train to Madrid, 55 minutes. I timed it. With a sandwich."],
        ["Check the sandwich.", "...It just says 'ham'. That's not a town. I checked."],
        ["I'll fight you for it. Insults at dawn.", "You fight like a dairy farmer. See? I win. I've been rehearsing that one since 1990."],
      ),
    ],
    full: [
      round(
        "You defeated the warship. I watched the whole thing from behind this barrel. Very brave. Both of us. Thank you.",
        0,
        ["Couldn't have done it without your moral support, mighty pirate.", "It's true. I was supporting extremely hard. I think I've pulled something."],
        ["You hid behind a barrel?", "Tactically. It's a tactical barrel."],
        ["Why did the aliens attack?", "They wanted the wifi password. It's 'password'. They never guessed."],
      ),
      round(
        "So. Date: you have. Place: you have. Only one secret left, and I've been told not to blurt it out. I'm a professional.",
        2,
        ["It's the house, isn't it. You're terrible at this.", "I'm excellent at this. I just happen to also be terrible at it."],
        ["Blurt it out.", "No. ...It has a roof. DAMN. You're good."],
        ["Is it buried treasure?", "I buried some once. Then I forgot where. This one we're keeping above ground."],
      ),
      round(
        "Last step. Say something a real pirate would say and it's yours. The full chart. No pressure.",
        1,
        ["Permission to come aboard, Captain Joe?", "Granted! I've always wanted to say that. Here's everything: the house, the chart, the lot. Welcome to the crew of ten."],
        ["Arr?", "Was that a question? Pirates don't ask 'arr'. They state it. Try again, with confidence."],
        ["Yo ho ho and a bottle of... sparkling water?", "Close. So close. And yet so hydrated."],
      ),
    ],
  },
};

const ES = {
  pili: {
    date: [
      round(
        "¡Ah del barco, cazamonedas! Sesenta y nueve monedas, y solo te has caído al vacío infinito lo normal. En nombre de la tripulación: gracias. Supongo que querrás algo.",
        1,
        ["¡Capitana Pili! Un honor. Vengo en busca de conocimiento.", "Uy, 'Capitana'. Sigue hablando así y llegarás lejos. Unas cuatro frases más, en concreto."],
        ["Suelta el tesoro, bruja de los mares.", "Bruja de los mares es el título de mi madre. Yo soy más de secano. Inténtalo otra vez, con educación."],
        ["¿Está Joe? Prefiero hablar con él.", "Joe está ordenando las balas de cañón por orden alfabético. Te toco yo. Todo el mundo dice que sales ganando. Se lo he preguntado a todo el mundo."],
      ),
      round(
        "Conocimiento, ¿eh? Sé muchas cosas. Cómo abrir un coco con una espada. Por qué se ha acabado el ron. Cuándo zarpa cierta travesía secreta...",
        2,
        ["Lo último. La travesía. Lo has dicho raro aposta.", "¿Yo? Qué descuido. Qué descuido tan cuidadosamente planeado."],
        ["Cuéntame lo del coco.", "Le das con la espada. Esperaba una pregunta más afilada. No como la espada."],
        ["¿Y por qué se ha acabado el ron?", "Porque era martes. Siguiente."],
      ),
      round(
        "Una escapada secreta antes de la boda. Sierra. Solo diez camarotes. Podría decirte CUÁNDO... si lo preguntas como un pirata de verdad.",
        0,
        ["Arrr. ¿Con qué marea zarpamos, Capitana?", "ESO sí es una pregunta. Zarpamos el 13 de septiembre y echamos el ancla hasta el 18, año 2027. Apúntatelo en la mano. No, en la otra, que esa es para el mapa."],
        ["¿¡CUÁNDO ES, MUJER!?", "Y por ESO no te han dado el mando."],
        ["Te cambio 69 monedas poco usadas.", "Esas monedas son MÍAS. Las has cogido en MI nivel. Eso no es un soborno, es una devolución."],
      ),
    ],
    location: [
      round(
        "Mírate, con monstruo hasta en las cejas. Has saltado a los azulitos Y has tumbado al morado gigante. Gracias por despejarme el campo de lava. Se estaba llenando de gente.",
        0,
        ["Gajes del oficio para su mejor grumete, Capitana.", "¡Grumete! Todo un ascenso desde 'cazamonedas'. Que no se te suba a la cabeza, que andamos cortos de sombreros."],
        ["No ha sido nada.", "Claramente ha sido algo. Has gritado. Se ha oído desde aquí."],
        ["Oye, que los azules se duplican si les disparas.", "Sí. Viene en las instrucciones. Es LO ÚNICO que viene en las instrucciones."],
      ),
      round(
        "Ya tienes el CUÁNDO. Ahora quieres el DÓNDE. Tengo un mapa. Es un mapa buenísimo. Los monstruos marinos los he dibujado yo.",
        2,
        ["Un mapa sin mar es que vamos tierra adentro. ¿Sierra?", "...¿Quién te lo ha dicho? ¿Ha sido Joe? Siempre es Joe."],
        ["¿Puedo ver los monstruos marinos?", "Son tímidos. Y es la sierra, no hay mar. Es que me gusta dibujarlos."],
        ["¿Es Marte? Dime que no es Marte.", "En Marte hay muy mala cobertura y peores tapas. No."],
      ),
      round(
        "Vale, sí, sierra. Cerca de Madrid. Te doy el nombre si consigues preguntarlo sin que quede raro.",
        1,
        ["Capitana, ¿a qué puerto apunto mi barco? ¿O mi tren?", "¡Tren! Ahí le has dado. Robledo de Chavela, en plena sierra. Tren directo a Madrid, 55 minutos. Lo bastante cerca para unas tapas, lo bastante lejos para que nadie oiga el karaoke."],
        ["¿La X marca el lugar?", "La X marca donde se me cayó el café. No caves ahí. Otra vez."],
        ["Dímelo al oído. No se lo cuento a los otros nueve.", "Se lo contarías a los nueve antes de bajar la pasarela. He visto vuestro grupo de WhatsApp."],
      ),
    ],
    full: [
      round(
        "Has derribado una nave de guerra. En MI cielo. Sobre MI ciudad. ...Gracias, la verdad. Me tapaba el atardecer.",
        2,
        ["Los cielos vuelven a ser suyos, Capitana.", "¿A que sí? Míralos. Preciosos. Te haría el saludo, pero se me cae la copa."],
        ["¿Eso tenía seguro?", "Es una invasión alienígena, no un coche de alquiler. Aunque el papeleo se parece."],
        ["Tres corazones no son suficientes corazones.", "Tres es el máximo legal. Con más ya serías un pulpo."],
      ),
      round(
        "Sabes cuándo. Sabes dónde. Queda una cosa en mi cofre del tesoro, y es la gorda.",
        1,
        ["La casa. Me vas a enseñar la casa.", "¡Qué vista! Has estado prestando atención. O adivinando. Respeto las dos cosas."],
        ["¿Es oro?", "Es mejor que el oro. El oro no tiene vistas."],
        ["¿Son más monstruos?", "No. Los monstruos se han sindicado. Solo trabajan del nivel uno al tres."],
      ),
      round(
        "Diez camarotes. Una casa. La sierra por la ventana. Solo necesito que digas las palabras mágicas.",
        0,
        ["¿Permiso para subir a bordo, Capitana?", "¡PERMISO CONCEDIDO! La tripulación te da la bienvenida. Aquí lo tienes: el mapa entero, la casa, todo. No lo pierdas. Y no se lo enseñes al mono."],
        ["¿Por favor?", "Eso es la PALABRA mágica. He dicho palabras. En plural. Se han perdido los modales."],
        ["Ábrete, sésamo.", "Te has equivocado de cuento."],
      ),
    ],
  },
  joe: {
    date: [
      round(
        "Ah. Lo has conseguido. Sesenta y nueve monedas. Las he contado dos veces, y una tercera por gusto. Gracias, de verdad. Ahora dime a qué vienes, que estaba en plena siesta.",
        2,
        ["Perdona la siesta, temible pirata. ¿Tienes un minuto?", "'Temible pirata'. Por fin alguien que se ha leído mi tarjeta de visita. Sigue."],
        ["¡Exijo respuestas, perro con escorbuto!", "El escorbuto es falta de vitamina C. Me comí una naranja en 2019. Otra vez."],
        ["¿Y Pili? Parece más organizada.", "ES más organizada. Por eso no está aquí hablando contigo."],
      ),
      round(
        "Sé tres secretos. Uno: dónde enterré mi dignidad. Dos: una receta de grog que es técnicamente legal. Tres: la fecha de cierta travesía.",
        0,
        ["El tres. Evidentemente el tres.", "Directo al grano. Harías fatal de pirata y de maravilla llevando las cuentas."],
        ["¿Dónde está enterrada la dignidad?", "Si lo supiera, la habría desenterrado antes de la despedida de soltero."],
        ["La receta del grog, por favor.", "Es casi todo gaseosa. No se lo digas a la tripulación, se creen muy valientes."],
      ),
      round(
        "Una escapada antes de la boda. Una casa en la sierra. Sitio para diez. Tengo la fecha en la punta de la lengua. Al lado de un trocito de naranja.",
        1,
        ["Capitán Joe, ¿cuándo levamos anclas?", "Por fin, un poco de respeto náutico. Del 13 al 18 de septiembre de 2027. Seis días. Esos también los he contado dos veces."],
        ["¡Suéltalo ya!", "¿La naranja? No. Me la guardo. Por el escorbuto."],
        ["¡Mira detrás de ti! ¡Un mono de tres cabezas!", "Es Kevin. No está invitado. Buen intento."],
      ),
    ],
    location: [
      round(
        "Has cruzado un campo de lava y has tumbado a un monstruo del tamaño de un autobús. Te daría la mano, pero estoy sujetando un bocadillo muy importante. Gracias. De corazón. Mmf.",
        1,
        ["Sin apretón, temible pirata. Con un gesto me vale.", "*asiente* Es el mayor ejercicio que he hecho hoy. Se te da bien esto."],
        ["¿Me das un poco de bocadillo?", "No. Es un bocadillo estructural."],
        ["Podías haber ayudado, ¿eh?", "He ayudado. He creído en ti. Desde aquí. En silencio."],
      ),
      round(
        "Ya tienes la fecha. Ahora querrás indicaciones. Soy buenísimo con las indicaciones. Una vez encontré la nevera a oscuras.",
        0,
        ["Sierra, entonces. ¿Qué sierra, oh descubridor de neveras?", "La que está al lado de Madrid. La de los picos. La reconocerás, está al aire libre."],
        ["¿Hacia dónde queda el norte?", "Arriba. En los mapas. En la vida real no lo sé, no lo sabe nadie."],
        ["¿Está lejos? Es que me mareo en barco.", "Está en la sierra. Si te mareas en barco allí arriba, es que ha pasado algo muy gordo con el tiempo."],
      ),
      round(
        "Tengo el nombre apuntado en algún sitio. O en la mano o en este bocadillo.",
        2,
        ["Capitán Joe, ¿a dónde le digo al tren que me lleve?", "¡La mano! Estaba en la mano. Robledo de Chavela. Tren directo a Madrid, 55 minutos. Lo he cronometrado. Con un bocadillo."],
        ["Mira en el bocadillo.", "...Solo pone 'jamón'. Eso no es un pueblo. Lo he comprobado."],
        ["Te lo disputo. Duelo de insultos al amanecer.", "Peleas como un granjero. ¿Ves? Gano yo. Llevo ensayando esa desde 1990."],
      ),
    ],
    full: [
      round(
        "Has vencido a la nave. Lo he visto todo desde detrás de este barril. Qué valor. El de los dos. Gracias.",
        0,
        ["Sin tu apoyo moral no habría podido, temible pirata.", "Es verdad. Estaba apoyando fortísimo. Creo que me ha dado un tirón."],
        ["¿Te has escondido detrás de un barril?", "Tácticamente. Es un barril táctico."],
        ["¿Por qué atacaban los alienígenas?", "Querían la contraseña del wifi. Es 'contraseña'. No la adivinaron."],
      ),
      round(
        "A ver. Fecha: la tienes. Lugar: lo tienes. Queda un secreto, y me han dicho que no lo suelte de golpe. Soy un profesional.",
        2,
        ["Es la casa, ¿a que sí? Se te da fatal esto.", "Se me da estupendamente. Lo que pasa es que además se me da fatal."],
        ["Suéltalo de golpe.", "No. ...Tiene tejado. ¡CACHIS! Qué bien se te da."],
        ["¿Es un tesoro enterrado?", "Enterré uno una vez. Luego se me olvidó dónde. Este lo dejamos en la superficie."],
      ),
      round(
        "Último paso. Di algo que diría un pirata de verdad y es tuyo. La carta de navegación entera. Sin presión.",
        1,
        ["¿Permiso para subir a bordo, Capitán Joe?", "¡Concedido! Siempre he querido decir eso. Aquí va todo: la casa, la carta, el lote completo. Te damos la bienvenida a la tripulación de los diez."],
        ["¿Arrr?", "¿Eso era una pregunta? Los piratas no preguntan 'arrr'. Lo afirman. Otra vez, con seguridad."],
        ["Yo, jo, jo y una botella de... ¿agua con gas?", "Casi. Casi. Y sin embargo, qué hidratación."],
      ),
    ],
  },
};

export const CONVERSATIONS = { en: EN, es: ES };
export const CONVERSATION_STEPS = ['date', 'location', 'full'];

// The rounds for `char` talking about `step`, in the current language.
export function getConversation(char, step, lang = getLang()) {
  const script = CONVERSATIONS[lang] ?? CONVERSATIONS.en;
  return (script[char] ?? script.pili)[step];
}
