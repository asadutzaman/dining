import moment, { Moment } from 'moment';
import { addDays, subDays, addMonths } from "date-fns";
// import BanglaDateTimeUtils from './BanglaDateTimeUtils';

export const DATE_FORMAT_BANGLA = 'j F Y';
export const DATE_FORMAT = 'DD-MM-YYYY';
export const DATABASE_DATE_FORMAT = 'YYYY-MM-DD';
export const DATE_FORMAT_SECOND_FORMAT = 'DD-MMM-YYYY';
export const TIME_FORMAT = 'HH:mm';
export const DATE_TIME_FORMAT = 'dd-MM-yyyy HH:mm';
export const DATE_TIME_SECOND_FORMAT = 'DD-MM-YYYY hh:mm:ss';
export const DATE_TIME_FORMAT_A = 'DD-MM-YYYY hh:mm A';
export const DATE_YEAR_FORMAT = 'YYYY';

export default class DateTimeUtils {

    public momentCurrentDateTimeObject = () => {
        return moment();
    }

    public startOfDay = () => {
        return moment().startOf('day');
    }

    public zeroPadding = (number: number) => {
        return `${number}`.padStart(2, '0')
    }

    // currentDate
    public currentDate = (dateFormat: string = DATE_FORMAT) => {
        return this.formatDate(new Date(), dateFormat);
    }

    // currentTime
    public currentTime = () => {
        return this.formatTime(new Date());
    }

    // currentDateTime
    public currentDateTime = (dateFormat: string = DATE_TIME_FORMAT) => {
        return this.formatDateTime(new Date(), dateFormat);
    }

    // currentTimestamp
    public currentTimestamp = () => {
        return this.formatTimestamp(new Date());
    }

    // formatDate
    public formatDate = (date: Moment | Date | string, dateFormat: string = DATE_FORMAT) => {
        if (date === null || date === undefined) { return '' }
        if (typeof date === 'object' && 'format' in date) {
            return date.format(dateFormat);
        }
        return moment(date).format(dateFormat);
    }

    // formatTime
    public formatTime = (time: Moment | Date | string, timeFormat: string = TIME_FORMAT) => {
        if (time === null || time === undefined) { return '' }
        if (typeof time === 'object' && 'format' in time) {
            return time.format(timeFormat);
        }
        return moment(time).format(timeFormat);
    }

    // formatDateTime
    public formatDateTime = (time: Moment | Date | string, dateTimeFormat: string = DATE_TIME_FORMAT) => {
        if (time === null || time === undefined) { return '' }
        if (typeof time === 'object' && 'format' in time) {
            return time.format(dateTimeFormat);
        }
        return moment(time).format(dateTimeFormat);
    }

    public formatDateTimeSecond = (time: Moment | Date | string, dateTimeFormat: string = DATE_TIME_SECOND_FORMAT) => {
        if (time === null || time === undefined) { return '' }
        if (typeof time === 'object' && 'format' in time) {
            return time.format(dateTimeFormat);
        }
        return moment(time).format(dateTimeFormat);
    }


    public formatDateTimeA = (time: Moment | Date | string, dateTimeFormat: string = DATE_TIME_FORMAT_A) => {
        if (time === null || time === undefined) { return '' }
        if (typeof time === 'object' && 'format' in time) {
            return time.format(dateTimeFormat);
        }
        return moment(time).format(dateTimeFormat);
    }
    public formatDateTimeB = (time: Moment | Date | string, dateTimeFormat: string = DATE_FORMAT_SECOND_FORMAT) => {
        if (time === null || time === undefined) { return '' }
        if (typeof time === 'object' && 'format' in time) {
            return time.format(dateTimeFormat);
        }
        return moment(time).format(dateTimeFormat);
    }
    // formatTimestamp
    public formatTimestamp = (date: Date | string) => {
        if (date === null || date === undefined) { return '' }
        if (date instanceof Date) {
            return date.valueOf();
        }
        else {
            const tempDate = new Date(date);
            return tempDate.valueOf();
        }
    }

    // Time Range
    public formatTimeRange = (start: Date | string, end: Date | string) => {
        return `${this.formatTime(start)} ~ ${this.formatTime(end)}`
    }

    public convertStringToDate = (date: Moment | Date | string | any) => {
        if (date === '' || date === undefined || date === null) {
            return null;
        }
        let stringToDate = moment(date);
        return stringToDate['_d'] == 'Invalid Date' ? null : stringToDate;
    }

