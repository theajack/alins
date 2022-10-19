/*
 * @Author: tackchen
 * @Date: 2022-10-11 21:35:20
 * @Description: react data
 */

import {IJson} from '../common';
import {IBuilderParameter} from '../core';
import {join} from '../utils';
import {Compute, computed, TComputedFunc, IComputedItem} from './computed';
import {createProxy} from './proxy';

export const subscribe = Symbol();
export const forceUpdate = Symbol();
export const index = Symbol();
export const value = Symbol();
export const reactValue = Symbol();
export const getListeners = Symbol();
export const switchReact = Symbol();
export const json = Symbol();
export type TBaseTypes = number | boolean | string | null | undefined;
// type TReactTypes = TBaseTypes | IJson<TReactTypes> | TReactTypes[];

export interface IReactBase<T = any> {
    [index]?: IReactItem<number>;
    [forceUpdate](): void;
    [subscribe](fn: (v:T, old:T) => void):  T;
    [reactValue]: boolean;
    [getListeners](): Function[];
    [switchReact](target: IReactBase<any>, property: string): void;
}
export interface IReactObject<T = any> extends IReactBase<T> {
    [value]: T;
    get [json](): T;
}
export interface IReactItem<T = any> extends IReactBase<T>{
    value: T;
    isUndefined(): boolean;
    toJSON: ()=> T | undefined; // ! 重写value的toJSON方法
}

export type IReactWrap<T> = T extends object ? ({
    [prop in (keyof T)]: IReactWrap<T[prop]>;
} & IJson // ! & IJson 为了绑定的时候不报类型错误
    & IReactObject<T>
): IReactItem<T>;

export interface IReactBindingTemplate {
    template: string[], // TemplateStringsArray
    reactions: TReactionItem[], // | any[], // ? 为了绑定的时候不报类型错误
}

// react上下文环境
export interface IReactContext {
    type: 'dom-info',
}; // todo

export interface IReactBinding extends IReactBindingTemplate {
    context: IReactContext; // todo
}
export interface IReactBuilder extends IBuilderParameter {
    type: 'react';
    exe(context: IReactContext): IReactBinding;
}

function bindReactive ({
    template,
    reactions,
}: IReactBindingTemplate): IReactBuilder {
    // console.log('bindReactive', template, reactions);
    // debugger;
    return {
        // todo 从div构建处传入上下文环境
        exe (context: IReactContext) {
            // debugger;
            return {template, reactions, context}; // todo
        },
        type: 'react'
    };
}
// export function createReactive<T extends object> (data: T): IReactWrap<T>;
// export function createReactive<T extends TBaseTypes> (data: T): IReactItem<T>;
export function createReactive<T> (data: T): IReactWrap<T> {
    if (isSimpleValue(data)) {
        // 值类型
        return reactiveValue(data) as IReactWrap<T>;
    }

    if (typeof data === 'object') {
        return createProxy(data as any) as IReactWrap<T>;
    }
    
    throw new Error('createReactive error');
}

export function reactiveValue<T> (value: T, isUndefined = false): IReactItem<T> {
    const changeList: Function[] = [];
    return {
        isUndefined () {
            return typeof value === 'undefined' || isUndefined;
        },
        get value () {
            Compute.add?.(this);
            return value;
        },
        set value (v: any) {
            if (isUndefined) isUndefined = false;
            if (v instanceof Array) v = v.join('\n');
            if (v === value) return;
            const old = value;
            value = v;
            changeList.forEach(fn => {fn(v, old);});
        },
        [reactValue]: true,
        [subscribe] (fn) {
            changeList.push(fn);
            return this.value;
        },
        [forceUpdate] () {
            changeList.forEach(fn => {fn(value, value);});
        },
        toJSON () {return isUndefined ? undefined : this.value;},
        [getListeners]: () => changeList,
        [switchReact] (target, property) {
            switchListeners(this, target, property);
        }
    };
}

export type TReactionItem<T=any> = IReactItem<T> | TComputedFunc<T> | IComputedItem<T>;

// 生成响应数据绑定
export function react(ts: TemplateStringsArray, ...reactions: TReactionItem[]): IReactBuilder;
// 初始化响应数据
export function react<T>(data: T): IReactWrap<T>;

export function react<T> (
    data: TemplateStringsArray | T,
    ...reactions: TReactionItem[]
): IReactBuilder | IReactWrap<T> | IReactItem<T> {
    // todo check is TemplateStringsArray
    if (data instanceof Array && (data as any).raw instanceof Array) {
        return bindReactive({
            template: data as unknown as string[],
            reactions,
        });
    } else {
        return createReactive<T>(data as T);
    }
}

export function transformToReaction<T> (item: TReactionItem<T>): IReactItem<T> | IComputedItem<T> {
    return (typeof item === 'function') ? computed(item) : item;
}
export function countReaction (item: TReactionItem) {
    return (typeof item === 'function') ? item() : item.value;
}
export function countBindingValue (binding: IReactBinding) {
    return join(binding.template, binding.reactions.map(r => countReaction(r)));
}
export function isSimpleValue (v: any) {
    return typeof v !== 'object' || v === null;
}

export function mergeReact (
    target: IReactBase<any>,
    toReact: IReactBase<any>,
    property: string
) {
    // const target = toReact as any;
    // console.warn('react', react);
    // console.warn('target', property, toReact);
    // debugger;
    // if (isReaction(target[property])) {
    //     const listener = target[property][getListeners]();
       
    //     if (listener.length > 0) {
    //         react[getListeners]().push(...listener);
    //     }
    // }
}

export function getReactionValue (reaction: any) {
    return reaction[value] || reaction.value;
}

export function isReaction (v: any): boolean {
    return !!v?.[subscribe];
}

// export function isUndefined (v: any): boolean {
//     return isReaction(v) ?
//         (getReactionValue(v) === emptyValue) :
//         (typeof v === 'undefined');
// }

export function getReactionPureValue (data: any) {
    return isReaction(data) ? JSON.parse(JSON.stringify(data)) : data;
}