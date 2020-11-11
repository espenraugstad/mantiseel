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

    async addPresentation(username, presentation){
        const client = new pg.Client(this.credentials);

        try {
            await client.connect();

            const query = {
                text: 'INSERT INTO public.presentations (id, username, presentation) VALUES (DEFAULT, $1, $2);',
                values: [username, presentation]
            }

            try {
                console.log('Trying to query');
                let response = await client.query(query);
                console.log(response);
                client.end();
            } catch {
                console.log('Failed to add presentation to database');
            }

        } catch(err){
            console.log(`Create presentation connection failed ${err}`);
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