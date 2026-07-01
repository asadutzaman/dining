export default class AmountFormatUtils {
  public formatWithDecimal = (number: number) => {
    if (number === null || number === undefined) {
      return 0
    }
    number = parseFloat(number.toString())
    return number.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
}
