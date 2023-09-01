/*
 * @Author: chenzhongsheng
 * @Date: 2023-08-02 19:35:29
 * @Description: Coding something
 */

import {createContext} from './context';

export const _$$ = createContext;

export {ContextTool, createContext} from './context';

export type {IAttributes} from './element/jsx.d';

export {_if} from './if';
export {_switch} from './switch';
export {map} from './for';

export * from './element/renderer';

export * from 'alins-reactive';

export const version = __VERSION__;

export {reactiveBindingEnable} from './element/dom-util';
