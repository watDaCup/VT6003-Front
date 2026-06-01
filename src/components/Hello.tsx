const Hello = (props: any) => {
    const greeting = `Hello ${props.name}`
    return <h1>{greeting}</h1>
}
export default Hello