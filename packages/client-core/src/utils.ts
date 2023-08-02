/*
 * @Author: chenzhongsheng
 * @Date: 2023-07-04 09:52:35
 * @Description: Coding something
 */
export function createEmptyJson () {
    const json = {};
    // @ts-ignore
    json.__proto__ = null;
    return json;
}

export function getParent (node: any, def: any = null) {
    return node.parentElement || node.parentNode || def;
}