# Madhuban

# 25 sep

jai ram. My hypothesis here is to make elements a lot of them. A class to make borders - containing all that can be variable in it. Then defining functions to exactly draw them where I want to right. Classes for sun, eyes, leafs, faces. To "fill up space" like bharni to fill up space. All theres a lot of detail here. For example - the difference between krishna and a gopi comes from there accessories only in this artform. A border/line everywhere. What I would love to do is to break boundaries, let it not become mechanical. Let composition just flow through. Open borders, or recursive borders. TO ye sahi h na, can be a daily sketching practise too. Only if I actually sit down and do it. I am going to ofcourse.

Accha linear algebra or AI essentially checks for patterns - which word comes next/before to which one mostly - and predicts again and again to think what they need to find next. Then AI images I believe also work in the same way, it basically abstracts it to some degree which allows us to actually see what is the essence and then bring upon wwhat we ask from it. Can something simillar happen here? Training a neural net on not the images but the code output? No traing in on images, asking it to clasify imamges elements into something and assign our coded elements to those categories. And then ask what it can make?

I should don something? Yes. Kya krna h ye batao QC or mithila. ye krenge - what exactly - I just need to get started baaki sab will follow naturaaly. Lets make borders first of all.

A border class needs to do what? Handle making the border ofc - 1. around a frame, 2. Around a given primitive shape, 3. around any polygon 4. with beginshape/endshape. Also we dont think that we need to define what even is hatching not this, this I will pick from p5brush. But we need to actually call these modularly where needed.

i can actually design a lot of elements and let them grow make stories.

Ek baar we should have without any extra class? Matlab what is a border, around a box? Draw two line, check how to enclose hatching inside an enclosed shape. Got to draw double brush lines great, can hatch them pretty easily too if it was an enclosed shape. Checking the og source code tells me that for hatching its somehow calculatiing the bounding box by taking miniu and maximum xy coords. So all it needs is bounding boxes, whichever it finds, it will simply apply on it Our draw double line just draws two lines, by definition its not an enclosed sphere. With this tho, I find out that we dont actually need to do anything to the hatching method - right now. No always actually - for more complex borders? Where theres circles, stars and whatnot in the border, there inner shapes will need hatching too. So copounding one inside another function hone wala bhi. But not disturbing each other. So now, what should I do?

Somehow make the double lines an enclosed space. Instead of worrying about hatching in open space, Work on adding new smaller shapes fit into the two border lines - then we can simply hatch anything that we need. Because even only borders should have atleast 6 variables for them to be interesting and organic. I think then I can safely remove the current hatching function. Kaafi heavy - close h hum. right now its taking global position instead of local, inside the draw lines, fuck knows why.

Lets just do it on a single one first, atomic. A border can be a brush? Like a string, jaha jaha string jaata jaega waha pe it flows, like a spline. Organic natural - curved. It has to be solved from inside out - dividing a line into parts and then placing something in it doesnt make sense. A line is a collection of points, I should be able to make arrays out of any line I choose to draw, and access any nth element, to color/shape/hatch any way I want. and should be able to control density - different from size. Khaana khaake aata.

# 26 sep

Should I sit down and write? That is what I want to do in essence, aur wahi to krra hu ab m, thats right. Lessgo. First sips lmao nice. Bajne do ye rock chal rha h to, are you sure? yes I have sit down and started doing the work Dvaitama sukhama. Ok

I have got two lines, and points correctly calculating, if this works I'll move to expereimenting with different border paths and see. Got it working on a n length straight line! 20 min wall staring break. Wall staring break turned into a nap of 1 hour, then wasted 30mins or so scrolling porn. Now sitting again here and have to remind myself to preserve the energy. And not waste it worthlessly on pixel. make pixels. How to decouple shapes from here too? are circl , squares, triangle also part of head, sun shapes? no idea - but yes they combine to make them right? I can then later have same sun's eyes color as my border circle maybe. Atomic. What is more important abhi tho? To get this to work on a curve, let me first try a diagonal - diagonal worked, points in an array worked.

for closed loops and shapes, approach will be different.ek middle line segment chahiye, jisme min/add some offset on both side to create inner and outer border. Then also figure out corners etc. Also what would be cool is non parallel borders, that means they might contract at a point - and the size of elements inside also decrease with it. Ye alag hi kuch crazy shit h. I am convinced that wo ek single line wala idea is different from our current implementation but hojaega wo bhi figure out with time. Good work so far. Daamn

# 27 sep

inside out approach, thought about a string. Right now our approach is to draw the border lines first and then accomodate shapes between the two parallel lines space, right? Yes. Imagine a string which can be open, closed, loop, angular - whatever. This string has beads - in the form of our shapes - whatever we want to have - their sizes, density, spacing, indexes we can control. That means as beads I should be able to make patterns out of three shapes I have. 1-2-1 or whatever. Also change individual bead sizes. Ideally I am thinking of making size presets for these beads. These beads are placed such that the string passes through their center. Connecting lines parallel to the string on both sides, touching the beads as tangent makes a border. This can be a general model for all the things I want to make in madhuban. Strings can be arranged in any shape I want, overlapping, intersecting if needs to - enclosing spaces, making frames to fill.

We calculate some border width on both sides - inner and outer, dont know what changed,

mahan ganitagya, best light for your keyborad is what, will see later. Wifi bkchodi krra h. 2.5 ghanta alag hi time pass krlia 2 coffee peeke lmao. Wow ek gradient laga dia h ispe ab. Kaam shuru krdega to hojaga

In my new string bead model - even closed loops are working fine, atleast the border lines. Now figure out what happened to the beads.

# 28 sep

Write, Goodmorning. Where were we, and where are we going. Hello, how are you? Mai to mast, aap batao kese ho, Mai bhi mast. Fuck yeah. I got the beads working, lessgo. Now what. Lets see first where wer are right now. I have any string, it can even enclose, and I can then draw any bead shapes inside it, control there size and spacing explicitly. Do we need to keep them explicit? or they should adaptive of the space them find themselves around in. border se beads honge, ya beads se border ye batao? About size, this question is about size right now. I think pehle border width comes, the shape should take upn that size. mai jaha hu, mujhe aage jaana h, not get distracted. Ok, size bhi krdia sort now what? k bead is a concept and idea that describes a position, size etc. We need a seperate shape class that will handle and individual shape and draw it with whatever styling necessary - what if we want two separate hatching styles on circle, square, circle border, different angle etc. daamn. Then we need path makers - random walker strings that fill the canvas like snakes, makes lines automatically - connecting, merging or not intersecting with each other. Just that is a big unlock. Ok abhi by nature our lines and borders are very angular, I should get to choose where I want straight ruled borders, and where flowlines and this decision would be taken at the time of initializing a border.

i am realizing slowly slowly how much work this is going to take but i am glad I get to do this. This will be an unreal project truly.

Next is to

- access beads individually and in patterns
- A bead class - with all necessary info bout a shape - position, size, angle
- A Shape class - Shape, color, brush
- Path makers
- More work on converting points to paths - should figurwe out curved shapes.

kaam shuru krne ka mtlb hota h likhna shuru krna? yes likhte rho,, automatically healing starts.

# 1 oct

Wow, we have now entered october, that is fucking crazy, kitna lamba samay tha, 10 mahine hogye bhai. Of this year, that is really crazy. Music to kuch badhiya, aisa hi chahiye kya? Kesa planet caravan. Coffee beats. is what I needed. So where are we, we need to get to the track again now. Two things madhubani is - repetition and filling the space. Kachni bharni. Bilkul theek baat h ye hai na, haa ekdum sahi baat. Beech m kirti bhi seekhti thi madhubani na, h na. Mummy ko bhi kal bhot accha laga tha dekh ke, lessgo. Authentic to banaenge bilkul. What we have right now is a class that lets me apply a custom border on any given line/spline. We would also need a class that creates those splines - stores them as object, with all of their properties and can call the relevant functions and classes. So a single bottom to top approach would be - having a path maker, any path is just points, the path can be straight line, curves or closed loops and based on what that path should be, the relevant function can be called and this path object can have a property equal to it. We will have several paths then. Each known as p1,p2 maybe and of different sizes, shapes, and properties. Some of them forms border, some form areas to be filled, some gets converted to other elements such as tree branches or waves.

All these paths, may or may not intersect or overlap, but should give ample space to each other to grow and find their own space. These paths find there space and fill the composition space in pre defined forms, keep in mind I am saying forms and not anything else particularly. Imagine a rectangle, subdivided into a few frames, irregular grids, each of these frames can then unevenly/randomly get divided into more if needed. That is a form. Now all these frames can have separate borders, and the space between them can be filled with various elements. Another form can be with organic closed loops or knots even. Fuck yeah. Knots Damn. Our path maker class have to do what - 1. make frames, 2. Lines, curved and straight, 3. Knots, mobius strips. That way i will cover every type. This path maker is the broadest part of the whole architecture.

> Knots exploration
> The number of times lines intersect in a knot is called its crossing. Incrasing the crossing increase the complexity. Able to draw path segments as knots. I have now a way to draw knots and store them as knotPoints in an array - that path I should be able to do bordering on. Lets try and see, I am pretty sue the intersections wont be solved yet but lets see what happens. it fucking WORKED!!! not the intersections ofcourse, yet but the knots work. A knot is also just a part of a larger pathmaker class, ok!

this pathmaker is capable of making paths - of different kinds, but its main power is to compose these paths in a bigger whole, while nothing overlaps, or intersects. Even if they do overlap or intersect, having the power to let a path go over or under another at that particular point is important.

what else I am discovering in my knots?

