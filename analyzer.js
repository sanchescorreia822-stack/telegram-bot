function analyze(history) {

    const lastThree = history.slice(-3);

    // 3 vermelhos seguidos
    if (
        lastThree[0] === "red" &&
        lastThree[1] === "red" &&
        lastThree[2] === "red"
    ) {
        return "blue";
    }

    // 3 azuis seguidos
    if (
        lastThree[0] === "blue" &&
        lastThree[1] === "blue" &&
        lastThree[2] === "blue"
    ) {
        return "red";
    }

    return null;
}

module.exports = analyze;