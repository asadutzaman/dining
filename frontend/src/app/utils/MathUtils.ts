export default class MathUtils {
    public limit = {
        B: 1,
        KB: 1024,
        MB: 1024 * 1024,
        GB: 1024 * 1024 * 1024,
    };

    public fixed = (number: any): string => {
        if (number === null || number === undefined || number === "") { return ''}
        return Number(number).toFixed(2);
    }

    public randomWithinRange = (min: number, max: number): number => {
        return Math.floor(Math.random() * (max - min) + min);
    }

    public getRandomColor = (): string => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    public toInt = (str: string[]) => {
        return str.map(s => parseInt(s, 10));
    }

    public formatByte = (byte: number) => {
        const {KB, MB, GB} = this.limit;
        let unit = "B";

        if (byte > GB) {
            unit = "GB";
        } else if (byte > MB) {
            unit = "MB";
        } else if (byte > KB) {
            unit = "KB";
        }
        return `${(byte / this.limit[unit]).toFixed(1)} ${unit}`;
    }

    public getUniqueNumber = (prefix: string) => {
        return prefix + Date.now() + ( (Math.random()*100000).toFixed());
    }

    public formatMoney = (amount) => {
        if (typeof (amount) === 'number') {
            return amount.toLocaleString();
        }
        return 'Invalid Amount';
    };

    public parseNumber = (value) => {
        if(value === '') return NaN;
        const number = Number(value);
        return Number.isInteger(number) ? number : NaN;
    };

    public getPercent = (total, percent) => {
        return Math.round((percent / 100) * total);
    };

    public progressPercent = (total, value) => {
        return Math.round(((value/total) * 100));
    }
}
