import _FormValidateFunction from "./Form.validate.function";
import _ValidationPatternFunction from "./ValidationPattern";
import { rules } from "./Form.validate";

export const ValidateRule     = rules;
export const ValidateFunction = new _FormValidateFunction();
export const ValidationPatternFunction = new _ValidationPatternFunction();
