//DB JSON-object containing presentations
let presentations = 
{
    presentations: [
        {},
        {},
        {}
    ]
};

//Single presentation
let presentation = 
{
    title: '',
    share: 0, //0: privat, 1: public, senere: 3: genererer unik delingslink?
    slides: [
        {},
        {},
        {}
    ]
};

//Single slide
let slide = 
{
    type: '1', //or 2 or 3
    text: '',
    image: ''
};

/* 

Endre databasen til å ha en presentasjon per entry???

Da får hver presentasjon sin unike ID => flere presentasjoner kan ha samme navn!

*/