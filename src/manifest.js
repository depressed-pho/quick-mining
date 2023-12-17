module.exports = {
    common: {
        name: "Quick Mining Addon",

        // FIXME
        //icon: "quick-mining.png",

        min_engine_version: "1.20.50"
    },
    packs: [
        {
            uuid: "7e534f24-729f-4091-95f5-f8b530d6ebee",
            modules: [
                {
                    description: "quick-mining scripts",
                    type: "script",
                    language: "javascript",
                    uuid: "cb44f2ac-5191-49cc-a63a-470700ac8c8f",
                    entry: "scripts/server/index.js",
                    include: ["scripts/**"]
                }
            ],
            dependencies: {
                "@minecraft/server": "1.8.0-beta",
                "@minecraft/server-ui": "1.2.0-beta"
            }
        }
    ]
};
