module.exports = {
    common: {
        name: "Quick Mining Addon",
        icon: "quick-mining.png",
        min_engine_version: "1.20.70"
    },
    packs: [
        {
            name: "Quick Mining Addon [BP]",
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
            dependencies: [
                {
                    uuid: "8273c28f-b128-46bb-a1b3-281f98db5fe0", // RP
                    version: "self"
                },
                {
                    module_name: "@minecraft/server",
                    version: "1.10.0-beta"
                },
                {
                    module_name: "@minecraft/server-ui",
                    version: "1.2.0-beta"
                }
            ]
        },
        {
            name: "Quick Mining Addon [RP]",
            uuid: "8273c28f-b128-46bb-a1b3-281f98db5fe0",
            modules: [
                {
                    description: "quick-mining resources",
                    type: "resources",
                    uuid: "57ca31c9-c7db-45cf-a919-a8e63613669d",
                    include: [
                        "texts/**/*.lang"
                    ]
                }
            ]
        }
    ]
};