    public convertStringToYear = (date: Moment | Date | string) => {
        //let stringToYear = moment(date).format('YYYY')
        let stringToYear = moment().year(Number(date));
        return stringToYear['_d'] == 'Invalid Year' ? null : stringToYear;
    }

    public convertStringToYearGrid = (date: Moment | Date | string) => {
        let stringToYear = moment(date).format('YYYY')
        // let stringToYear = moment().year(Number(date));
        return stringToYear['_d'] == 'Invalid Year' ? null : stringToYear;
    }

    // compareDate
    public compareDate = (curTime: Date, destTime: Date) => {

    }

    public addDays = (days: any, dateFormat: string = DATE_FORMAT) => {
        if (days === null || days === undefined) { return '' }

        const today = new Date();
        const date = addDays(today, days);
        return moment(date).format(dateFormat);
    }

    public subDays = (days: any, dateFormat: string = DATE_FORMAT) => {
        if (days === null || days === undefined) { return '' }

        const today = new Date();
        const date = subDays(today, days);
        return moment(date).format(dateFormat);
    }

    public timeDuration = (d: Date | string): any => {
        const seconds = Math.floor(Math.abs(new Date().getTime() - new Date(d).getTime()) / 1000);
        const year = Math.floor(seconds / 31536000);
        const month = Math.floor(seconds / 2592000);
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor(seconds / 60);

        return {
            year: year,
            month: month,
            days: days,
            hours: hours,
            minutes: minutes,
            seconds: seconds,
        };
    }

    // timeAgo
    public timeAgo = (date: Date | string) => {
        if (date == null) { return '' }
        const { days, hours, minutes, seconds } = this.timeDuration(date);

        if (days > 3) {
            return this.formatDate(date);
        }

        if (days > 0 && days <= 3) {
            return `${days} days ago`;
        }

        if (days <= 0 && hours > 0) {
            return `${hours} hours ago`;
        }

        if (hours <= 0 && minutes > 0) {
            return `${minutes} mints ago`;
        }

        if (seconds < 60 && seconds > 0) {
            return `${seconds} seconds ago`;
        }

        return '';
    }

    public daysAgo = (date: Date | string) => {
        if (date == null) { return '' }
        const { days, hours, minutes, seconds } = this.timeDuration(date);

        if (days > 0) {
            return `${days} days ago`;
        }

        if (days <= 0 && hours > 0) {
            return `${hours} hours ago`;
        }

        if (hours <= 0 && minutes > 0) {
            return `${minutes} mints ago`;
        }

        if (seconds < 60 && seconds > 0) {
            return `${seconds} seconds ago`;
        }

        return '';
    }

    public diffDays = (startDate: Date | string, endDate: Date | string) => {
        var now = moment(startDate);
        var end = moment(endDate);
        var duration = moment.duration(now.diff(end));
        var days = duration.asDays();
        return days
    }

