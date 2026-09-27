// react-kitten's components are type-checked from source and import CSS modules
declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}
