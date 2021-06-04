module.exports = {
    root: true,
    env: {
        node: true
    },
    'extends': [
        'eslint:recommended'
    ],
    parserOptions: {
        parser: 'babel-eslint'
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-redeclare': 'warn',
        'no-unused-vars': 'warn'
    },
    globals: {
        Office: false
    }
}
