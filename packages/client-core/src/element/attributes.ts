/*
 * @Author: chenzhongsheng
 * @Date: 2023-07-21 22:37:05
 * @Description: Coding something
 */
import { isProxy } from 'alins-reactive';
import { reactiveBindingEnable } from './dom-util';
import type { IElement, IBaseAttributes } from './alins.d';

export function parseAttributes (
    dom: IElement,
    value: IBaseAttributes | string | (()=>string)
): boolean {
    if (value === null || typeof value === 'undefined') return false;

    if (typeof value === 'function' || isProxy(value)) {
        // @ts-ignore
        reactiveBindingEnable(value, (v: any, ov: any, path, prop, remove) => {
            if (typeof v === 'string') {
                if (!prop || prop === 'v') {
                    const r1 = v.matchAll(/(.*?)=(.*?)(&|$)/g);
                    v = {};
                    // @ts-ignore
                    for (const item of r1) v[item[1]] = item[2];
                    const r2 = ov.matchAll(/(.*?)=(.*?)(&|$)/g);
                    ov = {};
                    for (const item of r2) ov[item[1]] = item[2];
                } else {
                    !!remove ?
                        dom.removeAttribute(prop) :
                        dom.setAttribute(prop, v);
                    return;
                }
            }
            for (const k in v) dom.setAttribute(k, v[k]);
            for (const k in ov)
                if (typeof v[k] === 'undefined')
                    dom.removeAttribute(k);
        });
    } else if (typeof value === 'object') {
        for (const k in value) {
            // !todo style value 编译 + func包裹 ()=>{}
            reactiveBindingEnable(value[k], (v) => {
                v === null ?
                    dom.removeAttribute(v) :
                    dom.setAttribute(k, v);
            });
        }
    } else {
        return false;
    }
    return true;
}