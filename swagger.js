
const swaggerAutognerator = require('swagger-autogen')();

try {
    // Get port from environment and store in Express.
    const port = parseInt(process.env.PORT, 10) || parseInt(process.env.LOCAL_PORT, 10) || 3051
    const doc = {
        info: {
            title: 'corpers.online API',
            description: 'Swagger documentation of our API endpoints.',
        },
        host: `localhost:${port}`,
        schemes: ['http', 'https'],
        definitions: {

            CorpMember: {
                id: 1,
                travel_from_city: '',
                travel_from_state: '',
                accommodation_location: '', // needs to change!! put in location model
                region_street: '',
                city_or_town: '',
                email: '',
                created_at: '2022-11-25T18:41:24.044Z',
                updated_at: '2022-11-25T18:41:24.044Z',
                lga: '',
                stream: '',
                state_code: '',
                media_id: 34,
                time_with_us: '4 months',
                service_state: '',
                _location: '',
                batch: '',
                push_subscription_stringified: 'text',
                ppa_id: 5,
                password: '',
                middle_name: '',
                first_name: '',
                last_name: '',
                email: '',
                want_spa_or_not: false,
                looking_for_accommodation_or_not: true,
                public_profile: false,
                bio: 'text',
            },
        }
    };


    const outputFile = './swagger-output.json';
    const endpointsFiles = ['./web/app.js'];

    swaggerAutognerator(outputFile, endpointsFiles, doc);

} catch (error) {
    console.error('Error generating doc', error);
}