- Knot class has 3 parameters -
  - crossings - the number of points a knot intersects at, - size - size radius of the whole knot,
  - resolution - smoothness of curve.
    - 0.01 gives complete curves.
    - 0.1<0.3 gives angular
    - 0.5< always gives sharp angled triangulars

# 2 oct

Happy bapu birthday. Lets go, lets start working lessgo. Call aya tha devang chirgu ka, that was nice. Accha hi lagta h, mazaa hi aata h, true ekdum. I bought them a preamp, and audio interface yesterday. Mazaa aajaega, ab proper films banegi. Fir uska wo apni film m bhi to kaam aaega na, haa true ekdum. Steven Scarver we are listening right now. Beats to hink to these are. Weseto sun skte h nusrat wgera bhi, mann to wahi krra h. Lessgo gulabi sapera nice nice. Beats to think to we need ofcourse, ek gaana nusrat ka to chahiye hi chahiye. Chai bhi peeli ab. Father bronques said in an email yesterday that you as an artist should know when to stop working on something and just get back to it, how to start figured out rehna chahiye. Kya kre ye batao, dont get distracted by words. Ok we have to just figure out intersections, and overlap jab tk nusrat j gaarhe h you have a window of oppurtunity to get the thinking right, kal uch kia to tha hi, kya kia tha wo dekhlete h. Path maker makes path - right now just of knot variety, but if it can make that, it can make anything. Border class makes a border on any given path, even on knots, to it will work on frames, lines, curves too. So the intersection/overlap handling has to be a property of a border, if two border objects intersect, it should work then too. Also wait, from that one thing that came to mind is that, if we are storing interesection points, are we storing them as an object inside a border, or should we do that universally? Kyuki socho, theres a border object 1, it knows at what point its path intersect or overlap with itself, but it should know which path object is intersecting with which one right? Tab hi to over ya under jaega na. Haa true, now lets check the logic abhi applied to see, So intersection point can be an object too - with knowledge about the point, and which paths intersect, and then which goes over and under what.

# 3 oct

Ek hi paragraph m ho jaata h sab kya wow wow nice. i am already a little distracted right? Soch rha hu about scoring, 2500 lagjaega almost but i'll get 50g of greens, will I be able to stop tho? Not sure about that lmao, fuck bro crazy scene hojaega. Ganzaaa, chahiye thoda sa hi, but fir wahi itni jaldi khatam bhi to hojata h bro khatarnaak. Jab itna saara hota h to bas mushkil hi h, healthy to ho hi jaega koi scene nhi, half joints, ghar pe only. Jyada bahar wali masti nhi. Dekho abhi chingchong chutiya h, dodo to kra hi dega, 50g sambhalna mushkil hota h but still bhot hota h, responsibly aaram se fookna already have found good work now na to kya dikkat h fir, thats true, kharab bhi nhi hoga, have ziplock one. Chalega fir to, pakdegye to fucked ofcourse. Theek h message krdia dodo ko, dekhlega jb online aaega. Tab tk drippo pe bhi daaldia msg, agar kuch better hua to wo krenge fir. Dodo is value for money tho, khatam hi nhi hota, wahi le lena koi nhi lessgo. Chalo hatta sawan ki ghata, ab chalte wapas ispe, lets try our local gpt.

# 23 nov

Hello. I am back, after so so long and so so much happened. We are so so back. What we need to do is I dont know right now, just get in the zone again, the system again, make work do good shigt only. Kya joint peena h, pi skte h abhi nhi tho, pehle change krenge music kendrick bhai ka, fir dekhenge kuch badhiya. This is the perfect timing for lyrics like this, need this in life. Iss codebase pe we are back and just making and doing art only full masti full enjoi. Dont really remember where we were and etc, but this is why we write, right? getting to get into the zone is also too much of an ask right now, wo aaega fir dekhenge bhai kya scene h, h na lessgo bhai. Good thing is that theres not a lot thats happened here, but you already know what you're making? Never. What I can see is that I have figured out knots, of different sizes and shapes, and is able to draw shapes inside them. only thing we were left with was overlap in knots. Think in terms. What did you figure out then?

I have been able yo make any path from a given set of points. Make border across the path like tape, fill it with any shapes i Want. I can have any number of paths on a page, if I have two paths, I want to have one overlap the other,

# 24 nov

ignoring knots, I can just focus on overlapping for my normal lines. Polygon intersection is one thing. We somehow identify the polygon shape made by the overlap of these points, and will save it as an object which will have a property of under or over? No that is not an individual ribbons property, but that can be actually. Suppose a path that wants to go under everything, one that goes over and then one that always alternate. So the shape if its over/under would be a property of the shape itself, but whether aa ribbon goes over or under would be a preference of the ribbon. Ah a preference, that means two or three paths can have different preferences - if they are bg, foreground, borders, figurative elements right. Then we need rules to solve this conundrum between all these right, if and when they touch each other. Most might not even touch any.

Every element has a prefrence then - to not touch, or to overlap/intersect. Then these overlapping can choose to be in the background, or foreground,

So this container of all overlaping/intersecting polygons will have to be a separate array because its global. Each of which is an object - contains which paths constitute it, a function that returns the polygon vertices, info about preference of each path, a function that takes those preference as input and determine the state of this shape, then a function that does what needs to be done to see that effect. Border class needs to have a function check collisions - where it checks with every other already drawn. naah

With preference there comes a sequence to the composition then right, first the background, then the frames, then the borders called on each frames from there, then determine how much area is inside and how much is outside - also if the frames are overlapping or not too. Inside each frame then we can place the elements randomly or in. Ok this is going to be a lot of fun.

The border class we have

# 25 nov

Aaj nhi kia pure din, but lets commit to do daily commits from now, kuch nhi 15 min hi sahi but sit on it bro. Yes kal humko rastaa milgya ab execution krna h.

ok so coloring the intersection plane white only doesnt solve, you have to erase the lines that falls inside too. Ye kru hustle dekhu kya kru. krlia 10-15 min, subah uthta hu ab aur kya.

# 26 nov

abhi aagya hu, have the whole day if dont snoke up and shit. likhte jao aur kya. coffee chahiye ek. So border and knot are polygon classes that works on the points that we give them, so finding intersection and shit should be a global function that can be called by any border/knot/whatever object. Every object of this type calls the function to check it with. We then also need a global container to store all kinds of these objects, so that we can check in with them, keep in mind that we cant store just the path vertices - but the resulting border, knot wgera. Ok instead of z-inex or coloring the shape white, we can do opacity. Kr to rha tha, got distracted pura. Aaaj I'll go to gym. BUT launched phoools token lmao, bag holder hu m lessgo. Lets see ki can i write phoools in this and launch it with the ticker on zora!!!

# 29 nov

beth na, jassbustures. I am a changed man, kaafi shaanti h aaj ki iss subah m. Sach me, I love this chai too. Call krunga babe ko, thodi der baad for sure. Ab sab kuch clear h wese how to do and what to do. Atleast the hypotheis is ready right, right? So abhi line intrsct func kuch chahiye, where does it check, any polygon wherever intrsting should be aware of its intersections right. Haa to a gloabl func that takes what in and returns what out, takes two line.

Can I quickyly change it into a 3d canvas and try z index etc then, possibly scale will also work on distant objects then. But then they will never intersect/overlap - they'll just be on top of each other covering. Ok so right now, our input is the points array but its just a set of points, not the polygon. When a border/knot or another class of shapes works on the array of points then only a polygon is formed, so we need a function that when it makes the border should return the whole polygon shape information, we need to pass the resulting polygon then. This is going to be very fun today. Shoelace formula, very nice. naha ke, khaake aata hu, ek call and chai too, lessgo. Kaam krte h, yahi socha tha yahi krte h.

Ok read what I wrote, and I am back on the deck, what were we doing, haa bas kuch log to krale atleast, see wheere its failing, we had something figured out. Ok still not working as intended, but kya kre ab - I am just thinking sabkuch full broadly now, why itna broadly baawe wo bhi nhi pta

# 3 dec

fuck pata nhi chalta, but cant let go of the commitment of coming to this codebase everyday. There are some things like that only which I have to do everyday. Write, come to this codebase and log, the very least this is. Then exercise, then no fap, then smoke ye sab choddna chahta hu dheere dheere ye h kya baat. Ofcourse, I dont know if I can get a 40k out of this, but thats the least I can go to. Lets

# 4 dec

Ok its better now. Subah se screen dekh ke krlia humne apna dimaag kharab lessgo. but yeah Paise nhi h - baar baar call aaenge, how much do I need? Kaafi. ok iss sabme lag gya tha, but its fine now hai na. haa kab tk krne wale ho kaam ye batao jab tk hoga nhi tab tk krte rhenge na aur kya. chamarcheet bro krazy. beth to gya hu m, krr kya rha tha wo bhi yaad h, I was trying to implement some.

So every polygon we may make will have a checkCollision function, that checks with every other polygon present. This is shape packing kya fir? but that is. its going to be a very nice shape packing problem then i think. how is phoools collision different then? that is waht we need to do na, make random points, maybe frames or whatever - some seed - then check wheres space to grow, if theres then make more, right? haa usme bhi how are they determining. Pehle ek phoool banta h, it checks for collision with. Ok Ok now i get it. yaha my base is this string, this dhagga. Haina haa. So we need a base dhagga class, an allDhagga array. Jab ek dhagga banta h, it attempts growth or space fill. collision/intersection detection hoga. if space is found, make more strings maybe. Ek threshhold reach hua then just fill those spaces pack them with your shapes. Fucking crazy. Really crazy. hojaega fir ye bhi. Structure banate h - there are then two problems then. Aur batao fir kya h scene. Two problems what are they? pehla is to make those strings - open, closed, knots. to abhi bas yahi banata hu, fir hai na. Aur kya bilkul. Hohi gya solve na fir to pura madhubani, padha samay dia to hi hua. Now go execute. So now the pointarray we also want the stringmaker class to give us right, right. I would like this string to be very modular, so then I cant specify patharrays. Just seed points,

