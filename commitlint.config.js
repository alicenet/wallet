const Configuration = {
    extends: ["@commitlint/config-conventional"],
    formatter: "@commitlint/format",
    defaultIgnores: true,
    helpUrl:
        "https://github.com/conventional-changelog/commitlint/#what-is-commitlint",
};

module.exports = Configuration;
