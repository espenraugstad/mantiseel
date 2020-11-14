const pg = require('pg');

class Storage {

    constructor(credentials){
        this.credentials = {
            connectionString: credentials,
            ssl: {
                rejectUnauthorized: false
            }
        };
    }

    async getPresentations(username){
        const client = new pg.Client(this.credentials);
        const query = {
            text: 'SELECT * FROM public.presentations WHERE username = $1',
            values: [username]
        }

        try{
            await client.connect();
        } catch(err){
            console.log(`Get presentation connection error: ${err}`);
            client.end();
            return err;
        }

        try{
            let response = await client.query(query);
            return [response.rows[0].id, response.rows[0].presentations];
        } catch(err){
            console.log(`Get presentation query error: ${err}`);
            client.end();
        }
    }

    async getUser(username){
        const client = new pg.Client(this.credentials);

        try {
            await client.connect();

            const query = {
                text: 'SELECT * FROM public.users WHERE username = $1',
                values: [username]
            }

            try {

                let response = await client.query(query);
                client.end();
                return response.rows[0];

            } catch (err){
                console.log(`Failed to retrieve user: ${err}`);
            }

        } catch (err){
            console.log(`Get user connection failed: ${err}`);
        }

    }

    async addPresentation(username, presentation){
        const client = new pg.Client(this.credentials);

        //1. Find user and get presentations (an array)
        
        let [id, presentations] = await this.getPresentations(username);
        
        if(presentations instanceof Error){
            return presentations.message;
        } else {
            //2. Add current presentation to presentationsarray (push)
            presentations.presentations.push(presentation);
        }
        
        //3. Update entry in database
        // updatePresentation(username, presentationArray)
        try {
            await client.connect();

            const query = {
                text: 'UPDATE public.presentations SET presentations = $1 WHERE id = $2;',
                values: [presentations, id]
            }

            try {
                console.log('Trying to query');
                console.log(presentations);
                let response = await client.query(query);
                console.log(response);
                client.end();
            } catch (err){
                console.log(`Failed to add presentation to database: ${err}`);
            }

        } catch(err){
            console.log(`Create presentation connection failed ${err}`);
        }
    }

    

    async addUser(username, password){
        const client = new pg.Client(this.credentials);

        try {
            await client.connect();

            //Try to locate user in database
            const query1 = {
                text: 'SELECT * FROM public.users WHERE username = $1',
                values: [username]
            }

            try{

                let userFound = await client.query(query1);
                if (userFound.rows.length === 0){
                    //User does NOT exist
                    //Add user to database
                    const query2 = {
                        text: 'INSERT INTO public.users (id, username, password) VALUES (DEFAULT, $1, $2);',
                        values: [username, password]
                    }

                    try {

                        let result = await client.query(query2);
                        client.end();
                        return {msg: 'User added.'};

                    } catch (err){
                        console.log(`Add user failed: ${err}`);
                    }


                } else {
                    client.end();
                    return {msg: 'User already exists'}
                }
                

            } catch (err){
                console.log(`Locating user failed: ${err}`);

            }

        } catch(err){
            
            console.log(`User creation, connection error: ${err}`);
        
        }

        
    }

}

module.exports = Storage;