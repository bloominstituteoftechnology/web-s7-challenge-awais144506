import React, { useEffect, useState } from 'react';
import * as yup from "yup";
import axios from "axios";

// Validation errors with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
};

// Schema for form validation
const schema = yup.object().shape({
  fullName: yup
    .string()
    .required("Name is Required.").trim()
    .min(3, validationErrors.fullNameTooShort)
    .max(20, validationErrors.fullNameTooLong),

  size: yup
    .string()
    .required("Select Size").trim()
    .oneOf(["S", "M", "L"], validationErrors.sizeIncorrect),

  toppings: yup.array().of(yup.string())
});

// Toppings array
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
];

const initialFormValues = {
  fullName: "",
  size: "",
  toppings: []
};

const initialFormErrors = {
  fullName: "",
  size: "",
};

export default function Form() {
  const initialDisabled = true;

  // useStates
  const [formValues, setFormValues] = useState(initialFormValues);
  const [formErrors, setFormErrors] = useState(initialFormErrors);
  const [serverSuccess, setServerSuccess] = useState("");
  const [serverFailure, setServerFailure] = useState("");
  const [disabled, setDisabled] = useState(initialDisabled);

  // Function for validating form values
  const validateValues = (name, value) => {
    yup.reach(schema, name)
      .validate(value)
      .then(() => setFormErrors({ ...formErrors, [name]: "" }))
      .catch(err => setFormErrors({ ...formErrors, [name]: err.errors[0] }));
  };

  // Values Change by input
  const onChange = evt => {
    const { name, value, type, checked } = evt.target;

    if (type === "checkbox") {
      const newToppings = checked 
        ? [...formValues.toppings, name]
        : formValues.toppings.filter(t => t !== name);
      setFormValues({ ...formValues, toppings: newToppings });
    } else {
      setFormValues({ ...formValues, [name]: value });
      validateValues(name, value);
    }
  };

  // Use Effect Hook to enable button
  useEffect(() => {
    schema.isValid(formValues).then(valid => setDisabled(!valid));
  }, [formValues]);

  // On Submission
  const onSubmit = evt => {
    evt.preventDefault();

    axios.post("http://localhost:9009/api/order", formValues)
      .then((res) => {
        console.log(res);
        setFormValues(initialFormValues);
        setServerSuccess(res.data.message);
        setServerFailure("");
      })
      .catch(err => {
        console.log(err);
        setServerFailure(err.response?.data?.message || "Something went wrong");
        setServerSuccess("");
      });
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>Order Your Pizza</h2>
      {serverSuccess && <div className='success'>{serverSuccess}</div>}
      {serverFailure && <div className='failure'>{serverFailure}</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input
            placeholder="Type full name"
            id="fullName"
            type="text"
            name='fullName'
            onChange={onChange}
            value={formValues.fullName}
          />
        </div>
        {formErrors.fullName && <div className='error'>{formErrors.fullName}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label><br />
          <select id="size" onChange={onChange} value={formValues.size} name='size'>
            <option value="">----Choose Size----</option>
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
          </select>
        </div>
        {formErrors.size && <div className='error'>{formErrors.size}</div>}
      </div>

      <div className="input-group">
        {toppings.map(tp => (
          <label key={tp.topping_id}>
            <input
              name={tp.topping_id}
              type='checkbox'
              checked={formValues.toppings.includes(tp.topping_id)}
              onChange={onChange}
            />
            {tp.text}
          </label>
        ))}
      </div>
      <input type="submit" disabled={disabled} />
    </form>
  );
}
