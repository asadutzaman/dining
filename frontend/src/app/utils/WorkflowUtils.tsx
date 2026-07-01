export default class WorkflowUtils {
  public matchCondition = (value, operator, conditionValue): any => {
    switch (operator) {
      case 'EQUAL':
        return value === conditionValue
      case 'NOT_EQUAL':
        return value !== conditionValue
      case 'LESS_THAN':
        return value < conditionValue
      case 'LESS_THAN_OR_EQUAL':
        return value <= conditionValue
      case 'GREATER_THAN':
        return value > conditionValue
      case 'GREATER_THAN_OR_EQUAL':
        return value >= conditionValue
      case 'CONTAINS':
        return value.toLowerCase().indexOf(conditionValue.toLowerCase()) >= 0
      case 'NOT_CONTAINS':
        return value.toLowerCase().indexOf(conditionValue.toLowerCase()) < 0
      case 'STARTS_WITH':
        return value.toLowerCase().startsWith(conditionValue.toLowerCase())
      case 'ENDS_WITH':
        return value.toLowerCase().endsWith(conditionValue.toLowerCase())
      case 'IS_NULL':
        return !value
      case 'IS_NOT_NULL':
        return !!value
      default:
        return false
    }
  }

  public convertArithmeticOperator = (operator): any => {
    switch (operator) {
      case 'EQUAL':
        return '='
      case 'NOT_EQUAL':
        return '!='
      case 'LESS_THAN':
        return '<'
      case 'LESS_THAN_OR_EQUAL':
        return '<='
      case 'GREATER_THAN':
        return '>'
      case 'GREATER_THAN_OR_EQUAL':
        return '>='
      case 'CONTAINS':
        return '='
      case 'NOT_CONTAINS':
        return '='
      case 'STARTS_WITH':
        return '='
      case 'ENDS_WITH':
        return '='
      case 'IS_NULL':
        return '='
      case 'IS_NOT_NULL':
        return '='
      default:
        return '='
    }
  }
}
