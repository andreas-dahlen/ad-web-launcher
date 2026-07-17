declare module "@styleCompiler/*.module.css" {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}