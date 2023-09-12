/*
 * @Author: chenzhongsheng
 * @Date: 2023-06-26 08:35:17
 * @Description: Coding something
 */

import type { IElement, ITextNode, IFragment, ILifeListener, IGeneralElement } from './alins.d';
import { initWebMountedObserver, initWebRemovedObserver } from './lifecycle';

export interface IRenderer {
    querySelector (selector: string): IElement|null,
    createElement (tag?: string): IElement,
    createTextNode (text: string): ITextNode,
    createEmptyMountNode (): IElement,
    createFragment (): IFragment,
    isFragment (el: any): boolean,
    isElement (el: any): boolean,
    onMounted? (parent: IElement, node: IElement, mounted: ILifeListener<void|ILifeListener>): void;
    onRemoved? (parent: IElement, node: IElement, removed: ILifeListener): void;
}

export let Renderer: IRenderer;

export function defineRenderer (renderer: IRenderer) {
    Renderer = renderer;
    return renderer;
}

if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
    defineRenderer({
        querySelector (selector: string) {
            return document.querySelector(selector) as any as IElement;
        },
        createElement (tag: string): IElement {
            return document.createElement(tag) as any as IElement;
        },
        createTextNode (text: string) {
            return document.createTextNode(text) as ITextNode;
        },
        createEmptyMountNode (): IElement {
            return document.createComment('') as any;
            // return document.createComment('' + (id++)) as any;
        },
        createFragment (): IFragment {
            return document.createDocumentFragment() as any as IFragment;
        },
        isFragment (el: any): boolean {
            return el instanceof DocumentFragment;
        },
        isElement (el: any) {
            return this.isFragment(el) || el instanceof Node;
        },
        onMounted (parent: any) {
            initWebMountedObserver(parent);
        },
        onRemoved (parent: any, node: any) {
            initWebRemovedObserver(node);
        },
    });
}

export function getFirstElement (element?: IGeneralElement) {
    if (!element) return null;
    // @ts-ignore
    return (Renderer.isFragment(element) ? (element.firstChild) : element);
}

export function appendChild (parent: any, item: any) {
    // @ts-ignore
    if (item.__$mounted) {
        Renderer.onMounted?.(parent, item, item.__$mounted);
    }
    // @ts-ignore
    if (item.__$removed) {
        Renderer.onRemoved?.(parent, item, item.__$mounted);
    }
    parent.appendChild(item as any);
    // @ts-ignore
    item.__$appended?.(item);
}