module.exports =
  {
    "extends": [
      "airbnb",
      "prettier",
      "prettier/react"
    ],
    "settings": {
      "react": {
        "pragma": "React",
        "version": "16.4"
      },
    },
    "parser": "babel-eslint",
    "parserOptions": {
      "ecmaVersion": 8,
      "sourceType": "module",
      "ecmaFeatures": {
        "jsx": true
      }
    },
    "env": {
      "browser": true
    },
    "plugins": [
      "react",
      "prettier",
      "flowtype"
    ],
    "rules": {
      "no-console": 0,
      "camelcase": 0,
      "import/no-named-as-default": 0,
      "prettier/prettier": ["error"],
      "react/jsx-wrap-multilines": 0,
      "react/require-extension": "off",
      "react/require-default-props": "off",
      "import/no-extraneous-dependencies": ["error", {"devDependencies": ["**/test/**/*.js", "**/loaders/**/*.js"]}],
      "jsx-a11y/label-has-for": [2, {
        "required": {
          "some": ["id", "nesting"]
        }
      }],
      "jsx-a11y/no-static-element-interactions": 0,
      "jsx-a11y/anchor-is-valid": 0,
      "jsx-a11y/click-events-have-key-events": 0,
      "flowtype/boolean-style": [
        2,
        "boolean"
      ],
      "react/default-props-match-prop-types": 0,
      "flowtype/define-flow-type": 1,
      "flowtype/delimiter-dangle": 0,
      "flowtype/generic-spacing": [
        2,
        "never"
      ],
      "flowtype/no-primitive-constructor-types": 2,
      "flowtype/no-types-missing-file-annotation": 2,
      "flowtype/no-weak-types": 1,
      "flowtype/object-type-delimiter": 0,
      "flowtype/require-parameter-type": 0,
      "flowtype/require-return-type": [
        0,
        "always",
        {
          "annotateUndefined": "never"
        }
      ],
      "flowtype/require-valid-file-annotation": 2,
      "flowtype/semi": [
        2,
        "always"
      ],
      "flowtype/space-after-type-colon": [
        2,
        "always"
      ],
      "flowtype/space-before-generic-bracket": [
        2,
        "never"
      ],
      "flowtype/space-before-type-colon": [
        2,
        "never"
      ],
      "flowtype/type-id-match": [
        2,
        "^\\$?[A-Z][a-zA-Z0-9]+$"
      ],
      "flowtype/union-intersection-spacing": [
        2,
        "always"
      ],
      "flowtype/use-flow-type": 1,
      "flowtype/valid-syntax": 1
    }

  };
