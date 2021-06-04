export default [{
    caption: "Normal Project",
    state: "normal",
    items: [
        { text: "DR1", start: "2021/01/10", end: "2021/01/20", state: "finish", progress: 1 }, 
        { text: "DR2", start: "2021/01/20", end: "2021/02/01", state: "finish", progress: 1 }, 
        { text: "DR3", start: "2021/02/01", end: "2021/04/15", state: "normal", progress: 0.5 }, 
        [
            [
                { text: "DR4", start: "2021/04/15", end: "2021/04/30", state: "", progress: 0.1 }, 
                { text: "DR5", start: "2021/05/07", end: "2021/06/10", state: "" },
                { text: "DR6", start: "2021/06/10", end: "2021/07/05", state: "" }
            ],
            [
                { text: "tender", start: "2021/06/24", end: "2021/06/26", state: "" },
                { text: "experimental", start: "2021/06/30", end: "2021/08/17", state: "" }
            ]
        ],
        { text: "be online", start: "2021/09/01", end: "2021/09/02", state: "" }
    ]
}, {
    caption: "Warn Project",
    state: "warn",
    items: [
        { text: "DR1", start: "2021/03/08", end: "2021/03/30", state: "finish", progress: 1 },
        { text: "DR2", start: "2021/03/30", end: "2021/04/10", state: "finish", progress: 1 },
        { text: "DR3", start: "2021/04/10", end: "2021/05/26", state: "delay", progress: 0.2 },
        { text: "DR4", start: "2021/06/01", end: "2021/06/15", state: "", progress: 0 },
        [
            [
                { text: "DR5", start: "2021/06/17", end: "2021/07/15", state: "", progress: 0 },
                { text: "DR6", start: "2021/07/20", end: "2021/08/10", state: "", progress: 0 }
            ],
            { text: "DEMO", start: "2021/06/26", end: "2021/07/07", state: "", progress: 0 }
        ]
    ]
}];