- make a stringmaker class
  // all of these are questions
- constructor - position, pointarray[], type, size
- it happens in stages. First is making boundarys, frames with the strings. They then make borders. An then we start, adding other things later lessgo.

search strip packing

grid lookup samajh aaya - grid banao, check which cell your shape lies in, then check all shapes in those cells only. Much much faster than checking all and everything. baaki kal aata kaafi sochlia ab.

# 5 dec

I was out, german bando ko complex dedia touchdesigner seekhane aaya tha loda

# 6 dec

10 baj rhe h, kya kya hua din kaafi fast tha aaj I guess. Haa bro. khaana khaaleta hu na haa. Krna kya h ye bata. Grid lookup krte bro

# 7 dec

aaj to krde ab, jab tk mann h kro tab tk, fir noida chalo lessgo sorted scenes. kya kre batao. upar upar se to milgya stringmaker apna.

# 8 dec

thoda skip hogya uska kya hi krskte h, aaj I was out, pehle shoot fir noida me masti sahil bhai k saath chirag k ghar. Waha kia scoring utsav aaya bhi tha, fir jizen bhi aaya, fir khaana bhi banaya aur khaaya crazy badhiya mazedaar din. Kehta bhai itna badhiya gaana banaya ab iski video banadete h aur kya. Lessgo.

# 9 dec

Aaj gaane. Aagye h hum - met with yashraj mishra, talked about a lot of things.

Ok so I got 3 sliders -

- numer of points,
- complexity
  -
- spread

  - how far the shape spreads, can go from a tiny jumble to a long string
    0 : tiny jumble ; 100: long

  simple triangles.

  ok yes, I am getting values and shapes for almost everyhting, and thanks to discovering post chaikin smoothing they shapes are much better now. maybe we need

# 10 dec

Ok aagye hum wapas, continuing in the last days table only for now, but likhna shuru to kree. Ye nhi hoga abhi tho. Classical hi chahiye hota h. Subah se hum isme aae hi nhi na zone me. My hands feel cold, so sochenge kese, likh ke likhke garmi aajaegi apne aap. Ruko mat, naraa chalegi beech beech me dimaag me.Wo to h hi hamesha but chalo lessgo krte h ab fir.

# 11 dec

aaj hum bethe h ab yaha subhe subhe, chatt pe to nhi gye the, but kal ki tarah 3 joint ka bhi nhi h din. Apne ko chill chahiye, focus chahiye aur shaanti life m. Wo somehow fook k nhi aari bhai crazy baat h ye to lmao daamn lessgo. Ok well we have a function that generates a bezier string now. isko uthao, class banao. call it on sketch to fill the canvas randomly with 8-10 shapes and let the values be whatever, ek jumbled sa composition banega. Inn shapes pe fir hum chala denge hum borders and let them intersect, crash into each other. Lets just first implement that and see result uske baad hi hum pahuch paengere grid lookup and all that shit which is not working right now. Good shit bro tho, very nice. Ok ban to gya, was able to implement border on a random ass string - not clean at all, and its a jumbled mess but we'll figure that out too.

Some sort of smoothing has also been applied on this, which is nice. i think not, check krna hoga. Dont get sidetracked. Apne data pe jarvis banana bilkil, mazaa to aaega. We need narah ka actual oracle. Hogya kuch to, I meen i was able to apply chaikin smoothing on this, which is good. Me tab I think can work with this while this is in the background. Abhi i cant say that the borders without beads are perfect, on sharp corners, we need to figure that out to make sure its always the same bro

# 12 dec

Aur btao, kya haal h. Being able to generate random ass shapes bezier curves and then changing them to borders is very sexy. Wass able to add chaikin smoothing on the border too, which is nice, we come closer, then try and then find out ki accha abhi to aur kaam baaki h fir yaar h na. haa yaar kya kre. I can notice abhi ki on sharp turns are the major problem. Ek sharp turn pe just adding beads ki bhi jagah nhi hoti. Beads are working perfectly, my lines are jagged, sharp, corners. So the beads will naturally overlap and shit hai na, haa. fir uspe border lagana, offsettign two lines parallel, jaha jagah hogi hi nhi would just look ugly I get it, even with using smoothing. Discovered something ccalled the cubic hermite spline, also itne din se daily coding krra hu to how less time it took me to get back to this today, lessgo bhai, aise hi hoga, aise hi hona chahiye. Abhi 3:30 tk kuch nhi kia smoke, krna bhi nhi h shaam se pehle, shaam ko hi krenge full on aaram se aur kya. Haa lessgo sahi baat h. The problmem is not using curevevertex here bro, the problem is the corners and that is because the points we are connecting are completely random, Only if we get to a better distriibution of points can be accomplish what we need to, composition wise bhi, when I draw with my hand, itne sharp turns nhi leta h pen mera na, haa true baat h ekdum. These csplines adn curvevertex are different things I think.

# 13 dec

aaj me twinmotion khelunga pura din h mast apne paas lessgo. Justice lady bana du kya khud se, why not lessgo. abhi kia h kuch

# 16 dec

kal parso to I was out, thoda bhot to dekhra tha tab bhi na usko, kisko isi kaam ko. Was I? Yes, chalo sab socials wgera krlie ab check maar lie. Ab check. Check. Chalo ab batao. Kya batau yaar pata nhi kya batenge. RIP Ustad. Zakir hussain saab, back to his eternal abode. Crazy. 72, to life they were dedicated now that should be celebrated. Apan 12 bj rhe h abhi to, aaj will talk to a lot of gusy. In sab ka choronology dekhna padega abhi to, true ekdum lessgo. Hojaega sab hojaega.

The problem is the initial distribution of shapes - ture, itne random and jagged lines nhi hone chahiye, but thats an aesthetic consideration. Agar honge bhi sharp corners to still it should work na, the algo of borders should take the turns seriously, its not a smoothing probelm, kyuki wo bhi laga hua h wese to. Its about the border understanding where to you know turn away, kill itself, and continue by connecting at the right point. Tab hi clean hoga - kaafi accha problem to solve that is. True. What I am thinking now is I drew out the curve fir kya hua ye batao.

Drawing out a curve and tracing borders by hand on it shows me a problem, for our offset curves we are calculating those points from our array by offsetting a line which is true, but on corners, sharp jagged. Found it - its called polygon inward/outward offsetting. Already bani hui h algos and libraries. Yaani ye bhi sort hojaega abhi bhai fuck lessgo. Thoda sa rest 10-20 mins bro need it. have found an offset example on p5 editor with a slider. Add our polygon to it and then see what happens next. Kuch khaana chahiye pehle ab bhook lgri.

I have found the angusj clipper library and can just try putting it into practise, isme the path must be integer coordinates, apne wale me change krna pdega ree. Koi nhi krte h.

# 18 dec

kal was a nice break day. ok so fuck,
found the exact libbrary
couldnt run it withnpm, tried node
theres something called webassembly that might be of
c++ se saala seedha compile on the web kralba taani

# 21 dec

c++ se seedha compile krna direct h.

# 22 dec

goodmonring

Ek chai pi, thodi si dhoop dekhi. Acche se soya. Sunday with my bro. masti full power. Fir khaya ek kachori and samosa. Writing me mazaa aaya tho lessgo. Shikhar bhai ki thodi si charas churali mene today lessgo. mazee krenge. Thassa lessgo. Morals are just no where, on narah. Saala ye wala rass hi nhi h.

# 24 dec

kaafi slacking i know. How do I even get started, kya krna h ye batao. Do you wanna do houdini forsure, yes. Bhot cheeze h duniya me krne k lie, sirf ek cheez h jo aage badhaegi wo h actually doing the shit you talk about doing. Kaha tha me mujhe yaaad h kya pata nhi, momentum tho sabse jaruri. Best music I have already found for the day, aur odyssey, sing to me muse. Lessgo, I wanna hear you scream and still do it, still focus. Saans le bhidu only, thats the only thing. We are actually very close. Kese hi lagega mann m focus jb tum sirens ko take over krne doge har baar brother tum batao. Quit nicotine pura pura. No bidi in 2025.

Ok so I getting to know that I already have wasm of clipper downloaded figure out how to run that in js, and make a separate project for it.

# 25 dec

morning, apne ko krna kya h ye batao. brother. All you have to do in this different sandbox is to run clipper webassembly. make a polygon, add an offset on it. Bas ye krde, ye krdega to bhut major cheeze solve hojaegi. lessgo. abhi baj rhe h 1, 3 tk jaata hu.

# 26 dec

aaj bhi aaya tha attendance lagane, ye pata h ki bas webassembly chala dena h ek baar, fir dekho bc kya kya krta hu. Aur ek baar ka hi h, kal yahi krne wale h. Quit smoke.

# 27 dec

No smoke today. At all. Yessir. Suffer, but koi nhi. Ek din hojaega fir 21 days bhi hojaenge bro forsure.

Ok hello.c chala dia webassembly m convert krke. Now we have a whole library to run like that, and I have to make sure that I get all dependencies and everything here. Ek custom html i dont know if we need, but we will just use the starter fro now, and remove what we dont need. Glue rehna chahiye right. Ok html krdia clean, faltu cheeze gone isme se. Follow that one tut and banade ab clipper isme lagade. If you have to you can delete and redo this codebase lessgo. clipper wasm and js are already there, we have to find a way to run this. Es6 ka article bhi mila h, read that and do this aur kya. Kuch khaa ke aata hu, nahaunga to nhi ofcourse. Thande se naha lu ky ato marjaunga. Lets go eat some oats bro lessgo. baawa. Nhi fooka lessgo. Oats ke baad kaha kaha chalagya pata nhi chala bilkul bhi lessgo.

