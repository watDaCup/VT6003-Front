import {useState} from 'react'

const Goodbye = (props: any) => {
    const [txtColor, setTxtColor] = useState("blue")
    const changeColor = () => { setTxtColor("red") }
    const revertColor = () => { setTxtColor("blue") }

    return (
        <>
            <h1 
            style={{color:txtColor}}
            onMouseEnter={changeColor}
            onMouseLeave={revertColor}
            >Goodbye {props.name}</h1>
            <h2>Current colour is: {txtColor}</h2>
        </>
    )
}
export default Goodbye