export const rules = {
    username: [
        { required: true, message: 'Please input your Username' }
    ],
    email: [
        { required: true, message: 'Please input your Email' }
    ],
    required: [
        { required: true, message: 'This field is required.' }
    ],
    password: [
        { required: true, message: 'Please input your password' },
        { min: 4, message: "password no less than 6" },
    ],
    user_captcha_token: [
        { required: true, message: 'Please enter Captcha token' }
    ],
};
