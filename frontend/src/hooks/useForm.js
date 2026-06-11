import { useState } from 'react';

export const useForm = (initialValues, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setValues(prev => ({ ...prev, [name]: val }));
    if (touched[name] && validate) {
      const validationErrors = validate({ ...values, [name]: val });
      setErrors(prev => ({ ...prev, [name]: validationErrors[name] || '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    if (validate) {
      const validationErrors = validate(values);
      setErrors(prev => ({ ...prev, [name]: validationErrors[name] || '' }));
    }
  };

  const validateAll = () => {
    if (!validate) return true;
    const validationErrors = validate(values);
    setErrors(validationErrors);
    const allTouched = Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);
    return Object.values(validationErrors).every(e => !e);
  };

  const reset = (newValues) => {
    setValues(newValues || initialValues);
    setErrors({});
    setTouched({});
  };

  return { values, errors, touched, handleChange, handleBlur, validateAll, setValues, reset };
};
