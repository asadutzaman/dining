const numberPattern = /[0-9]/;
const upperCasePattern = /[A-Z]/;
const lowerCasePattern = /[a-z]/;
const specialCharsPattern = /[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/;
const httpUrlPattern = /^\s*(http:\/\/)([a-z\d-]{1,63}\.)*[a-z\d-]{1,255}(.[a-z]{2,6}|:[0-9]{2,6})\s*/;
const httpsUrlPattern = /^\s*(https:\/\/)([a-z\d-]{1,63}\.)*[a-z\d-]{1,255}(.[a-z]{2,6}|:[0-9]{2,6})\s*/;

export default class ValidationPatternFunction {
    public isString = (value: any) => {
        return typeof value === 'string';
    }

    public hasMinLength = (value: any, length: any) => {
        return value.length >= length;
    }

    public hasSpecialChars = (value: any) => {
        return specialCharsPattern.test(value);
    }

    public hasUppercase = (value: any) => {
        return upperCasePattern.test(value);
    }

    public hasLowercase = (value: any) => {
        return lowerCasePattern.test(value);
    }

    public hasNumber = (value: any) => {
        return numberPattern.test(value);
    }

    public isValidHttpsUrl = (url: string) => {
        return httpsUrlPattern.test(url);
    }

    public isValidHttpUrl = (url: string) => {
        return httpUrlPattern.test(url);
    }

    public passwordMeter = (password: any) => {
        //It contains at least one uppercase English character
        let has_one_uppercase = this.hasUppercase(password);

        // It contains at least one special character. The special characters are: !@#$%^&*(
        let has_special_chars = this.hasSpecialChars(password);

        // Its length is at least 8.
        let has_min_length_8 = this.hasMinLength(password, 8);

        // It contains at least one digit.
        let has_one_digit = this.hasNumber(password);

        let three_necessary_conditions = has_one_uppercase && has_special_chars;

        // if (three_necessary_conditions && has_min_length_8[1] && has_one_digit) {
        //     return "Strong";
        // }

        // if (three_necessary_conditions && has_min_length_8[0] >= 6) {
        //     return "Moderate";
        // }
        return "weak";
    }

}