Ab kya krna h wasm bro what else, correct.

# 28 dec

Koshish krra hu, webassembly to nhi aara samajh, to lets do the js one. Mandi jaana h kya? mann krra h bas bhaag jau but fir mann ye bhi krra h ki sit tight. Do the work. Aaj bethega krdega tu pura proper sabkuch khatam.

# 29 dec

Good sunday. mastibaaz mastikhor. Khaana khaake. Krna kya h ye bata meri jaan.Abhi tk hum kr kya rhe h mere bhai whats the scene ye btao. aur kya ye batao to mere bhai. isko bhi delete krdekya aur shuruat se krde shuru kya bolte ho. nhi re why. Abhi bas momentum ki hi to baat hoti h na only yes true.

# 2 Jan

idhar hi hu, aata hu wapas. Aaj rhino 3d I downloaded, will learn this and grasshopper, work on my computational procedural skills, fir isko unreal me bhi leaaenge. Have rhino for 3 months now lessgo lessgo.

# 7 Jan

next level jazz. aaj meri bandi flight m coke aur joint leke gyi h, meri gaand fatt gyi sunke lmao. ispe hum h jyada door ya pass wo to nhi pta. Last few days i learned rhino, ek 3:30 ghante ka lesson. And grasshopper 1/12 hours abhi. Duniya puri touchdesigner seekh rhi h, hum chalenge grasshopper, unreal. Form study to aaegi architechture skills se hi. Dheere dheere krte rho chalte rho sahi h. grasshopper pura advanced krenge dont you worry.

Abhi ye clipper kya badhwa h mujhe smajh nhi aara bilkul bhi, ki what am I even doing. Shouldnt be that difficult bro.

# 11 Jan

you can take breaks, do other things ofcourse. Purity k lie bawe roz aajao bas idhar. Ab job shuru hone wali h, krte h apna roz roz roz. Tabhi hoga insabki maarna. True. Prolific hone h. Saans lo bas aur kuch nhi.

kar kya rhe h? wikipedia scroll nhi bas, baaki sab chalega. mann to krra h grasshopper krne ka, sabse jyada mann krra h gaane sunne ka tho. True gaane sunte sunte m kya krr skta h code and think and masti, fun full power lessgo.

# 13 Jan

hello, first day at grappus today. Waiting for something to happen. Till then ye hi krta hu figure out

# 21 jan

1 week hogya idhar, I had a client meet and got lunch. now kuch time bitaate h ispe, if you ask for work, you'll get work. So just get your head down, and do the work, whatever work you are and were doing. !5-20 min se hi momentum built hojaega baccha. Get back to this, art banara hu abhi m beth ke right? Right ekdum right. No scrolling at all. Is it time to rethink it tho? I am in a room full of crazy devs tho, hai na. Haa ekdum sahi baat h wo to. Ask people for help. But krne kya waale h wo figure out kro

Do I even need the whole clipper thing? Right now to move forward visually sirf offsetting solve krni h, found a minimal lib with no dependencies. Lets try it and dekhte h directly.

Found something cavaliercontours, I feel that this is going to be it. But its in rust, fucking rust, wasm me convert kro somehow isko. Ok read about it, this will work, wasm me bhi krr rkha h inhone somehow, but lets see now how to implement it. Basha ka show h, 6:30 hochuke h aur mujhe nikalna chahiye ab yaha se hahaa. Lessgo maal waal fooko thoda masti kro, music suno accha fir chalte lessgo. Yess

# 6 feb

wow, koshish to krni hi h, improvisation is the key to restlessness. 10 baj chuke h, bhook lagi h khaana khaana chahiye, consume krne ka to koi mann nhi h. Kyu hi hoga, adi boi se baat kari, gallery ya daily soap.

# 23 mar

hello, kya baat. this is also studion daily ka hi continuation more specific to what i am actually doing, lets now talk to bolt, masti krte h, ye dhruv ka paid plan ka nhi pata kya scene h, but let me check that too

Now lets focus on the output of stringmaker and knotmaker, the first one gives a random array of points making a curve, that can be of a lot of variety. Knotmaker returns a mathematical knot shpaes with different crossings sometime. The border class takes any array like these and tries drawing a border on both side offsets parallely and then fill it with shapes. Theres a problme in this approach as at corners, the parallel offsetting results in very weird intersections and overlaps and is not visually as intended. We want to focus on trying to figure it out and fix it.

A better approach would be to implement polygon offsetting algorithms as described in this library. It can help take any array of points and make smooth offset curves on it handling self intersections and overlap. This approach, library I want to implement in my code base and understand how to do this. Give me a plan of action for this first

the thing is, ki krte rhna h bas, aur kuch nhi h. krle kaam, khana khaya mene abhi raita bacha hua h i guess, h na haa

# 14 may

Madhuban Project: Artistic Intent & Development Summary
Based on your development log, here's a synthesis of your artistic vision and the code's intent:

Artistic Intent
You're creating a generative art system inspired by Madhubani folk art from India, characterized by:

Dense visual storytelling: Filling all available space ("bharni")
Decorative borders: That define areas and create visual rhythm
Symbolic elements: Like suns, leaves, faces, with distinguishing accessories
Line-based aesthetics: Where borders/outlines define everything
Your unique twist is to break traditional boundaries by creating:

Open/recursive borders: That flow organically rather than being mechanical
Overlapping elements: With deliberate over/under relationships
Dynamic compositions: Generated through algorithmic rules
Technical Development & Visual Goals

1. Border System
   Your core achievement is the Border class that creates dual-line "ribbon" borders around any path. Visually, this creates:

Path-following ribbons: Borders that flow along any curve or line
Decorative elements: Shapes (circles, triangles, squares) placed along borders
Variable widths: Borders that can adapt their thickness 2. String/Path Generation
The StringMaker class creates organic, flowing paths using Bezier curves. Visually, this gives you:

Natural, hand-drawn quality: Paths that feel organic rather than computer-generated
Flowing compositions: Creating visual movement across the canvas
Foundation for borders: The paths become the skeleton for your border designs 3. Knot System
The KnotMaker class generates mathematical knots with variable complexity. Visually, this creates:

Interlacing patterns: Complex loops that weave over and under themselves
Decorative centerpieces: That can anchor a composition
Variable complexity: Through the "crossings" parameter 4. Intersection Handling
You've been working on solving the visual problem of path intersections. The goal is:

Natural overlapping: Where elements pass over/under each other
Z-indexing system: Based on path preferences (background/foreground)
Clean intersections: Without visual artifacts at crossing points
Algorithm Intent in Visual Terms
Your algorithms are creating:

A modular visual language: Where borders, paths, and shapes can be combined endlessly
Organic flowing forms: That feel hand-drawn despite being code-generated
Spatial relationships: With deliberate overlapping and intersection handling
Dense, detailed compositions: Filling the canvas with intricate patterns and shapes
The project combines the traditional aesthetics of Madhubani art with computational approaches to create something that preserves the cultural essence while exploring new compositional possibilities that would be difficult to achieve by hand.

pathgen -

- makes a path from a set of points, returns a path object
  bordergen -
- takes a path object, returns a border object
  ElementPlacer -
- places elements along the path inside the border, can be any shape, spacing, size, rotation etc
IntersectionSolver: Handles overlapping paths
Renderer: Displays the final composition
Exporter: Saves as image or vector files

----------------------

The above endgoal of the compostions the way I visualize them is, to take a set of paths that can fill our canvas, they can be organic closed shapes . Take our canvas, from a set of cureated styles pick a color, elements, composition theme - these theme will have all the information and variables to have granular effects on the broader composition. We may have many path types - path are just frames - of different sizes, shapes, parameters to fill our composition with - closed curves, knots, rectangles, circles. These paths first fill in the canvas following some composition logic like collision packing, or comic like panels , overlapping, intersecting circles etc which also comes from the style . So the path now should be able to generate different types of set of points. Now the border class should be able to take any path set of points whatsover and make correct, smooth border path offsets - we will have to explore cavaliercontours and other polygon offsetting algos, should be able to handle overlap, intersections and anything the path set of points need to become beautiful borders. Now the borders have been created, we should be able to have information about all paths and borders and how to access exactly which one we want to fill with ornamental elements - simple shapes, custom vectors shape, smaller path objects like small knots and should be able to control size, spacing, density, color, groups of elements etc of these. Basically imagine a style says to fill every alternate border, or every child border, or every adjacent border a certain color. It should be that modular and granular, then only we can have infinite variety of curated compositions. So the flow should basically flow eventually from compostion generation first - then filling the composition with whatever curated randomness can happen to make beautiful artwork. This is again on overview on my overall thought. Now considering this how would you say we approach this

---------------------

# 21 may

good ideas- 
- Can a path start as a single strand, then split and weave with itself, then merge or trail off? (This implies more complex path generation logic).
- Wave fields/tesselations - essentially for filling canvas with dense network of interwoven paths, rather than distinct, separate ones
- The spaces between the strands of a weave and within the loops become significant negative spaces. How can these be controlled and utilized? Can they be filled with different colors, textures, or even smaller, non-weaving elements?

Right now what I see is that when we follow a centreline we will reach all crossings one by one, because its a loop knot. Every alternate crossing is being assigned over /under. When i follow  the line and reach a over, the under lines are eliminated. Every crossing is marked over under, what happens when we follow the line and reach obviously the same crossing point as before which is already marked and taken care of, how is that being handled

# 25 may

