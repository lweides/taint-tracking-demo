var mysql = require('mysql');
var config = require('../config/config');

var pool = mysql.createPool({
    connectionLimit: 10,
    host: config.DATABASE_HOST,
    user: config.DATABASE_USER,
    password: config.DATABASE_PASS,
    database: config.DATABASE_NAME
});

function executeQueryWithParam(query, parameters, callback) {
    verifyTaintStatus(query);
    return new Promise((resolve, reject) => {
        pool.query(query, parameters, (err, res) => {
            if (err) {
                return reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

function executeQuery(query) {
    verifyTaintStatus(query);
    return new Promise((resolve, reject) => {
        pool.query(query, (err, res) => {
            if (err) {
                return reject(err);
            } else {
                return resolve(res);
            }
        });
    });
}

/**
 * Verifies that the SQL query does not contain any unquoted, tainted chars.
 * If this some tainted chars are unquoted, logs a warning.
 */
function verifyTaintStatus(query) {
    const unquotedTaintedChars = getUnquotedTaintedChars(query);
    if (unquotedTaintedChars.size != 0) {
        logTaintLabels(query, unquotedTaintedChars);
    }
}

/**
 * Returns a {@link Set}, which contains every unquoted but tainted char in the query.
 * Please note that this function can be easily circumvented, for example
 * by passing a quote (') inside a comment.
 */
function getUnquotedTaintedChars(query) {
    let quoted = false;
    const unquotedTaintedChars = new Set();
    for (let i = 0; i < query.length; i++) {
        const char = query[i];
        if (isUnquotedTaintedChar(char, quoted)) {
            unquotedTaintedChars.add(i);
        }
        if (char == "'") { quoted = !quoted; }
        else if (char == "\\") { i++; } // next char is escaped, we don't care what is is
    }
    return unquotedTaintedChars;
}

/**
 * Returns whether the current char is unquoted and tainted.
 */
function isUnquotedTaintedChar(char, quoted) {
    return (!quoted || (quoted && char == "'")) && Taint.isTainted(char);
}

/**
 * Logs the warning that unquoted, tainted chars are in the SQL query.
 */
function logTaintLabels(query, unquotedTaintedChars) {
    console.warn("Executing SQL query which contains unquoted, tainted chars!");
    console.warn("An arrow (<---) will indicate unquoted, tainted chars:");
    console.warn();
    for (let i = 0; i < query.length; i++) {
        const arrow = unquotedTaintedChars.has(i) ? "<---" : "";
        console.warn(`\t${query[i]}:\t${Taint.getTaintAtIndex(query, i)}\t${arrow}`);
    }
}

module.exports = {
    executeQueryWithParam: executeQueryWithParam,
    executeQuery: executeQuery
};