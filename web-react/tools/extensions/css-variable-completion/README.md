An extension that is ment to work with other extensions to provide CSS variable completion in your code editor. It helps developers by suggesting available CSS variables as they type, improving productivity and reducing errors in styling. 

This is done only for CSS variables that are used to set and define values and not when they are used as a value. For example, if you have a CSS variable defined like this:

```css
:root {
  --main-color: #3498db;
} 

```

When you start typing `--main-` in your CSS file, the extension will suggest `--main-color` as a completion option. However, if you are using the variable as a value, like in `color: var(--main-color);`, the extension will not provide suggestions for the variable name.