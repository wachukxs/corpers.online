
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
                city_town: '',
                email: '',
                createdAt: '2022-11-25T18:41:24.044Z',
                updatedAt: '2022-11-25T18:41:24.044Z',
                lga: '',
                stream: '',
                statecode: '',
                mediaId: 34,
                timeWithUs: '4 months',
                servicestate: '',
                _location: '',
                batch: '',
                pushSubscriptionStringified: 'text',
                ppaId: 5,
                password: '',
                middlename: '',
                firstname: '',
                lastname: '',
                email: '',
                wantspaornot: false,
                accommodationornot: true,
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