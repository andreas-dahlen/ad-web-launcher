// import { useState } from "react";
// import "@styles/school.css";

// export default function InteractiveLayer() {
  
//   const construction = [ 
//     { name: "Albus", age: 189, profession: 'wizard', 
//       catchPhrase: " Did you put your name inte the Goblet of fire, Harry? "},
//     { name: "Aragorn", age: 89, profession: 'king', 
//       catchPhrase: "If by my life or death I can protect you, I will. You have my sword... "},
//     { name: "Hagrid", age: 45, profession: 'Grundskeeper', 
//       catchPhrase: "You're a wizard Harry!"},
//     { name: "Gandalf", age: 72, profession: 'wizard', 
//       catchPhrase: "All we have to decide is what to do with the time that is given to us."}
//   ]



//   const [characters, setCharacters] = useState(construction)
  


//   return (
//     <div className="card-root">
//       {characters.map(person => (
//         <div key={person.name} className="card">
//           <h1>{person.name}</h1>
//           <h2>age: {person.age} profession: {person.profession}</h2>

//           <h3>Catch Phrase</h3>
//           <p>{person.catchPhrase}</p>
//         </div>
//       ))
//       }

//     </div>
//   )
// }