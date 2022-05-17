import platform from 'platform'

export function isOSX() {
    if (!platform.os?.family) {
        return undefined
    }
    return platform.os.family.includes('OS X')
}

export function isiOS() {
    if (!platform.os?.family) {
        return undefined
    }
    return platform.os.family.includes('iOS')
}