    public ageCalculation = (birthDate: Date | string) => {
        var now = new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        var yearNow = now.getFullYear();
        var monthNow = now.getMonth();
        var dateNow = now.getDate();

        var days = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
        var months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

        var ddd = months[new Date(birthDate).getMonth()] + "/" + days[new Date(birthDate).getDate() - 1] + "/" + new Date(birthDate).getFullYear();

        var firstsubString = Number(ddd.toString().substring(6, 10));
        var secondsubString = Number(ddd.toString().substring(0, 2)) - 1;
        var thirdsubString = Number(ddd.toString().substring(3, 5));

        var dob = new Date(firstsubString, secondsubString, thirdsubString);

        var yearDob = dob.getFullYear();
        var monthDob = dob.getMonth();
        var dateDob = dob.getDate();
        var age = {};
        var ageString = "";
        var yearString = "";
        var monthString = "";
        var dayString = "";


        let yearAge = yearNow - yearDob;

        if (monthNow >= monthDob)
            var monthAge = monthNow - monthDob;
        else {
            yearAge--;
            var monthAge = 12 + monthNow - monthDob;
        }

        if (dateNow >= dateDob)
            var dateAge = dateNow - dateDob;
        else {
            monthAge--;
            var dateAge = 31 + dateNow - dateDob;

            if (monthAge < 0) {
                monthAge = 11;
                yearAge--;
            }
        }

        age = {
            years: yearAge,
            months: monthAge,
            days: dateAge
        };

        if (age['years'] > 1) yearString = " years";
        else yearString = " year";
        if (age['months'] > 1) monthString = " months";
        else monthString = " month";
        if (age['days'] > 1) dayString = " days";
        else dayString = " day";


        if ((age['years'] > 0) && (age['months'] > 0) && (age['days'] > 0))
            ageString = age['years'] + yearString + ", " + age['months'] + monthString + ", and " + age['days'] + dayString + ".";
        else if ((age['years'] == 0) && (age['months'] == 0) && (age['days'] > 0))
            ageString = "Only " + age['days'] + dayString + ".";
        else if ((age['years'] > 0) && (age['months'] == 0) && (age['days'] == 0))
            ageString = age['years'] + yearString + " old. Happy Birthday!!";
        else if ((age['years'] > 0) && (age['months'] > 0) && (age['days'] == 0))
            ageString = age['years'] + yearString + " and " + age['months'] + monthString + ".";
        else if ((age['years'] == 0) && (age['months'] > 0) && (age['days'] > 0))
            ageString = age['months'] + monthString + " and " + age['days'] + dayString + ".";
        else if ((age['years'] > 0) && (age['months'] == 0) && (age['days'] > 0))
            ageString = age['years'] + yearString + " and " + age['days'] + dayString + ".";
        else if ((age['years'] == 0) && (age['months'] > 0) && (age['days'] == 0))
            ageString = age['months'] + monthString + ".";
        else ageString = "Oops! Could not calculate age!";

        return ageString;


        // var age;
        // var dob = new Date(birthDate);
        // if (dob != undefined) {
        //     var todayDate = new Date();
        //     var ageyear = todayDate.getFullYear() - dob.getFullYear();
        //     var agemonth = todayDate.getMonth() - dob.getMonth();
        //     var ageday = (todayDate.getDate() - dob.getDate());

        //     if (agemonth < 0) {
        //         ageyear--;
        //         agemonth = 12 - 1;
        //         //agemonth = (12 + agemonth);
        //     }
        //     if (ageday < 0) {
        //        // ageyear--;
        //         agemonth = 12 - 1;
        //         ageday = 31 + ageday ;
        //     }
        //     if (agemonth == 12) {
        //         ageyear = ageyear + 1;
        //         agemonth = 0;
        //     }

        //     age = ageyear + ' Year, ' + agemonth + ' Month, ' + ageday + ' Day';
        //   return age;
        // }
    }

