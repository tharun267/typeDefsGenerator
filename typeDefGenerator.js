const fs = require('fs')
const obj = {
    "key": "value"
}

const isFloat = n => Number(n) === n && n % 1 !== 0

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
let allTypes = []
const formTypes = (obj, type, name) => {
    const keys = Object.keys(obj)
    const types = keys.map(key => {
        if (isFloat(obj[key])) {
            return `${key}: Float`
        }
        if (typeof obj[key] === 'number') {
            return `${key}: Int`
        }
        if (typeof obj[key] === 'string') {
            if(obj[key].match(/^[0-9a-fA-F]{24}$/)){
                return `${key}: ID`
            }
            return `${key}: String`
        }
        if (typeof obj[key] === 'boolean') {
            return `${key}: Boolean`
        }
        if (Array.isArray(obj[key])) {
            if (!obj[key].length) return `${key}: []`
            if (Array.isArray(obj[key][0])) {
                return null
            }
            if (typeof obj[key][0] === 'object') {
                formTypes(obj[key][0], 'arr', key.capitalize())
                return `${key}: [${key.capitalize()}]`
            } else {
                if (isFloat(obj[key][0])) {
                    return `${key}: [Float]`
                }
                if (typeof obj[key][0] === 'number') {
                    return `${key}: [Int]`
                }
                if (typeof obj[key][0] === 'string') {
                    return `${key}: [String]`
                }
                if (typeof obj[key][0] === 'boolean') {
                    return `${key}: [Boolean]`
                }
            }
        }
        if (typeof obj[key] === 'object') {
            formTypes(obj[key], 'obj', key.capitalize())
            return `${key}: ${key.capitalize()}`
        }
    })
    allTypes.push((type === 'obj' || type === 'arr') ? { [name]: types } : types)
}
formTypes(obj)

allTypes = allTypes.map(x => {
    if (Array.isArray(x)) {
        return x.filter(a => a !== null)
    }
    return x
})

let gqlTypes = []
const formGQLString = (allTypes, name) => {
    allTypes.forEach(x => {
        if (Array.isArray(x)) {
            const type = x.reduce((a, b) =>
                `${a}
                ${b}`)
            const mainType = `
            type ${name} {
                ${type}
            }
        `
            gqlTypes.push(mainType)
        } else {
            const key = Object.keys(x)[0]
            formGQLString([x[key]], key)
        }
    })
}

formGQLString(allTypes, 'MainType')

fs.writeFileSync('./gqlSchemas.txt', gqlTypes.reduce((a, b) => a + '\n' + b))