spaces, frames, windowsills, seascapes, landscapes, ambient scapes too. Isme generativeness how the fuck, yes will have to figure. 

is using diffusion to generate a frame, generative? is it algorithmic tho? diffusion can take a master prompt that changes keywords from oure script, based on keyword maybe the prompt adheres to it, makes a frame. We pass the image make line art, vectorie it somehow to achieve our compositions why? isse hi scapes, minute, tree bottom view etc bnege na, that by nature will be visually different, uska stripped down line art is the frame we need. jisko fir me categorize kre randomize kre. aur fill kre areas ko with our patterns. Through this, we might end up with contextual pairing, ki ye hill h, ye grass h, ye tree h, ye water h. ab naturally pairing hoskta h then. Having a ai then inside the loop, to generate frames and then make line art and then fill it with our algorithmic patterns, that is generative. 

So style gen here is more controlled, what is it then - just LORA trained on curation, a style defined to do the silhouette - it will then exactly give that image output, then changing it into vectors, basically redrawing on it. Story driven/contextual. Every kind of frame might have some main characters, its a stage after all, and this is object oriented programming right. So every stage has some main characters, some side characters, some guest appearance. With variation in palletes, their selection and application. Everything, contextual might be possible

So basically whats happening now i, ki replicate ka api h, yaani apne p5js ya q5js ke code me ek system hoga of prompt generator . Import replicate krke api lag jaega, select model, input is the new generated unique prompt, output is an image, image I will already clean the training image to remove colors, backgrounds, simplify it into vectors to focus on shapes, composition. A custom flux model can be finetuned to listen for a triggerword to generte from that style set. But what about multiple trigger words for multiple styles? Replicate samajhna hoga thoda sa, fir vecterize api too.

aisa possible h definitely, but are we taking this route? once we run the prototype, make prompt generator work correctly, then why not, yes, we will. Shortest prototype loop right now is - 

# 12 june

Aaj kya kre, aaj krenge masti aur kya. taskmaster is installed and now we need to create a nice crazy prd, mujhe wave function collapse krke dekhna pdega ek baar for sure. tab hi pata lgega actually. its not actually just about code implementation, maybe it is. kese samjhae apni compositions exactly, or do we really even need to start from a set of composition rules already? I want to approach it as something very modular, where i can .

OK so. So there is something called semantic rules and there is something called logical rules. So in. All of generator and procedural art. Till now we see. We see what we see rules defined, and according to those rules, objects place. For example, let's take a 10 by 10 grid and define a rule to say. On every 3rd, on every 3rd cell add a circle, or on every second cell add a square. That's a rule. That's a rule definition to place elements. On a canvas, right? Can we also have semantic rules? For example, on a map of on a on a hex map. Let's say we have hill tiles. And we say wherever hill tiles are, place hill objects on it, on it randomly in in variation and always place trees near hills. So like always always place trees near else. So that's a semantic tool. Oh, that is also similar to AA. The process of model synthesis or wave function collapse. These two algorithms are basically designed to do this like models and this is takes one model synthesis takes 1 like. An object, any any input image or object. It can be a. It can be a 2D image or a 3D model, it doesn't matter and it breaks it down into graphs. Graphs are connected nodes, nodes. Graphs are connected nodes basically and that that like enables us to make. Node graphs out of an input image. A node graph can like is just a collection of node node points and it can be manipulated like. Expanded, contracted. Accordingly without changing the information. That is contained on the on those nodes. So then the next step in the model synthesis process is making the graph parameter so model synthesis already. Makes a graph grammar out of it and applies those and those those becomes the rules to be applied on canvas. So that's models and this is. Then there's a process called wave function collapse, which is essentially. Let's say on a grid every. Cell has every cell has the. Every cell has equal possibility of having a certain of any tile right? Though like the algorithms maybe. I'm not sure if I'm correct, but the algorithm starts like I'll place a tile on a cell and then see what tiles what like according to the rules of the grammar. What tiles, what spaces? I still have left and. Like the possibility increases. Basically it's like Minesweeper, right? So this is also one approach. So these are. What are these in my context? In my context, maybe these are? Algorithms that can place things accordingly. Maybe what we want to do semantically, like define semantic rules as in another Bunny Like by semantic rules I'm just mean, I just mean storytelling. Rules in Madhubani art there is. There are there are compositions that are based on stories like Radha will always be with Krishna and wherever Krishna is there would be like there is possibility of having. A Peacock, Peacock feather or something and windows and like one single sun, river, river element can have fishes inside it. So these aims I am talking, I'm talking about these, these are storytelling rules that those traditional. Artists apply on their work to create these integrate patterns, so my. Question would be. Like like we were talking about earlier, like we're talking about earlier of use of using. Using a prompt to generate composition. Composition according to. And train a trainer, Laura. Uh, on a lot of elements too. And let the composition direct. Basically, let the composition prompt direct. Basically how those elements should be placed, where those elements should be placed, and that we. Then fetch from our whatever the the collection of acids that we will have in our code and place them according to some rules. Ditching Laura, Laura and. Creating uh, something like wave function for labs or model synthesis would also be a nice idea, but I want my whole project code to be modeler where I could at any time where I could test with only 2223 objects, one compression rule, one style rule, etcetera and can add any, delete any. Uh, modulately anytime I want just continue developing it. So yeah, I need to refine this. Uh. And let's see where does this go now? 

Kuch to crazy ideas aa rhe h. I have been testing this hybrid approach now. Mock AI gives us a prompt, based on which there's  a semantic switch to make frames, this can only have so many types, the story can determine a reason to choose one over the other. Once choosen, it can see the frame data, its shapes, paths, area avaialable and make a decision of where to place what elements. Then can fetch rules set, or make new ones on the spot, send that rule set that gets saved, and then applied exactly by the code, then only the  drawing begins. Reason k saath story driven algorithmic.

make mock ai data bro, for each step - make variations test emmergence in it. wow composition engine works from json data that can be made on the go what the fuck

I have a lot of frame ideas. Then selecting those frame and selecting elements to compose, can make a lot. Selecting elements and their relation and their numbers. Then the individual elements we selected - main character, side character, border, path, recursive/lsystem growth. Now place them on the frame, based on their filling rules, and place them with packing. aaj k liye itna hi.

# 13 june

path and border bhi integrate hogya, I am able to just change frametype in json and all the other remains same and works as they should. That is crazy to thing about, ki kya sahi modular system kheecha h ek din m. Ab kya krna h. Path engine h, which calls the frame functions, makes it a path, to apply border, and fill that area with whatever. the border is now a universal class and can be applied on anything, let me test. 

As this has a story element, the story can be the seed - re roll to keep the story, elements,, mood, relations same but change frame type, etc

upar se leke chalte jao, refine, redefine, reaarange

Frames

- organicPath - frame type can have starting, ending position from the story
  : Following a river, a character's path, a continuous story, a road, destiny unfolding.
  start: left upper corner to end : right lower corner, showing a journey. to kya frame types will treat subframe making differently? ok so theres a difference between path generator that can build spirals, flowing lines, knots, jagged lines, etc and the frame type.
  - how does the type of line or flow gets defined from the story

- voronoi - frame type like broken glass, each cell treated as a frame

- windows - frame type, collection of rectangles, can be of different same size whatever, each rectangle treated as a story frame

- tesselation - frame type, grids, repeating, truchet tiles, escher like patterns

- 


isko vedic puranic kahania books denge, let it extract stories from it, make a long long list, make every json. see all characters, keywords, resoning whatever it makes.Visualize all data, thats a very big list of assets available in the marketplace, youu now will choose to keep p from that set, now the stories being generated gets limited to the assets we have too

ok so recursive frame composition engine, which means we can place any object inside any other frame, treat it as a frame - and fill that area etc are working fine, are they? Abhi stress testing. There should be no limit to be able to place an element outisde, overlap, like absolute position over a frame, or even outside - not character elements, but path or frame types.then we will need proper overlap and intersection handling. I want to be able to access any area contained inside any frame, subframe, or path and fill it with color, pattern or any other element. Thats how is that going to happen

# 14 jun

bhot jaldi uthte hi screen khol lia h. goodmorning. Will a editor like this work at all? Mere composition is recursive, have, nodes and shit, that i should be able to add through the scene editor. and make composition plans basically. Abhi jitne available hai utne hi chaljae. to create an editor 


Frame Generator
- Windows/grid
- voronoi
- organicPath
- tesselation
- phyllotaxis
- concentric
- Knot
- RecursiveSubdivision
- FlowField
- ribbon
- grid of circles/hexagons/whatever
- penrose tiling

Operators
- border_decorator
  - spacing
  - strategy - randomize, alternate, rule etc
- scene_placement
  - strategy
    - distribute in childern
    - place at child index
    - 

- filler
  - lsystem
  - collisionPacking
  - recursiveSubdivision
  - wfc
  - tiling penrose or other

  - strategy
    - distribution strategy
    - awareness of 

- meta
  - selector
  - stagger
  - conditional
  - inherit
  - mask
  - 

- Advanced Collision/Layout


kaafi dekhlia, ye 

ok so first thing i know is that i need to implement correct border from sketchW to my engine code. first compare, it should take path, width, number of lines on both side, i dont think this one has a bead system. The pathEngine in my current code returns an array of frames it makes, we might need to apply it on any individual frame, character, so i should be able to get path from any.

Do this manually while understanding, like you have been doing so far, isse samajh aaega exactly how my system works, and then I will be able to ask better questions, this will be the first step to see visual outcome on this bones of logic. iske baad p5brush pure pe lagaunga. thats v0 for me. Uske baad kahi bhi jaa skte h. Aaj ka sirf yahi h task ok, lessgo. fuck this prd, jab tk ye step khud nhi krega tab tk nhi aaega samajh. 

