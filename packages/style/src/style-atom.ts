/*
 * @Author: tackchen
 * @Date: 2022-10-22 21:03:39
 * @Description: Coding something
 */


import {
    $,
    countBindingValue,
} from 'alins-reactive';
import {IReactBuilder, IReactItem, TReactionItem} from 'alins-utils/src/types/react.d';
import {IJson} from 'alins-utils/src/types/common.d';
import {IStyleAtoms, IStyleArgsAtoms, INoneArgsAtoms, TStyleValue, TUnit, TI, IComposeStyle} from 'alins-utils/src/types/style.d';
import {OnlyNumberAttrs, style} from './style';

const IMP = 'i';

export const DefaultUint = 'px';

type TAtomFunc = (...args: any[]) => IStyleAtoms;

export const CompatibleStyleNames = [
    'animation', 'transform', 'filter', 'transition',
];

export const StyleAtoms = (() => {
    const FixedValue: {
        [prop in keyof INoneArgsAtoms]: object;
    } = {
        borderBox: {boxSizing: 'border-box'},
        relative: {position: 'relative'},
        absolute: {position: 'absolute'},
        fixed: {position: 'fixed'},
    };
    const FixedKeys = Object.keys(FixedValue);
    const ComposeValue: {
        [prop in keyof IComposeStyle]: (...args: TReactionItem[]) => IJson<TReactionItem|IReactBuilder>
    } = {
        cursorUrl: (...args) => {
            transformComposeArgs(args);
            return {
                cursor: $`url('${args[0]}'), ${args[1] || 'default'}`
            };
        }
    };
    const ComposeValueKeys = Object.keys(ComposeValue);
    const StyleNames: (keyof IStyleArgsAtoms)[] = [
        // none arg style
        'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'fontSize', 'lineHeight', 'top', 'left', 'bottom', 'right', 'borderRadius', 'textIndent',
        // TNumberAutoStyle
        'width', 'maxWidth', 'height', 'maxHeight', 'flexBasis',
        // pure number style
        'opacity', 'zIndex', 'flex', 'flexGrow', 'flexShrink',        // fournumber style
        'margin', 'padding',
        // optional string style
        'textDecoration', 'position', 'alignItems', 'justifyContent', 'display', 'alignContent', 'backgroundAttachment', 'backgroundBlendMode', 'backgroundClip', 'backgroundOrigin', 'backgroundRepeat', 'boxSizing', 'clear', 'textAlign', 'wordWrap', 'whiteSpace', 'wordBreak', 'wordSpacing', 'verticalAlign', 'fontStyle', 'flexDirection', 'flexWrap', 'resize', 'textOverflow', 'float', 'visibility', 'overflow', 'overflowX', 'overflowY', 'cursor',
        // common string style
        'border', 'borderBottom', 'borderTop', 'borderLeft', 'borderRight', 'boxShadow', 'fontFamily', 'fontWeight', 'animation', 'backgroundImage', 'backgroundSize', 'backgroundPosition', 'backdropFilter', 'filter', 'transform', 'transition', 'outline', 'clip', 'flexFlow', 'textShadow', 'content',        // color
        'color', 'backgroundColor', 'borderColor',
    ];
    const AtomsBase: IJson<any> = {
        generate (start = 0) {
            return style(this.result).generate(start);
        },
        exe (dom: HTMLElement) {
            return style(this.result).exe(dom);
        },
        type: 'style',
    };
    const Atoms: IJson<TAtomFunc> = {};
    const setAtomValue = (name: string) => {
        Atoms[name] = (...args) => {
            return Object.assign({result: {}}, AtomsBase)[name](...args);
        };
    };
    StyleNames.forEach(name => {
        AtomsBase[name] = function (this: IStyleAtoms, ...args: any[]) {
            this.result[name] = transformAtomStyleValue.apply(null, [name, ...args]);
            return this;
        };
        setAtomValue(name);
    });
    FixedKeys.forEach(name => {
        AtomsBase[name] = function (this: IStyleAtoms) {
            Object.assign(this.result, (FixedValue as any)[name]);
            return this;
        };
        setAtomValue(name);
    });
    ComposeValueKeys.forEach(name => {
        AtomsBase[name] = function (this: IStyleAtoms, ...args: any[]) {
            Object.assign(this.result, (ComposeValue as any)[name](...args));
            return this;
        };
    });
    return Atoms as any as IStyleAtoms;
})();

function transformAtomStyleValue (
    key: string,  v: TStyleValue, unit?: TUnit|TI|'', i?: TI
): string | (()=>string) {

    if (unit === IMP) {
        i = IMP;
        unit = '';
    }
    const tail = `${unit || ''}${createCssITail(i)}`;

    const iu = !!unit || OnlyNumberAttrs.includes(key); // ignoreUnit

    if (typeof v === 'number' || typeof v === 'string') {
        return concatValue(iu, v, tail);
    } else if ((v as IReactBuilder).type === 'react' ) {
        return () => concatValue(iu, countBindingValue((v as IReactBuilder).exe({type: 'style'})), tail);
    } else if (typeof v === 'function') {
        return () => concatValue(iu, v(), tail);
    } else {
        return () => concatValue(iu, (v as IReactItem).value, tail);
    }
}

function concatValue (iu: boolean, v: string | number, tail: string) {
    if (iu || typeof v === 'string') return v + tail;
    return (typeof v === 'number' ? `${v}${DefaultUint}${tail}` : v + tail);
}

function createCssITail (i?: TI) {
    return i === IMP ? '!important' : '';
}

function transformComposeArgs (args: any[]) {
    args.forEach((arg, i) => {
        if (typeof arg === 'string' || typeof arg === 'number')
            args[i] = () => arg;
    });
}