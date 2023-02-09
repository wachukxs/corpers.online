const path = require('path');
const _FILENAME = path.basename(__filename);

const Joi = require('joi');


module.exports.joinWaitListDataValidation = (req, res, next) => {
    const _FUNCTIONNAME = 'joinWaitListDataValidation'
    console.log('hitting', _FILENAME, _FUNCTIONNAME);

    const waitListSchema = Joi.object({
        firstname: Joi.string()
            .min(2)
            .max(70)
            .required(),
        email: Joi.string()
            .email({ minDomainSegments: 2 }).required(),
        servingstate: Joi.string()
            .required(),
        comment: Joi.string().allow(''),
        lastname: Joi.string().allow(''),
        middlename: Joi.string().allow(''),
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
        firstname: Joi.string()
            .min(2)
            .max(70)
            .required(),
        lastname: Joi.string()
            .min(2)
            .max(70)
            .required(),
        middlename: Joi.string()
            .min(2)
            .max(70)
            .optional(),
        email: Joi.string()
            .email({ minDomainSegments: 2 }).required(),
        password: Joi.string().required(),
        remember: Joi.string().allow(''),
        statecode: Joi.string().required(),
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