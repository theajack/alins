/*
 * @Author: chenzhongsheng
 * @Date: 2023-07-06 21:13:18
 * @Description: Coding something
 */

import {IFragment, IGeneralElement, ITrueElement, Renderer, getFirstElement} from '../element/renderer';
import {IElement} from '../element/renderer';
import {getParent} from '../utils';
import {IBranchTarget} from './branch';
import {ICallCache} from './cache';
/*
dom 元素挂载的锚点
firstElement => anchor 之前为组件的所有dom
*/

let id = 0;
export function createAnchor (cache: ICallCache) {
    let end: IElement|null = null;
    let start: IElement|null = null;

    let frag: IFragment;

    const initFirstMount = (element?: IGeneralElement): IFragment => {
        end = Renderer.createEmptyMountNode(id++);
        start = getFirstElement(element) || end;
        // console.warn('initFirstMount', start);

        if (Renderer.isFragment(element)) {
            // @ts-ignore
            element.appendChild(end);
            return element as IFragment;
        }
        const d = Renderer.createDocumentFragment();
        // @ts-ignore
        if (element) d.appendChild(element);
        // @ts-ignore
        d.appendChild(end);
        return d;
    };

    // setInterval(() => {
    //     console.log(start);
    // }, 3000);

    const clearDom = () => {
        const cursor = start;
        if (cursor !== end) {
            while (cursor.nextSibling && cursor.nextSibling !== end) {
                try {
                    cursor.nextSibling.remove();
                } catch (e) {
                    // debugger;
                    console.error(e);
                    break;
                }
            }
            cursor.remove();
        }
        start = end;
    };

    return {
        start () {return start;},
        setStart (element: ITrueElement|null|undefined) {
            if (element) {
                // debugger;
                start = getFirstElement(element) || end;
            }
        },
        // ! async 时dom被替换了 此时需要检测一下如果是start 则需要替换start
        replaceStart (old: any, newDom: any) {
            const oldStart = getFirstElement(old);
            if (oldStart === start) {
                start = getFirstElement(newDom);
            }
        },
        replaceBranch (branch: IBranchTarget) {
            // console.log(start);
            // branch.parent
            const current = branch.current(); // ! 缓存一下当前branch， call之后会被覆盖
            const dom = cache.call(branch);
            // if (!window.bs) window.bs = {};
            // for (const k in window.bs) {
            //     console.log(k, window.bs[k].anchor.start());
            // }
            if (!branch.inited || (dom && branch.isVisible(current))) {
                branch.inited = true;
                // debugger;
                this.replaceContent(dom, branch);
            } else {
                if (dom) {
                    if (branch.isVisible(current)) {
                        this.replaceContent(dom, branch);
                    }
                } else {
                    clearDom();
                }
            }
            return dom;
            // console.log(dom, branch, current);
            // if (branch.parent === current?.parent) {
            //     debugger;
            //     branch.parent?.anchor.setStart(dom);
            // }
        },
        // 往当前组件替换dom元素
        replaceContent (element?: IGeneralElement, branch?: IBranchTarget) {
            if (!end || !start) {
                frag = initFirstMount(element);
                return frag;
            }
            // console.log(element.textContent, element.outerHTML, end.parentElement);
            const container = getParent(end, frag);

            if (container === element) return element;
            // if (!start.parentElement) {
            //     start = end; // ! start 不在页面上了 则 指向end
            // } else {
            clearDom();
            // }
            if (!element) return element;
            // @ts-ignore
            const newEle = getFirstElement(element);
            const newStart = newEle || end;
            let parent = branch?.parent;
            while (parent && parent.anchor.start() === start) {
                parent.anchor.setStart(newStart);
                if (parent.call) cache.modifyCache(parent, newEle);
                parent = parent.parent;
            }
            start = newStart;
            try {
                container.insertBefore(element, end);
            } catch (e) {
                console.error(e, container, element, end);
                debugger;
            }
            // console.log('xxxxxxx', this.start(), start, start?.parentElement);
            // debugger;
            return element;
        },
        clearCache () {

        }
    };
}

export type ICtxAnchor = ReturnType<typeof createAnchor>;