hogya jo hona tha, atleast borders are picking from related elements their beads. correct nhi h voronoi ka border wgera, place its not closing but dekhte h isko baad m. Assets daalde tab hi samajh aaega kuch

tasks for tomorrow - 
- add assets/tiles
- fix closed border
- then actual accha border 
- then p5brush

- iske baad roadmap/prd we have on gpt. Goofnight

# 16 jun

jab tak ye hoga sequential thinking se visual debug, tab tk aage krte h, wese now i think ki jarurat thi ki nhi. pata nhi but now we need the taskmaster. this is what git is for. bhut lamba khatarnaak push maara h mene, pehle ka h nhi. yaha se branch out kr skte h wese to. abhi i am tryin to add bruh, render my p5js exactly as it should be but with brush. uske bina bhi ek branch sirf normal lines me shuru hoskti h but kya pata jarurat hi nhi abhi ye hogya to seedha visual feedback i am getting. kaafi high hogya hu, aise sirf vibe code nhi hoskta. now we are very close damn. Ab architecture polish hota jaega but we need actual design now. Frame generators wgera se pehle some elements. asset calling ko module alag krna like we had earlier - functions that generate that element asset - be it a character, related element, bead, custom shape. 

> branch - element asset
- character
- related element
- bead
- custom shape
- - Page for each element asset generator, to be able to view all at once, or select


almost hogya p5js integration tho, if everything on the screen can be rendered with it I am done right. abhi isi me ghuste ghuste kuch nhi hone wala bhai. abhi hume kya pata h where we are at batao pehle tum.
- Brush is on every element, all draw functions sahi hogye.
- border translate is fine, character placement is. Border on character is offsetted, and filler types are not being drawn inside their bounding frames, clip areas. drawingcontext maybe does or does not work with brushjs

thoda pigeonhole hogya, lets zoom out.

we have to break branches - one for border, one for filler, one for sceneplacement. 

What is an operator type. - 
border can be placed on any path.
All shapes are made with paths
Sceneplacement is called on All nodes 
any closed path is a frame can be called sceneplacement upon.
any closed path can be filled with filler.

dekhlia jo dekhna tha actually

ab yahi sahi h, i am on the main branch and we have different braqnches which is nice, abhi brush integrated h but not all elements are correctly positioned tho. wo chalta h, aaj atomic design chalu krna hoga ab i can live with this - krishna, heron, radha, gopi ye sab to jyada detailed h so what are we making generator functions for these? why not lets try. But hamare aur main symbolic jo h, river, tree etc. and river should be coming inside a frame only thats wow. isko modularize krte h fir dekhte h kya krna h


pure node ka draw call ek baar me hona chahiye na. its a shape with a fill color and then border on its outline and other brush.begin shape wala shape on top. So z index ka scene h to kuch. When I do two draw calls on the same node to ye hora h displacement ka isue. Layering actually sochni padegi aur usse pehle ye draw call figure krenge subah. goodnight

# 17 june

Goodmorning. Aur batao kya haal h me bhut sahi

one branch 

# 18 june 

this is a llm powered app, pocketflow isi k lie bana h na. right branches kaat te h. Brush is done

Border branch is correct at step 1, expand steps

Ek branch is correcting filler - first add hatch in correct frame, then fill. then fill with a lot of patterns. Should be able to fill any polygon shape whatsoever

another branch is sceneplacement - to be able to place any operator on any node at any recursive level, pass the exact polygon bound and scale whatever is going to be inside it accordingly. this scene placement can be the one to place borders, fillers, characters everything now. So this is a mid layer between json and calling the exact generators there.

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


2.2 3 path engine - any shape that is being generated be it a frame, a custom element like a character, tree, river shape, sun etc should be handled by pathengine to call that specific generator function. Should be able to place any generated shape inside any frame wherever the conposition plan demands
currently supposrts window frames, voronoi. organic paths is a placeholder blanket function for later coming generators for specific shapes like river, trees, etc. 

#sym:### 2.3 Visual Elements System 
Right now there is a basic structured sytem for visual elements. Lets define what they are -  specific pathengine generators that forming anything like characters, custom shapes, other elements. 
The pathEngine handles how to generate these shapes, but their definitions, relationships, intrinsic properties have to be defined here. We should be able to place krishna's related elements - flute and peacock, wherever krishna is, on its border, or fill the frame he is in with them. We need a updated system for this. Also the character elements might have variations - of poses, mood etc, while the related ornamental elements might not have, suggest what and how should this be

I have more or less a very detailed updated engine now, which i can get direct executable tasks now. Yaha se ek brand kaato - core engine, every layer of functionality works at correct position and layer with brush applied, the new scenemanager restructure that is, detail - placement, orientation, group, relational, action driven, aura, environmental, dynamic property. Fir pathprocessor, border update, and minor compositionenigine and node updates. With the same story, i think pehle hua hua bhi h kahi, but yaha se hi shuru krna h. this is phase 1 and can be done today.
Then phase 2 is operator implementation, meta wale. add more fillers. ban jaega. 

Lets read and focus on the storytelling engine, detailed docs k lie manus is better actually.


So character creating, rigging skeletons, applying skins on it is the best most modular way to make this work.

# 19 jun

to do :
- claude code in windows
- setup crawl4AI, knowledge graph mcp

story engine on gemini
- make this work

character skining state machine

# 20 jun

