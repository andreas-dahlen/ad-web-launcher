/** @type {import('stylelint').Config} */
export default {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-css-modules'
  ],
  rules: {
    'custom-property-pattern': null,
    'number-max-precision': null,
    'hue-degree-notation': null,
    'alpha-value-notation': null,
    'import-notation': null,
    'comment-empty-line-before': null,
    'declaration-empty-line-before': null,
    'custom-property-empty-line-before': null,
    'selector-class-pattern': null
    // 'property-no-unknown': [
    //   true,
    //   {
    //     ignoreProperties: ['composes']
    //   }
    // ]
  }
}
