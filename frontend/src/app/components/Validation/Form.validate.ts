export const rules = {
    required: [
        { required: true, message: 'This field is required.' }
    ],
    notRequired: [
        { required: false }
    ],
    requiredMaxCharacter255: [
        { required: true, message: 'This field is required.' },
        { max: 255, message: 'Maximum character is 255' }
    ],
    maxCharacter255: [
        { max: 255, message: 'Maximum character is 255' }
    ],
    requiredMaxCharacter200: [
        { required: true, message: 'This field is required.' },
        { max: 255, message: 'Maximum character is 255' }
    ],
    maxCharacter200: [
        { max: 200, message: 'Maximum character is 200' }
    ],
    requiredMaxCharacter100: [
        { required: true, message: 'This field is required.' },
        { max: 100, message: 'Maximum character is 100' }
    ],
    maxCharacter100: [
        { max: 100, message: 'Maximum character is 100' }
    ],
    maxCharacter50: [
        { max: 50, message: 'Maximum character is 50' }
    ],
    requiredMaxCharacter50: [
        { required: true, message: 'This field is required.' },
        { max: 50, message: 'Maximum character is 50' }
    ],
    requiredMaxCharacter25: [
        { required: true, message: 'This field is required.' },
        { max: 25, message: 'Maximum character is 25', }
    ],
    maxCharacter25: [
        { max: 25, message: 'Maximum character is 25' }
    ],
    maxCharacter11Number: [
        { pattern: /^[0-9]{0,11}$/, message: 'Maximum character is 11 & only number' }
    ],
    requiredMaxCharacter11Number: [
        { required: true, message: 'This field is required.' },
        { pattern: /^[0-9]{0,11}$/, message: 'Maximum character is 11 & only number' }
    ],
    maxCharacter17Number: [
        { pattern: /^[0-9]{0,17}$/, message: 'Maximum character is 17 & only number' }
    ],
    emailMaxCharacter100: [
        { type: 'email', message: 'Provide valid email' },
        { max: 100, message: 'Maximum character is 100' }
    ],
    requiredEmailMaxCharacter100: [
        { type: 'email', message: 'Provide valid email' },
        { required: true, message: 'This field is required.' },
        { max: 100, message: 'Maximum character is 100' }
    ],
    maxCharacter511: [
        { max: 511, message: 'Maximum character is 511' }
    ],
    requiredMaxCharacter511: [
        { required: true, message: 'This field is required.' },
        { max: 511, message: 'Maximum character is 511' }
    ],

    maxCharacter1500: [
        { max: 1500, message: 'Maximum character is 1500' }
    ],
    maxCharacter1000: [
        { max: 1000, message: 'Maximum character is 1000' }
    ],
    maxCharacter4Number: [
        { pattern: /^[0-9]{0,4}$/, message: 'Maximum character is 4 & only number' }
    ],
    requiredMaxCharacter4Number: [
        { required: true, message: 'This field is required.' },
        { pattern: /^[0-9]{0,4}$/, message: 'Maximum character is 4 & only number' }
    ],
    requiredMaxCharacter17Number: [
        { required: true, message: 'This field is required.' },
        { pattern: /^[0-9]{0,17}$/, message: 'Maximum character is 17 & only number' }
    ],
    emailMaxCharacter64: [
        { type: 'email', message: 'Provide valid email' },
        { max: 64, message: 'Maximum character is 64' }
    ],
    requiredEmailMaxCharacter64: [
        { type: 'email', message: 'Provide valid email' },
        { required: true, message: 'This field is required.' },
        { max: 64, message: 'Maximum character is 64' }
    ],
    requiredMaxCharacter500: [
        { required: true, message: 'This field is required.' },
        { max: 500, message: 'Maximum character is 500' }
    ],
    maxCharacter500: [
        { max: 500, message: 'Maximum character is 500' }
    ],
    requiredNoSpace: [
        { required: true, message: 'This field is required.' },
        { pattern: /^\S*$/, message: 'No Space Allow' }
    ]

};
