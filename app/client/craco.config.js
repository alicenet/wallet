module.exports = {
    plugins: [{ plugin: require("@semantic-ui-react/craco-less") }],
    style: {
        postcss: {
            plugins: [require("tailwindcss"), require("autoprefixer")],
        },
    },
};
