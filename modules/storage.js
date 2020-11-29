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

    async editTitle(newTitle, id){
        const query = {
            text: 'UPDATE public.presentations SET title = $1 WHERE id = $2;',
            values: [newTitle, id]
        }

        let [result] = await this.runQueries([query], 'editTile');
        return result;
    }

    async updatePassword(newPassword, username){
        const query = {
            text: 'UPDATE public.users SET password = $1 WHERE username = $2;',
            values: [newPassword, username]
        }
        let [result] = await this.runQueries([query], 'updatePassword');
        return result;
    }

    /* REFACTORED */
    //Delete user and all their presentations!
    async deleteUser(username) {

        const queries = [
            {
                text: 'DELETE FROM public.presentations WHERE username = $1;',
                values: [username]
            },
            {
                text: 'DELETE FROM public.users WHERE username = $1',
                values: [username]
            }
        ]

        let result = await this.runQueries(queries, 'deleteUser');
        return result;
    }

    /* REFACTORED */
    //Get share state from database
    async getShareState(id) {
        const query = {
            text: 'SELECT share FROM public.presentations WHERE id = $1',
            values: [id]
        }

        let [result] = await this.runQueries([query], 'getShareState');
        if(result.rows.length === 0){
            return false;
        } else {
            return result.rows[0].share;
        }
        
    }

    /* REFACTORED */
    //Delete presentation
    async deletePresentation(id) {
        const query = {
            text: 'DELETE FROM public.presentations WHERE id = $1',
            values: [id]
        }

        let [result] = await this.runQueries([query], 'deletePresentation');
        return result;
    }

    /* REFACTORED */
    //Get all slides from a presentation
    async getSlides(presentation_id) {

        const query = {
            text: 'SELECT slides FROM public.presentations WHERE id = $1;',
            values: [presentation_id]
        }

        let [result] = await this.runQueries([query], 'getSlides');
        return result.rows;

    }

    //Get single slide from a presentation
    async getSlide(presentationID, slideID){
        let query = {
            text: 'SELECT slides FROM public.presentations WHERE id=$1',
            values: [presentationID]
        }

        let [result] = await this.runQueries([query], 'getSlide');
        for(let slide of result.rows[0].slides){
            slide = JSON.parse(slide);
            if(slide.id === parseInt(slideID)){
                return slide;
            }
        }
    }

    //Update a single slide
    async updateSlide(presentationID, slide){
        let presentation = await this.getPresentationFromID(presentationID);
        console.log('Storage');
       
        let oldSlides = presentation.slides;
        let newSlides = [];
        
        for(let oldSlide of oldSlides){
            oldSlide = JSON.parse(oldSlide);
            if(oldSlide.id === slide.id){
                newSlides.push(slide);
            } else {
                newSlides.push(oldSlide);
            }
        }
        
        let result = await this.updatePresentationSlides(presentationID, newSlides);
        return result;
    }

    /* REFACTORED */
    //Get all presentations for a user
    async getPresentations(username) {
        const query = {
            text: 'SELECT * FROM public.presentations WHERE username = $1 ORDER BY id;',
            values: [username]
        }

        let [result] = await this.runQueries([query], 'getPresentations');
        return result.rows;
    }

    /* REFACTORED */
    //Share/unshare presentation
    async sharePresentation(id, share) {
        const query = {
            text: 'UPDATE public.presentations SET share = $1 WHERE id = $2;',
            values: [share, id]
        }

        let [result] = await this.runQueries([query], 'sharePresentation');
        return result;
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

    /* REFACTORED */
    async changeSlides(newSlides, id) {
        const query = {
            text: 'UPDATE public.presentations SET slides = $1 WHERE id = $2;',
            values: [newSlides, id]
        }

        let [result] = await this.runQueries([query], 'changeSlides');
        return result;
    }

    /* REFACTORED */
    async getPresentationFromID(id) {
        const query = {
            text: 'SELECT * FROM public.presentations WHERE id = $1',
            values: [id]
        }

        let [result] = await this.runQueries([query],'getPresentationFromID');
        return result.rows[0];
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
        console.log(presentation);
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
            return 'ADDED';
        } else {
            return 'EXIST';
        }
    }

}

module.exports = Storage;