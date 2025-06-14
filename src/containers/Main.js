import React from 'react'
import Footer from '../components/Footer'



function Main({ children }) {
  return (
    <main className="h-full overflow-y-auto flex flex-col">
      <div className="container grid px-6 mx-auto flex-grow">
        {children}
      </div>
      <Footer />
    </main>
  )
}

export default Main
