import React, { useEffect, useState } from 'react'
import * as yup from "yup"
import axios from "axios"
// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
}

// 👇 Here you will create your schema.
const schema = yup.object().shape(
  {
    fullName: yup
      .string()
      .required("Name is Required.")
      .min(3, validationErrors.fullNameTooShort)
      .max(20, validationErrors.fullNameTooLong),

    size: yup
      .string()
      .required("Select Size").trim()
      .oneOf(["S", "M", "L"], validationErrors.sizeIncorrect),

    toppings: yup.array().of(yup.string())
  }
)
// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
]

const initialFormValues = {
  fullName: "",
  size: "",
  toppings: []
}

const initialFormErrors={
  fullName: "",
  size: "",
}

export default function Form() {
  const initialDisabled = true

  // useStates
  const [formValues, setFormValues] = useState(initialFormValues)
  const [formErrors, setFormErrors] = useState(initialFormErrors)
  const [serverSuccess, setServerSuccess] = useState()
  const [serverFaliure, setServerFailure] = useState()
  const [disabled, setDisabled] = useState(initialDisabled)
  //Function for Validate Form
  const validateValues = (name, value) => {
    yup.reach(schema, name)
      .validate(value)
      .then(() => setFormErrors({ ...formErrors, [name]: "" }))
      .catch(err => setFormErrors({ ...formErrors, [name]: err.errors[0] }))
  }
  //Values Change by input
  const onChange = evt => {
    const { name, value, type } = evt.target
    const newValues = type === "checkbox" ? formValues.toppings.push(name) : value
    setFormValues({ ...formValues, [name]: newValues })
    validateValues(name, value)
  }


  //Use Effect Hook to Enable button 
  useEffect(() => {
    schema.isValid(formValues).then(valid => setDisabled(!valid))
  }, [formValues])


  //On Submission
  const onSubmit = evt => {
    evt.preventDefault();

    axios.post("http://localhost:9009/api/order", formValues)
      .then((res) => {
        console.log(res)
        setFormValues(initialFormValues),
          setServerSuccess(res.data.message),
          setServerFailure()
      }
      )
      .catch(err => {
        console.log(err)
        setFormValues(initialFormValues)
        setServerFailure(err.data.message)
        serverSuccess()
      })
   

  }
  return (
    <form onSubmit={onSubmit}>
      <h2>Order Your Pizza</h2>
      {serverSuccess && <div className='success'>{serverSuccess}</div>}
      {serverFaliure && <div className='failure'>{serverFaliure}</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input placeholder="Type full name" id="fullName" type="text" name='fullName' onChange={onChange} value={formValues.name} />
        </div>
        {formErrors && <div className='error'>{formErrors.fullName}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label><br />
          <select id="size" onChange={onChange} value={formValues.size} name='size'>
            <option value="">----Choose Size----</option>
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">large</option>
          </select>
        </div>
        {formErrors && <div className='error'>{formErrors.size}</div>}
      </div>

      <div className="input-group">
        {/* 👇 Maybe you could generate the checkboxes dynamically */}


        {toppings.map(tp => {
          return (
            <label key={tp.topping_id}>
              <input
                name={tp.topping_id}
                type='checkbox'
                onChange={onChange}
                value={formValues.toppings}
              />
              {tp.text}
            </label>
          )
        })}
      </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <input type="submit" disabled={disabled} />
    </form>
  )
}
