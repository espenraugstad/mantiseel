const pg = require('pg');

class Storage {

    constructor(credentials) {
        this.credentials = {
            connectionString: credentials,
            ssl: {
                rejectUnauthorized: false
            }
        };
    }

    async tryConnection(client) {
        try {
            await client.connect();
        } catch (err) {
            console.log(`Connection error: ${err}`);
            client.end();
            return err;
        }
    }

    //Get all slides from a presentation
    async getSlides(presentation_id){
        const client = new pg.Client(this.credentials);
        const query = {
            text: 'SELECT slides FROM public.presentations WHERE id = $1;',
            values: [presentation_id]
        }
        await this.tryConnection(client);

        try {
            let result = await client.query(query);
            client.end();
            return result.rows;
        } catch (err) {
            console.log(`Cannont get slides: ${err}`);
            client.end();
        }

    }

    //Get all presentations for a user
    async getPresentations(username){

        const client = new pg.Client(this.credentials);
        const query = {
            text: 'SELECT * FROM public.presentations WHERE username = $1;',
            values: [username]
        }
        await this.tryConnection(client);

        try {
            let result = await client.query(query);
            client.end();
            return result.rows;
        } catch (err) {
            console.log(`Cannont change share property of presentation: ${err}`);
            client.end();
        }
    }

    //Share/unshare presentation
    async sharePresentation(id, share) {
        const client = new pg.Client(this.credentials);
        const query = {
            text: 'UPDATE public.presentations SET share = $1 WHERE id = $2;',
            values: [share, id]
        }
        await this.tryConnection(client);

        try {
            let result = await client.query(query);
            client.end();
            return result;
        } catch (err) {
            console.log(`Cannont change share property of presentation: ${err}`);
            client.end();
        }

    }

    //Add slide to a presentation with a given id
    async createSlide(id, slide) {
        //Step 1: Get the presentation from the database 
        let presentation = await this.getPresentationFromID(id);

        //Step 2: Add the slide to the presentation
        presentation.slides.push(slide);
        

        //Step 3: Update the presentation in the database
        //update presentation updatePresentation(id, newTitle <String>, newShare <Number>, newSlides <Array>)
        let result = await this.changeSlides(presentation.slides, id);
        return result;
    }

    async changeSlides(newSlides, id) {
        const client = new pg.Client(this.credentials);

        const query = {
            text: 'UPDATE public.presentations SET slides = $1 WHERE id = $2;',
            values: [newSlides, id]
        }

        await this.tryConnection(client);

        try {
            let result = await client.query(query);
            client.end();
            return result;
        } catch (err) {
            console.log(`Update presentation failed: ${err}`);
        }

    }

    async getPresentationFromID(id) {
        const client = new pg.Client(this.credentials);
        const query = {
            text: 'SELECT * FROM public.presentations WHERE id = $1',
            values: [id]
        }

        await this.tryConnection(client);

        try {
            let result = await client.query(query);
            client.end();
            return result.rows[0];
        } catch (err) {
            console.log(`Get presentation error: ${err}`);
            client.end();
        }


    }

    
    //Add a new presentation based on username and presentation title. Returns presentation ID
    async addPresentation(username, presentation) {
        const client = new pg.Client(this.credentials);

        //Just add the presentation with the username as a new entry in the database
        const query = {
            text: 'INSERT INTO public.presentations (id, username, title, share, slides) VALUES (DEFAULT, $1, $2, $3, $4) RETURNING id',
            values: [username, presentation.title, presentation.share, presentation.slides]
        }

        //Connect to database
        try {

            await client.connect();
        } catch (err) {
            console.log(`Add presentation connection error: ${err}`);
        }

        //Query
        try {
            let result = await client.query(query);
            client.end();
            return result.rows[0].id;

        } catch (err) {
            console.log(`Add presentation query error: ${err}`);
            client.end();
        }
    }

    //Get information about a user based on username. Only returns password.
    async getUser(username) {
        const client = new pg.Client(this.credentials);

        try {
            await client.connect();

            const query = {
                text: 'SELECT * FROM public.users WHERE username = $1',
                values: [username]
            }

            try {

                let response = await client.query(query);
                client.end();
                return response.rows[0];

            } catch (err) {
                console.log(`Failed to retrieve user: ${err}`);
            }

        } catch (err) {
            console.log(`Get user connection failed: ${err}`);
        }

    }

    //Adds a user with a given username and password
    async addUser(username, password) {
        const client = new pg.Client(this.credentials);

        try {
            await client.connect();

            //Try to locate user in database
            const query1 = {
                text: 'SELECT * FROM public.users WHERE username = $1',
                values: [username]
            }

            try {

                let userFound = await client.query(query1);
                if (userFound.rows.length === 0) {
                    //User does NOT exist
                    //Add user to database
                    const query2 = {
                        text: 'INSERT INTO public.users (id, username, password) VALUES (DEFAULT, $1, $2);',
                        values: [username, password]
                    }

                    try {

                        let result = await client.query(query2);
                        client.end();
                        return { msg: 'User added.' };

                    } catch (err) {
                        console.log(`Add user failed: ${err}`);
                    }


                } else {
                    client.end();
                    return { msg: 'User already exists' }
                }


            } catch (err) {
                console.log(`Locating user failed: ${err}`);

            }

        } catch (err) {

            console.log(`User creation, connection error: ${err}`);

        }


    }

}

module.exports = Storage;