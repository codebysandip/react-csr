import { Field, FormikErrors, FormikTouched } from "formik";
import { FormValidation } from "src/core/services/form-validation.service.js";

export function FormGroup(props: FormGroupProps) {
  const {
    type,
    name,
    labelText,
    className,
    formGroupClass,
    errors,
    touched,
    testIdPrefix,
    ...inputProps
  } = props;

  const getErrorMessage = () => {
    const message = FormValidation.message(errors[name] as string, labelText);
    return message;
  };
  return (
    <div className={`form-group ${formGroupClass || ""}`}>
      <label
        htmlFor="email"
        data-test-id={`${testIdPrefix ? testIdPrefix + "-" : ""}label-${name}`}
      >
        {labelText}
      </label>
      <Field
        type={type}
        name={name}
        className={`form-control ${className || ""}`}
        {...inputProps}
        data-test-id={`${testIdPrefix ? testIdPrefix + "-" : ""}input-${name}`}
      />
      {errors[name] && touched[name] && (
        <div
          className="invalid-feedback"
          data-test-id={`${testIdPrefix ? testIdPrefix + "-" : ""}error-${name}`}
        >
          {getErrorMessage()}
        </div>
      )}
    </div>
  );
}

export interface FormGroupProps extends Partial<HTMLInputElement> {
  type: "text" | "password" | "email" | "number" | "date";
  /**
   * schema key
   */
  name: string;
  /**
   * text for label of input
   * labelText also used by ValidationMessage service to show error message
   */
  labelText: string;
  /**
   * Class name for input element
   */
  className?: string;
  /**
   * css class for form-group dev
   */
  formGroupClass?: string;
  /**
   * FormikErrors object
   */
  errors: FormikErrors<any>;
  /**
   * FormikTouched object
   */
  touched: FormikTouched<any>;
  testIdPrefix?: string;
}
