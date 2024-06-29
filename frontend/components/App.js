import React from 'react'
import Home from './Home'
import Form from './Form'
import { NavLink } from 'react-router-dom'
import { Route, Routes } from 'react-router-dom'
function App() {
  return (
  
      <div id="app">
        <nav>
          <NavLink to="/" activeClassName="active">Home</NavLink>
          <NavLink to="/order" activeClassName="active">Order</NavLink>
        </nav>

        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/order' element={<Form />} />
        </Routes>
      </div>

   

  )
}

export default App
