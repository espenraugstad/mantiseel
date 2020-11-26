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

    async runQueries(queries, caller){
        //queries: array of queries
        //caller: name of the function in which this function is called

        //Create a new client
        const client = new pg.Client(this.credentials);

        //Connect to database
        try {
            await client.connect();
        } catch (err) {
            console.log(`Connection error from ${caller}: ${err}`);
            client.end();
            return err;
        }

        //Run queries and store results in results-array
        let results = [];
        for(let query of queries){
            try{
                let result = await client.query(query);
                results.push(result);
            } catch (err){
                console.log(`Query error from ${caller}: ${err}`);
                client.end();
                return err;
            }
        }
        client.end();
        return results;
    }

    //Delete user and all their presentations!
    async deleteUser(username) {
        const client = new pg.Client(this.credentials);

        const query1 = {
            text: 'DELETE FROM public.presentations WHERE username = $1;',
            values: [username]
        };

        const query2 = {
            text: 'DELETE FROM public.users WHERE username = $1',
            values: [username]
        }

        //Connect to database
        try {
            await client.connect();
        } catch (err) {
            console.log(`Delete user connection error: ${err}`);
        }

        //Query
        try {
            let result1 = await client.query(query1);
            let result2 = await client.query(query2);
            client.end();
            return [result1,result2];

        } catch (err) {
            console.log(`Delete user query error: ${err}`);
            client.end();
        }
    }

    //Get share state from database
    async getShareState(id) {
        const client = new pg.Client(this.credentials);

        const query = {
            text: 'SELECT share FROM public.presentations WHERE id = $1',
            values: [id]
        }

        //Connect to database
        try {
            await client.connect();
        } catch (err) {
            console.log(`Delete presentation connection error: ${err}`);
        }

        //Query
        try {
            let result = await client.query(query);
            client.end();
            return result.rows[0].share;

        } catch (err) {
            console.log(`Delete presentation query error: ${err}`);
            client.end();
        }
    }

    //Delete presentation
    async deletePresentation(id) {
        const client = new pg.Client(this.credentials);

        //Just add the presentation with the username as a new entry in the database
        const query = {
            text: 'DELETE FROM public.presentations WHERE id = $1',
            values: [id]
        }

        //Connect to database
        try {

            await client.connect();
        } catch (err) {
            console.log(`Delete presentation connection error: ${err}`);
        }

        //Query
        try {
            let result = await client.query(query);
            client.end();
            return result;

        } catch (err) {
            console.log(`Delete presentation query error: ${err}`);
            client.end();
        }
    }

    //Get all slides from a presentation
    async getSlides(presentation_id) {
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
    async getPresentations(username) {
        const client = new pg.Client(this.credentials);
        const query = {
            text: 'SELECT * FROM public.presentations WHERE username = $1 ORDER BY id;',
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

    async deleteSlide(presentation_id, slide_id) {
        let presentation = await this.getPresentationFromID(presentation_id);

        let newSlides = presentation.slides.filter(slide => {
            return JSON.parse(slide).id !== slide_id
        });

        let result = await this.updatePresentationSlides(presentation_id, newSlides);
        return result;
    }

    /* REFACTORED */
    async updatePresentationSlides(presentation_id, newSlides) {
        const query = {
            text: 'UPDATE public.presentations SET slides = $1 WHERE id = $2;',
            values: [newSlides, presentation_id]
        }

        let [result] = await this.runQueries([query],'updatePresentationSlides');
        return result;
    }

    /* REFACTORED */
    //Add a new presentation based on username and presentation title. Returns presentation ID
    async addPresentation(username, presentation) {
        //Just add the presentation with the username as a new entry in the database
        const query = {
            text: 'INSERT INTO public.presentations (id, username, title, share, slides) VALUES (DEFAULT, $1, $2, $3, $4) RETURNING id',
            values: [username, presentation.title, presentation.share, presentation.slides]
        }

        let results = await this.runQueries([query], 'addPresentation');
        return results[0].rows[0].id;
    }

    /* REFACTORED */
    //Get information about a user based on username. Only returns password.
    async getUser(username) {
        const query = {
            text: 'SELECT password FROM public.users WHERE username = $1',
            values: [username]
        }

        let [response] = await this.runQueries([query], 'getUser');
        return response.rows[0]; 
    }

    /* REFACTORED */
    //Adds a user with a given username and password
    async addUser(username, password) {
        let query = {
            text: 'SELECT * FROM public.users WHERE username = $1',
            values: [username]
        }

        let [userFound] = await this.runQueries([query], 'addUser');

        if(userFound.rows.length === 0){
            query = {
                text: 'INSERT INTO public.users (id, username, password) VALUES (DEFAULT, $1, $2);',
                values: [username, password]
            }
            await this.runQueries([query],'addUser');
            return { msg: 'User added.' };
        } else {
            return { msg: 'User already exists' };
        }
    }

}

module.exports = Storage;