    public ageCalculationDetails = (birthDate: Date | string, fromDate: Date | string) => {
        var now = new Date(fromDate);
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        var yearNow = now.getFullYear();
        var monthNow = now.getMonth();
        var dateNow = now.getDate();

        var days = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
        var months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

        var ddd = months[new Date(birthDate).getMonth()] + "/" + days[new Date(birthDate).getDate() - 1] + "/" + new Date(birthDate).getFullYear();

        var firstsubString = Number(ddd.toString().substring(6, 10));
        var secondsubString = Number(ddd.toString().substring(0, 2)) - 1;
        var thirdsubString = Number(ddd.toString().substring(3, 5));

        var dob = new Date(firstsubString, secondsubString, thirdsubString);

        var yearDob = dob.getFullYear();
        var monthDob = dob.getMonth();
        var dateDob = dob.getDate();
        var age = {};
        var ageString = "";
        var yearString = "";
        var monthString = "";
        var dayString = "";


        let yearAge = yearNow - yearDob;

        if (monthNow >= monthDob)
            var monthAge = monthNow - monthDob;
        else {
            yearAge--;
            var monthAge = 12 + monthNow - monthDob;
        }

        if (dateNow >= dateDob)
            var dateAge = dateNow - dateDob;
        else {
            monthAge--;
            var dateAge = 31 + dateNow - dateDob;

            if (monthAge < 0) {
                monthAge = 11;
                yearAge--;
            }
        }

        age = {
            years: yearAge,
            months: monthAge,
            days: dateAge
        };

        if (age['years'] > 1) yearString = " years";
        else yearString = " year";
        if (age['months'] > 1) monthString = " months";
        else monthString = " month";
        if (age['days'] > 1) dayString = " days";
        else dayString = " day";


        if ((age['years'] > 0) && (age['months'] > 0) && (age['days'] > 0))
            ageString = age['years'] + yearString + ", " + age['months'] + monthString + ", and " + age['days'] + dayString + ".";
        else if ((age['years'] == 0) && (age['months'] == 0) && (age['days'] > 0))
            ageString = "Only " + age['days'] + dayString + ".";
        else if ((age['years'] > 0) && (age['months'] == 0) && (age['days'] == 0))
            ageString = age['years'] + yearString + " old. Happy Birthday!!";
        else if ((age['years'] > 0) && (age['months'] > 0) && (age['days'] == 0))
            ageString = age['years'] + yearString + " and " + age['months'] + monthString + ".";
        else if ((age['years'] == 0) && (age['months'] > 0) && (age['days'] > 0))
            ageString = age['months'] + monthString + " and " + age['days'] + dayString + ".";
        else if ((age['years'] > 0) && (age['months'] == 0) && (age['days'] > 0))
            ageString = age['years'] + yearString + " and " + age['days'] + dayString + ".";
        else if ((age['years'] == 0) && (age['months'] > 0) && (age['days'] == 0))
            ageString = age['months'] + monthString + ".";
        else ageString = "Oops! Could not calculate age!";

        return ageString;


        // var age;
        // var dob = new Date(birthDate);
        // if (dob != undefined) {
        //     var todayDate = new Date();
        //     var ageyear = todayDate.getFullYear() - dob.getFullYear();
        //     var agemonth = todayDate.getMonth() - dob.getMonth();
        //     var ageday = (todayDate.getDate() - dob.getDate());

        //     if (agemonth < 0) {
        //         ageyear--;
        //         agemonth = 12 - 1;
        //         //agemonth = (12 + agemonth);
        //     }
        //     if (ageday < 0) {
        //        // ageyear--;
        //         agemonth = 12 - 1;
        //         ageday = 31 + ageday ;
        //     }
        //     if (agemonth == 12) {
        //         ageyear = ageyear + 1;
        //         agemonth = 0;
        //     }

        //     age = ageyear + ' Year, ' + agemonth + ' Month, ' + ageday + ' Day';
        //   return age;
        // }
    }

    public getAgeDetails = (birthDate: Date | string, fromDate: Date | string) => {
        var now = new Date(fromDate);
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        var yearNow = now.getFullYear();
        var monthNow = now.getMonth();
        var dateNow = now.getDate();

        var days = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
        var months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

        var ddd = months[new Date(birthDate).getMonth()] + "/" + days[new Date(birthDate).getDate() - 1] + "/" + new Date(birthDate).getFullYear();

        var firstsubString = Number(ddd.toString().substring(6, 10));
        var secondsubString = Number(ddd.toString().substring(0, 2)) - 1;
        var thirdsubString = Number(ddd.toString().substring(3, 5));

        var dob = new Date(firstsubString, secondsubString, thirdsubString);

        var yearDob = dob.getFullYear();
        var monthDob = dob.getMonth();
        var dateDob = dob.getDate();
        var age = {
            years: 0,
            months: 0,
            days: 0
        };

        let yearAge = yearNow - yearDob;

        if (monthNow >= monthDob)
            var monthAge = monthNow - monthDob;
        else {
            yearAge--;
            var monthAge = 12 + monthNow - monthDob;
        }

        if (dateNow >= dateDob)
            var dateAge = dateNow - dateDob;
        else {
            monthAge--;
            var dateAge = 31 + dateNow - dateDob;

            if (monthAge < 0) {
                monthAge = 11;
                yearAge--;
            }
        }

        age = {
            years: yearAge,
            months: monthAge,
            days: dateAge
        };
        return age;
    }

    public getAgeYear = (birthDate: Date | string) => {
        var dob = new Date(birthDate);
        if (dob != undefined) {
            var todayDate = new Date();
            var ageyear = todayDate.getFullYear() - dob.getFullYear();

            return ageyear;
        }
    }

    public addMonthToDate = (date: Date | string, numberOfMonths: any, dateFormat: string = DATE_FORMAT) => {
        const startDate = new Date(date); // January 1, 2022
        const endDate = addMonths(startDate, numberOfMonths); // April 1, 2022
        return moment(endDate).format(dateFormat);
    }

    // public getCurrentDateInBanglaCalendar = (date: any = new Date(), dateFormat: string = DATE_FORMAT_BANGLA) => {
    //     if(!date) {
    //         return "";
    //     }
    //     return new BanglaDateTimeUtils(date).convert(dateFormat);
    // }
}
