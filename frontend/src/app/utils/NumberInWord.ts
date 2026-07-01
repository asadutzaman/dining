export default class NumberInWord {
    public render = (n:any) => {
        if (n < 0)
          return false;
         let single_digit = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
         let double_digit = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
         let below_hundred = ['Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
        if (n === 0) return 'Zero'
        function translate(n) {
            let word = ""
            if (n < 10) {
                word = single_digit[n] + ' '
            }
            else if (n < 20) {
                word = double_digit[n - 10] + ' '
            }
            else if (n < 100) {
                let rem = translate(n % 10)
                word = below_hundred[(n - n % 10) / 10 - 2] + ' ' + rem
            }
            else if (n < 1000) {
                word = single_digit[Math.trunc(n / 100)] + ' Hundred ' + translate(n % 100)
            }
            else if (n < 1000000) {
                let tt:any = n / 1000;
                word = translate(parseInt(tt)).trim() + ' Thousand ' + translate(n % 1000)
            }
            else if (n < 1000000000) {
                let tt:any = n / 1000000;
                word = translate(parseInt(tt)).trim() + ' Million ' + translate(n % 1000000)
            }
            else {
                let tt:any = n / 1000000000;
                word = translate(parseInt(tt)).trim() + ' Billion ' + translate(n % 1000000000)
            }
            return word
        }
         let result = translate(n) 
        return result.trim();
    }
}

