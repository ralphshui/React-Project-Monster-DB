import '../App.css';
import React, { useEffect, useState } from "react"
import { Route, Routes } from "react-router-dom"
import MonsterContainer from "./Monsters/MonsterContainer"
import Encounters from "./Encounters/Encounters"
import SpecificMonster from "./Monsters/SpecificMonster"
import CreateForm from "./Create/CreateForm"
import NavBar from "./NavBar"


function App() {

  const [monsters, setMonsters] = useState([])
  const [userLogged, setUserLogged] = useState(false)
  const [users, setUsers] = useState([])
  const [user, setUser] = useState([])
  const [selectedMonster, setSelectedMonster] = useState([])

  useEffect(() => {
    if(monsters.length === 0) {
      fetch("https://www.dnd5eapi.co/api/monsters")
        .then(res => res.json())
        .then(data => {
          const fetchPromises = data.results.map(monster => {
            return fetch(`https://www.dnd5eapi.co${monster.url}`)
              .then(res => res.json());
          });
  
          return Promise.all(fetchPromises);
        })
        .then(fetchedMonsters => {
          const uniqueMonsters = fetchedMonsters.filter(monster => {
            return !monsters.some(prevMonster => prevMonster.url === monster.url);
          });
          setMonsters(prevMonsters => [...prevMonsters, ...uniqueMonsters]);
        })
        .catch(error => {
          console.error("Error fetching monsters:", error);
        });
    }
  }, [monsters]);

  useEffect(() => {
    fetch("http://localhost:3001/Users")
      .then(res => res.json())
      .then(data => setUsers(data))
  }, [])

  function selectMonster(monster) {
    setSelectedMonster(monster)
  }
  function userLogin(input) {
    const userExists = users.find(user => user.name === input.name && user.password === input.password)
    if (userExists) {
      setUser(userExists)
      setUserLogged(true)
    } else {
      alert('Incorrect Username or Password. Information is case sensitive. Check your cap locks.')
    }
  }
  function userSignUp(input) {
    const userExists = users.find(user => user.name.toLowerCase() === input.name.toLowerCase())
    if (userExists) {
      alert('Username Already Exists')
    } else {
      fetch("http://localhost:3001/Users", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/JSON',
          Accept: 'application/JSON'
        },
        body: JSON.stringify(input)
      })
        .then(res => res.json())
        .then(newUser => {
          setUser(newUser)
          setUserLogged(true)
          console.log(newUser)
        })
        .catch(error => {
          alert('Error Fetching Users', error)
          console.log(error)
        })
    }
  }
  console.log(monsters)
  return (

    <div className="App">
      <NavBar userLogin={userLogin} userSignUp={userSignUp} userLogged={userLogged} user={user} />
      <Routes>
        <Route path="Monsters/:index" element={<SpecificMonster monster={selectedMonster} />} />
        <Route path="/" element={userLogged ? <Encounters user={user} /> : null} />
        <Route path="/Monsters" element={<MonsterContainer monsters={monsters} selectMonster={selectMonster} />} />
        <Route path="Create-Monster" element={<CreateForm /> } />
      </Routes>
    </div>
  );
}

export default App;