Goodmorning, flow state me ghusne k lie is suffering only. Likho likho aararm se, ye autocorrect bhi masti h. I have two modules on the backend - story engine and the api integration. Frontend me - composition engine rehaul with sceneplacement restructure. Then the character skiing generator. Uska schema wgera, we will have to start brainstorming this and poc ready krna hoga. Actual visual k saath tab kuch hoga. 1 hafte se to jyada lagega, but crazy shit. You are a product manager now basically, define your ideas and break them down in step and steps and just keep going. baccha hu me kya, nhi hijr, you have the power of ideas, and the conviction enough to execute them. All that iws left is doing it. To ye jo kuch bhi thought aaskte h inka koi matlab mayne tark nhi h, sirf ek cheez h joki h kaam. actually krdena ye sab. Manus ke saath bethke research character skinning with state machines in js. we wont be using that bekaar si js library we saw. We will use, rive statemachine animation,, so rive me hi edit krunga fir to. rigging se fatti thi h kya, uska bhi koi ai jugaad dhundenge. what is the deliverablt then, a poc nhi a codeblock - a character generator function, that reads what character it needs to output doing what action. we need to figure out what a character id has as the attributes. Each character tied to a head, torso, limbs skin. Pose and actions are different skeletons. Theres a single skeleton, with different poses and animation. ON which we can add any head, torso, limb skin. So now if a charaacter is a gopi we find gopi head, a torso costume, limb skin. Some main key characters will be fixed, some more general. to lamba graph banega ek of relationships of things. We are making tiles and letting character definations be generated too kya? Are animals characters too or are we making a library of things. ye to sirf characters with poses h na. that would be so nice, imagine a scene with some animals sitting close to a flute player, some standing, some lying down, listening. The image tiles cant be generated it has to be made by hand, placed procedurally. Fir ye characters hogya, then we have to make generators for things like river, tree, plants, fruits, sun ye sab - ye sab elements which dont need any rigging. ye sab procedurally generated inverse kinematics se animals banate h unki skinning nhi krni pdegi like the video we were watching(https://www.youtube.com/watch?v=qlfh_rv6khY&t=189s) . 

we want to use https://rive.app/docs/runtimes/web/web-js and 
https://codesandbox.io/p/sandbox/simple-skinning-example-96xnwn. 

we then have to break down the required character tiles into lego pieces to be generated.

So I've been thinking about the concept of knowledge graphs for both the development and. For the AI system to use all the tools characters. Elements and their relationships that we have. It can replace the visual vocabulary matrix. Currently the visual vocabulary matrix is a table. That that has that has characters elements related to their. Related elements. For example, Krishna has related elements flute and Peacock feather. Now knowledge graph representation can be like Krishna wheels flute. Krishna is a deity. Krishna performs action dancing, dancing is a mood, vibrant, vibrant. Suggest palette bright colors flute. Generates with flute shape. Generate flute shape. Krishna often found in forests. Forest generates with recursive subdivision. Forrest is a environment setting. So. We can have this very detailed knowledge graph of every element that we want to add for the composition to be planned accordingly. This will this. Will like help the. Like the AI Prompt interpret story stories much more clearly and vividly. And. Hopefully generate better outcomes. Then I'm also thinking of a knowledge graph for the development of this project. Basically I'm developing all of these detailed docs with vaness. I want to be able to reach a stage where I have all the final documents detailed out for building this whole project and reference libraries. For every code snippet that we would need, we will build a knowledge graph rag out of that to assist. Task management and task breakdown and priority management of everything that the development needs and that Knowledge graph rag can help reduce. Increase productivity of and and like give us sure short outputs. For this project and reduce line. How can I do these things? Research knowledge graph creation for me. Tell me how. Like what the structure would look like, what tools would we would have to use and how to how would we integrate? Them in our project then update the like the architecture comprehensive architecture doc. And. Yeah, then yes. 

me kaha aagya pata nhi chala kya matlb. ye rive statemachine p5js ke canvas pe use krna is difficult I know, so what will we even do. 

# 24 jun

Goodmorning, 3 din baad I am back. aaj ghar pe, i got bookshelf and all my books here now. aaj 2-3 ghanta lagega sirf books rakhne k lie. Likhne ka to bas ek baar ka h, kya, no me distracted hu, to get into the zone, the thing is to suffer through the initial phase of sitting down to work. beth ja 15 min likh le, fir uthna. Ye bagal me  beth ke batiya rhi h. aur batao. aur batao kya. you know ki kya h na scene, 1 july highlight pe launch, open form pe krenge iske baad, yaa isi pe krde fir jo bhi h, kaam to krna pdega. 

ulta dekho ab release date se, whats the free version, the day ones of madhuban look like. proper madhuban style, borders, frames, generators of 5 types atleast, palletes, elements like birds, animals, trees, rivers, sun, moon, stars. Doing characters right now is tricky, but we will have to figure that out paralley. ek alag branch kaatni h sirf iske liye then. Kese kr3e i am distracted pura kese bethe, manus ko hi puchenge 


Right now I am not sure about rive's implementation, but I want to figure out 2d character rigging skeleton for my characters in Javascript only, that can be easily implemented on our canvas. There must be procedural skeleton based animation techniques for 2d using inverse kinematics etc for characters, where we dont have to use sprite sheets. If thats one option, then also describe that. On our general animated skeletons i want to be able to set different asset sprites for head,torso, limbs. So any character sprite be it krishna, ganesha, gopi etc will have diffferent visual skin but can move same on the same action. 

How can I make a minimum MVP of this artwork, for a initial release. proper madhuban style, borders, frames, generators of 5 types atleast, palletes, elements like birds, animals, trees, rivers, sun, moon, stars. Doing characters right now is tricky, but we will have to figure that out paralley. We can maybe skip the storytelling engine that generates storys, but keep the knowledge graph based relational structure to generate recursive nice JSON plans for a initial generative artwork release on highlight. Then we can continue on the bigger full project after that.

# 25 jun

Goodmorning, likhna padega, and needed coffee. Ek chotta sa sip hi itna pyaara laga kya hi batau. I have to write, wtite a lot. abhi ye jaegi i have to protect myself from any other distraction too. din shuru hora h aur kuch aisa nhi h ki 7 bje khatam ya tab tak kaam hora h. Its ki abhi sshuru hora h aur jab tak complete nhi hoga tumhara release tab tk chalta jaega, I am continously working, no concept of days now, just work. We have to now make the MVP actuallize.

thoda can you describe in such a way now on how you envision it now. The day one of madhuban, that starts from here. Wow yes this would be the start of something big, even crazier, i am making a open form generative artwork for fxh protocol is the story, and this is how you find a part in that, the final minting open only for the people who minted this aisa kuch kya, who knows. Hello. How you envision it, theres a soundtrack for ure.

TO be able to draw borders on any path wgera, is theek sab sorted h wo wala to koi baat nhi. But how does it look now do we know we can see, so how would you know break it down to step by step
Border me actually me kya kya bacha h - 
- multiple number of lines on both sides
- ability to set stroke color
- to set fill color inside those stroke lines. 
- Border width is the space between, stroke width is how thick the stroke lines are. stroke gap is gap between multiple stroke lines. 
- Beads are the things we place inside those border lines - we should be able to place them in arrangements - alternatively, in patterns etc. 
- what will beads have - gap between them or not, color, hatch, fill etc. Suppose a bead is a circle - that simple circle shape will have its fill/hatch color, and a small border too. The border and center of this circle can have different color, one can have fill while other hatch.
- A bead can also be any shape whatsover - the related elements - like lotus, peacoke feather, flute, fish, even a character head, any shape. 
- Every shape that is being generated can have these properties - layers - different layers in a single shape can have different color hatch/fill. 

Filler -
- filler is any function that takes an enclosed area and fills it - with brushjs hatching, solid color fill, pattern fill etc. 

Segment - described below

> i need to make generator functions of different shapes like a tree, river, sun, fish etc. is there a way where i can draw vector shapes by hand and get beginshape, endshape vertex points for them. when the function runs, The vertex points can have very slight (-/+10% ) randomness in x, y. So that every shape is slightly different.
I want to be able to draw shapes like madhubani art and I need to find a way to convert them into javascript p5js functions, jese tumne likha hua h ki 5 generators shapes, fills etc - to define what and which one exactly aur algorithm likta jaa mast
> If my border looks exactly as I want, works exactly as I want, then we will need to find beads to fill in. also border around what, the next step can be to just do these shape generators of procedural IK animals, plants, trees, natural elements. These variety of animals all having borders, color, pattern theme keys, can have borders and a lot of variety in them, that way I wont have to go to. Might even have to built from scratch in a different branch. Now how do implement this. We make a fish. generate many fishes, apply border on fish. Customize the border of fish, add beads to fill fish border, make two related elements for fish, try patterns and arrangements from bead in border. Border Done. 
> Now segment a single fish into head, eyes, body, tail, fins. And draw these shape inside the body of that fish.
> we now make a general segment function that takes any of our shpaes, the tree, the fish, any animal etc and draws bands on subdividing the shape into segments of various width. Now these segments can have visible separating lines or not, but each of these segmented area can now have a different pattern fill type. So now a fish body can have 4 bands - first has a small border and circle beads inside, second is slightly larger with small hatch strokes in various lines, third can have overlapping semi circles, and fourth is again circle beads. That way we can randomize the inside pattern arrangement and design of any shape too. 
> Figure out theme mapping - rules for it etc. A color pallete theme if has 5 colors, which can map to these segments, there border and fill types. 

this is the POC for MVP. After this we will make more shapes of other elements and all of the above functionality should also work on them. 
then we will start composing these elements and finalize.

todo banao sirf iski, what to plan, define




> dont get distracted nigga, write your distractions in this line. we will complete this complete description, jo bhi doc AI bana rha h that is for architecture, the code working as intended, what we are describing now is how it actually looks visually, which means the parameters and values of all these different algorithmic modules we are using. So yaha describing that actually, I dont know, open figma, copy paste madhuban refs, trake them out pen tool, ask to make a javascript generator for it. Pehle likho describe krop, nikalo ki puchna kya kya h exactly fir kro, so this is now the actual working layer now, before making prd describe waht you trying acche se baby, lessgo.
> tab bhi sceneplacement manager wala update doc is what we need to execute for even the visuals yes. 
> i need to make generator functions of different shapes like a tree, river, sun, fish etc. is there a way where i can draw vector shapes by hand and get beginshape, endshape vertex points for them. when the function runs, The vertex points can have very slight (-/+10% ) randomness in x, y. So that every shape is slightly different.
I want to be able to draw shapes like madhubani art and I need to find a way to convert them into javascript p5js functions, jese tumne likha hua h ki 5 generators shapes, fills etc - to define what and which one exactly aur algorithm likta jaa mast
> If my border looks exactly as I want, works exactly as I want, then we will need to find beads to fill in. also border around what, the next step can be to just do these shape generators of procedural IK animals, plants, trees, natural elements. These variety of animals all having borders, color, pattern theme keys, can have borders and a lot of variety in them, that way I wont have to go to. Might even have to built from scratch in a different branch. Now how do implement this. We make a fish. generate many fishes, apply border on fish. Customize the border of fish, add beads to fill fish border, make two related elements for fish, try patterns and arrangements from bead in border. Border Done. 
> Now segment a single fish into head, eyes, body, tail, fins. And draw these shape inside the body of that fish.
> we now make a general segment function that takes any of our shpaes, the tree, the fish, any animal etc and draws bands on subdividing the shape into segments of various width. Now these segments can have visible separating lines or not, but each of these segmented area can now have a different pattern fill type. So now a fish body can have 4 bands - first has a small border and circle beads inside, second is slightly larger with small hatch strokes in various lines, third can have overlapping semi circles, and fourth is again circle beads. That way we can randomize the inside pattern arrangement and design of any shape too. 
> Figure out theme mapping - rules for it etc. 
> upar is prompt neeche here are my working thoughts, exactly abhi kya krna h. pehle fish gen kro sbase pehle ab, plan hogya tab bhi, aaj ka goal ye pura upar wala prompt krna h only. 

> we have a very nice IK implemented fish, snake and lizard. Ik solves the bones, chains functionality and is working very nicely, to now i wont be drawing the outline of an animal shape, but breaking it down into circles, of different sizes, that taper
> Ik basic implemented on gemini, for fish, snake, lizard. For limbs, we have to implement proper FABRIK IK. Abhi tk overview lia h, lets see if it can solve lizard properly, if it can i will try more but need to also learn how to design these, the design is in the proportions i now understand, so yes. bee able to do that with some tool would be nice, saare constraints wgera basic 2D rig I can finetune to that would be nice. I'll do these 3 only today - proportions set. Iske baad skinning, outline krenge ispe tangentially mast. Which is breaking down the tail shape into a chain too, nice, so I need a tool to draw those chains and joints manually but get its fabrik implementation

> real hoja, aaj 25 tareek, 1 july launch krne k lie kal se post krna chalu krna pdega na, 1 july ko khatam hojae agar ye, to release 7 din baad krega kya, backwards work backwards. Focused steps aisa kyu lagra h, aaj ka jo h wo khatam kr aaj only, din raat ka concept ab nhi h.
> also if you think of a tiger in madhubani 2d, do you think from the side or top? Top is lizard only, but from side all other four legged animals can have same. This is the skeleton we were talking about, this fabrik with cionstraints can be extended to humans too now I feel. We have a detailed doc research plan for IK system. 
> next step in gemini would be to add 2 skins for each, swappable on the same skeleton
> then take next category one by one, implement IK for each of them, ab me ye editor banane lag gya joki banana to pdega shayad. sahi h na, apne animals mast banate h. fir dekhte h chalta h ya nho. 9 baj gye h and its possible i am being carried away, gemini is promising, i am atleast able to modify my skeleton in code. Number of segments, segment length. If you want to add an initial idle bend you have to give a hint. that exactly is not clear right now but i am able to define a spine, give a shoulder index and hip index, the point at which limbs join. Now I need to be able to make varying segment lengths for correct skeleton proportions. 

Fish
bagula
salamdar
lizards
snakes
tiger
cows
dogs
cats
boar
birds
buffalo
bull
crocodile
duck
tree - can also be made with IK and fabrik


message cyberpunkmermaid too

# 26 jun

aaj kya kya krdia pata hi nhi, project setup hogya h, credit ho na ho rate limit nhi hona, seedha kaam krna h aaram se. 

Explain to me how? Integration is completed. The border filler and segmented decorations will now follow the animated fish body, which is generated adaptively from the IK skeleton each frame. I want to generalize this approach for any. For any IK chain. So suppose. And specific animal skeleton as a spine IK chain and we can define limb IK chains attached to specific joints of that spine like a chain, for example the shoulders and hip joint. Then. We can also define the length and width and the segment width of. The length the segment length and segment width of the limbs relative to the actual proportions we want for that particular animal skeleton. So how can we generalize this so that I can make a procedural like? Skeleton generator that can grow from any. Any joint, any segment joint of a chain. Recursively if I want to. Define a particular animal skeleton as. A spine chain of eight segments. In which the the in which on the second and 5th there is a Peck alectoral fin. And uh pectoralis and LEM limb or uh on the 3rd joint there. Is uh dorsal fin. So these dorsal fin and pectoral fin are also IK chains of less uh number of segments. Uh, or are proportionate length, uh proportionate proportionate to the main body of the. Of the fish. Yes. 

just keep believing in me nigga. implement a testing strategy too changing htmls

Our mvp codebase is at a very nice stage, now its about directing each task one by one managing push requests, 

there is parameterize chain properties that will let us do widthprofiles 

I have asked him and I to create a detailed. Fabric animation architecture plan. I now see that we can have joint constraints pull vectors for different types of like joints like hinge, ball etc. We need to figure out how to like make it work for a 2D based like animals. We have the pseudo code mostly ready. There's a. Let's see what what we have. Okay, so we'll generalize the fabric solver first then like which means applying ball constant inch constraint, constraint pole vector, backward pass, forward pass, etc. And then. Take the Refactor Creature JS to implement the IK for creature names. Right now the lizard link and animate will procedural one order 2IK. But we will now define true IK here. The function only sets the target, does not animate our chart actually come from the gate mode OK OK. So to move a limb forward suppose to move a lizard lamp forward or any to solve any IP chain there is a forward pass and backward pass forward passes basically for parts like spine or tail which follows the body's movement which follows the. Like the front load of a chain and backward pass. Are used on joints which are. Which are which stems from the root node like lizards. Like a lizard legs basically is trying to reach out the foot. The foot is trying to reach out. To a **** in front of it. And it is constrained by its root node. So the root nodes then follows. Basically that's the backward pass to move the. Then there is concept of pole vectors that will ensure that the elbow ankle joints like move as they should. So now we are not like, we are just. Calling a lizard like I can image, then we'll make our gate controller module. Gate controller is essentially the module that will help us achieve truly scalable and varied varied locomotion. For our animals to. This. Liquid cycles and like like it. It basically gives where the food placement will be. Take the food placement this gives and based on that the leg just animate by solving it like then we have to integrate the gate controller. And I think then we'll be done. The first let's do this, then we'll move on to diverse creatures. And try to do those, yes. Bye, bye. 

Ab coffee hogyi h, gaane lagate h thoda likhte h, 

OK so in my quest of making. Correct. Anatomically correct procedural skeletons with full inverse kinematic. Based motion and locomotion. I what what I did, I first started with making a fish. A fish. I was able to successfully place a fin and a tail at the joint. Off the chain of the spine of the fish, right, my. Next goal was to make a lizard out of it, for which I attempted to make. Chains joined from the spine spine chain and move them based on their realistic motion. Now I was able to like. I was able to add those chains wherever like on whichever joint of the chain I wanted, and I was also able to build a recursive creature builder, but. I soon realized that I. Soon realized that in order to achieve actual full. Invoice kinematics. I have to implement a lot of other things. Like forward, backward pass and hinge constraints, pole pole constants, whatever and a lot of other things which I found already implemented in a JavaScript library called Full IK currently. My attempt since last night was to make the lizard somehow work and through this I now know that my current implementation. Of. fabric.Js. Which has the fabric solver is incomplete also. The also I found out that the skeleton template that I'm using for building my creatures is not as extensible as it should be and it should be modeled as per the like full IK JavaScript library that we are going to implement. Now. We are not going to make the full fabric implementation from scratch anymore. We are going to use bone 2D.Js, chain 2D.Js. And join to the dot JS among the other two DSRC files in the full IK code base. Yes, now my goal should be to. First restructure the skeleton template and implement the full like full IK library. And yeah, basically, basically I should basically start from scratch, like implement the full IK library and. Make a single chain that is able to be rendered exactly with myWhen did exactly with my current styling of border JS, segment JS and filler JS. So we need to figure out. Where are current implementation is and how to restructure, refactor the whole? Creature JS and fabric JS to implement the skeleton structure and. Classes from the full IK library.


# 4 july


bas ab likh hi lo bhai. fish, biped, quadruped creatures, arbitary creature definition possible, correct joints. chain solving

help refine these raw thoughts into a refined detailed prompt in my own language

OK so the skinning system works, uh. By taking a function called width profile and attaching it to a chain. A chain is a set of bones. And a width function specifies the. Variation in width. Width along. A line basically along any path. So for any path T is equal to zero to T is equal to length one. The we can specify the width on both sides for. For that particular function answer. Will be called the width's profile. So at first initial. Plan of doing the skinning system was to take the skeleton. Uh. Take the chain data. Convert take the chain data, pass it. To theme manager which? Which takes the dimensions of that particular bone and sends it across to the. Shape Profile System. The shape profile system has templates already made for a lot of. A lot of these are limbs of these various creatures and depending on that shape profile the the shape of the limb gets made. But this approach is not going to work for us as it's going to be increasingly challenging for generating width profile for every animal that we encounter, so we want to move away from. This. We will have to do another approach for skinning our animals. Basically the underlying skeleton is made up of bones and those bones has also has joint constraints, These bones are the atoms of our system. We have to now imagine implementation in which along this chain of bones we draw circles of. Varying radius. Tracing a tangent outline along tracing an outline along the tangent of those circles will give us a curve on both sides. Of of any path, that curve is our shape. So for example if you are making a tapered tail which has 8 9 bones. So you'll start by drawing. Circles in decreasing. In decreasing radius from start to end these. Decreasing radius circles will have. Like tangents and we will connect those tangents to form. A connected line on both sides of this path. And this will become a shape. Now this now, because the bones and the chain itself moves, the tangent gets. Calculated every frame and gets updated so the shape or the skin formed on top of it is also procedural, so OK. We need strategies to help define various width of these various width profile or various. Radius for the circles that we are trying to draw now. Uh, I talked about our tail example. Similarly, if we are trying to make a horse torso so the major uh, like the the major body can be uh uh, broken down into. Three major forms, which is the torso, the pelvis and the shoulder girdle area these. Can be. These can also be three. Circles may be or a circle or circles. For the rib cage and pelvis only. Might also work, and a line connecting those will help us give that. Also maybe we can use the. Loomis model of Oval and a cuboid Oval and a cuboid for the chest and the pelvis Oval and a. Take it. Keep in mind that all our creatures are. On a 2D canvas, so we don't need. To think about how it will look dimensionally because. The outline is already changing on motion that in itself can denote. Like the Z index problem that you have in. 2D OK. 
Mujhe to likhna hi pdega kese pahuchu kese sochu ka koi alternative to h nhi na right, right baby. I love you. Ghar banana chahti h mere saath, ye dekho, beech m ye bhi nikal rha h to niklega kya krenge ye batao. Yahi h jo h. tum kro na, krna h kya tho.  

on my 2d skeletons the visual view is very cluttered and makes it hard to understand what behaviour is happening even. The skin shape profiles we are using just keep on. i am looking at refs, I know every limb consists of 4 bones only, the proportions in them vary only.I should first of all have a visually readable creature. Lines for bones, circles on all joints. All limbs different color like animals m h. Ab uske upar tumne skinning system integrate to krdia, but i dont think ki ye skinning system kaam krega, sure you need organic flowing forms to fill in, but they are moving, the movement itself mutates the form significantly and very beautiful. The power of anatomical accuracy I want to see. Ab aise dekhenge to i have been coding like i would draw creatures, because i know how to draw, gedture first, block shapes, refine forms, render. The skeleton i made gave structure, and motion provided gesture, thats a very nice way to put it tho, dont stop likhte rho.  Ek fish ka tail samjhaya tha mene upar, Like we draw, on a line draw decreasing in size circles, making line on both side connecting the tangent. For a horse torso, or another animal, the body is broken down into simple shapes, now on our 2d canvas, if you have two ovals for the chest and pelvis of the horse, through the spine chain. This simple model of ovals for torso and pelvis connected with the spine can be adapted to all. Now somehow if we are able to connect merge the moving 3 as one form that would be visually read as a whole body, that is moving, twisting with the skeleton. I was thinking of metaballs but hopefully there are better solution. Wha tis a metaball tho, it has something. There is a skeleton layer, lets call this layer made of simple shapes like circles, ellipses, cubes, triangles, trapezius depicting the main masses as the muscle layer. When we connect the muscle layer shapes to make unified forms to move as one and render as our style - thats the skin layer. We have to figure out how to break down and define these form shapes in order for them to be reusable on bones of different lengths, angle constrainsts. We dont need to go detailed on the muscle layer, but think of it as how artists draw. 

