const path = require('path');
const _FILENAME = path.basename(__filename);

const Joi = require('joi');


module.exports.joinWaitListDataValidation = (req, res, next) => {
    const _FUNCTIONNAME = 'joinWaitListDataValidation'
    console.log('hitting', _FILENAME, _FUNCTIONNAME);

    const waitListSchema = Joi.object({
        first_name: Joi.string()
            .label('First name')
            .min(2)
            .max(70)
            .required(),
        email: Joi.string()
            .label('Email')
            .email({ minDomainSegments: 2 }).required(),
        serving_state: Joi.string()
            .label('Serving state')
            .required(),
        comment: Joi.string().label('Comment').allow(''),
        last_name: Joi.string().label('Last name').allow(''),
        middle_name: Joi.string().label('Middle name').allow(''),
    })

    const { error, value } = waitListSchema.validate(req.body);
    if (error) {
        res.status(400).json({
            message: 'There is an issue with the data you provided',
            error
        })
    } else {
        next()
    }
}

module.exports.corpMemberSignUp = (req, res, next) => {
    const _FUNCTIONNAME = 'corpMemberSignUp'
    console.log('hitting', _FILENAME, _FUNCTIONNAME);

    const waitListSchema = Joi.object({
        /// we don't need these on registration - to make for easier registration
        // first_name: Joi.string()
        //     .min(2)
        //     .max(70)
        //     .required(),
        // last_name: Joi.string()
        //     .min(2)
        //     .max(70)
        //     .required(),
        // middle_name: Joi.string()
        //     .min(2)
        //     .max(70)
        //     .optional(),
        email: Joi.string()
            .email({ minDomainSegments: 2 }).required(),
        password: Joi.string().required(),
        remember: Joi.string().optional().allow(''),
        state_code: Joi.string().required(),
    })

    const { error, value } = waitListSchema.validate(req.body);
    if (error) {
        res.status(400).json({
            message: 'There is an issue with the data you provided',
            error
        })
    } else {
        next()
    }
}

module.exports.corpMemberLogin = (req, res, next) => {
    const _FUNCTIONNAME = 'corpMemberSignUp'
    console.log('hitting', _FILENAME, _FUNCTIONNAME);

    const waitListSchema = Joi.object({
        username: Joi.string()
            .min(2)
            .max(70)
            .required(),
        password: Joi.string().required(),
    })

    const { error, value } = waitListSchema.validate(req.body);
    if (error) {
        res.status(400).json({
            message: 'There is an issue with the data you provided',
            error
        })
    } else {
        next()
    }
}

module.exports.corpMemberProfileUpdate = (req, res, next) => {
    const _FUNCTIONNAME = 'corpMemberProfileUpdate'
    console.log('hitting', _FILENAME, _FUNCTIONNAME);

    const profileUpdateSchema = Joi.object({
        service_state: Joi.string().required(),
        lga: Joi.string().optional().allow(null),
        city_or_town: Joi.string().optional().allow(null),
        stream: Joi.string().optional().allow(null),
        public_profile: Joi.boolean().optional().allow(null),
        nickname: Joi.string().optional().allow(null),
        bio: Joi.string().allow(null),
        ppa_name: Joi.string().allow(null),
        type_of_institution: Joi.string().allow(null),
        ppa_address: Joi.string().allow(null),
        ppa_directions: Joi.string().allow(null),
        origin_state: Joi.string().allow(null),
        where_they_found_accommodation: Joi.string().allow(null),
        origin_city_or_town: Joi.string().allow(null),
        want_spa_or_not: Joi.boolean().allow(null),
        looking_for_accommodation_or_not: Joi.boolean().allow(null),
    })

    const { error, value } = profileUpdateSchema.validate(req.body);
    if (error) {
        res.status(400).json({
            message: 'There is an issue with the data you provided',
            error
        })
    } else {
        next()
    }
}