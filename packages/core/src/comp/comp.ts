/*
 * @Author: tackchen
 * @Date: 2022-10-11 08:45:14
 * @Description: Coding something
 */

import {IJson} from 'alins-utils/src/types/common.d';
import {IComputedItem} from 'alins-utils/src/types/react.d';
import {mountParentWithTChild} from '../mount';
import {compControllers, ICompControllers} from '../controller/controller';
import {IMountBuilderParameter, TChild} from '../element/transform';
import {IEvent, IEventFunc} from './event';
import {IProp} from './prop';
import {ISlot, TSlotElement, TSlotFunction} from './slot';

export type TCompArgs = IProp | IEvent | ISlot;
export type TCompBuildFunc = () => TCompArgs[];

export type TCompBuilderArg = IComponent | TCompArgs | TCompBuildFunc;

export interface IComponentOptions<T extends 'slot' | 'slots' = 'slot'> {
    props: IJson<IComputedItem>;
    events: IJson<IEventFunc>;
    slots: T extends 'slot' ? TSlotFunction : TSlotElement;
}
export interface IComponent<T extends 'slot' | 'slots' = 'slot'> {
    (options: IComponentOptions<T>): TChild;
}

export type TCompArg = string; // prop event slot
export interface IComponentBuilder extends IMountBuilderParameter {
    exe(): TChild;
    type: 'comp';
    _asParent(builders: TChild[]): void;
}
export interface ICompConstructor extends ICompControllers<'comp'> {
    (...args: (IComponent | TCompBuilderArg)[]): IComponentBuilder;
}

export const comp: ICompConstructor = Object.assign(((...args: TCompBuilderArg[]) => {
    // const mapValue = CompMap.get(el);
    // if (mapValue) return mapValue;

    // CompMap.set(el, comp);

    const children: TChild[] = [];

    return {
        exe () {
            const options: IComponentOptions<any> = {
                props: {},
                events: {},
                slots: {}
            };
            let component: IComponent | null = null;
            for (let i = 0; i < args.length; i++) {
                const item = args[i];
                if (typeof item === 'function') {
                    if (i === 0) {
                        component = item as IComponent;
                    } else {
                        args.push(...(item as TCompBuildFunc)());
                    }
                } else if (item) {
                    switch (item.type) {
                        case 'prop': options.props = item.exe(); break;
                        case 'event': options.events = item.exe(); break;
                        case 'slot': options.slots = item.exe(); break;
                    }
                }
            }
            if (!component) throw new Error('Component not found');
            let result = component(options);

            if (children.length > 0) {
                if (result instanceof Array) result.push(children as any);
                else result = [result, children];
            }
            return result;
        },
        type: 'comp',
        mount (parent = 'body') {
            mountParentWithTChild(parent, this);
        },
        _asParent (builders: TChild[]) {
            children.push(...builders);
        }
    } as IComponentBuilder;
}), compControllers);
