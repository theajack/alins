/*
 * @Author: tackchen
 * @Date: 2022-10-23 08:46:52
 * @Description: Coding something
 */
import {attr, cls} from 'packages/core/src/builder/dom-info';
import {
    div, $, css, style, computed, pseudo,
    button, hover, click, input
} from '../alins';

function createCss () {
    const num = $(30);
    (window as any).num2 = num;

    const simpleStyle = style({
        color: '#888',
        fontSize: $`${num}px`,
    });

    return css()(
        $`@keyframes aa {
            ${simpleStyle},
        }`,
        simpleStyle,
        ['&.aa', simpleStyle],
        ['[a=xx]',
            simpleStyle,
            ['&.aa', simpleStyle],
            ['.cc', simpleStyle]
        ],
    ).mount();
}

function initCss (num: any) {
    css('.main')(
        style({
            color: '#888',
            marginLeft: $`${num}px`,
        }),
        ['&.active', style.fontSize(num)],
        ['.child', style.marginTop(num)]
    ).mount();
}

export function StyleDemo () {
    const num = $(30);
    const active = $(false);

    initCss(num);

    return div(`parent.main`,
        cls({
            'aaa': active,
            'bbb': true,
        }),
        attr({
            aaa: '',
            bbb: 1,
            ccc: active
        }),
        $`.${() => active.value ? 'active' : ''}`,
        hover('color: #f44'),
        // $`${() => active.value ? '.active' : ''}`,
        input.model(num, 'number'),
        button('toggle active', click(() => active.value = !active.value)),
        div('child.child'),
    );
}

export function StyleComp () {
    createCss();
    const num = $(30);
    (window as any).num = num;
    
    return [
        div('d-form.d-form',
            div('d-form-aa.aa',

            ),
            div('a=yy[a=yy]',
                div('cc.cc')
            ),
            div('a=xx[a=xx].aa',
                div('cc.cc')
            )
        ),
        div('111', style('color: red; font-size: 10px')),
        div('222', style({
            color: 'red',
            fontSize: '10px',
        })),
        div('333', style({
            color: 'red',
            marginTop: $`${num}px`,
            fontSize: $`${() => num.value}px`
            // animation: keyframe
        })),
        div('444', style`
            color: red;
            marginTop: ${num}px;
            fontSize: ${() => num.value}px;
        `),
        div('555',
            style.borderBottom($`${num}px solid #000`)
                .width(() => num.value + 2)
                .cursorUrl('aaa', '111')
                .relative().top(3),
            // .animation(keyframe)
        ),

        div('666', pseudo('nth-child', num)(
            $`width: ${num}px;`,
            style.borderBottom($`${num}px solid #000`),
            style.borderBox(),
        ), pseudo('hover')(
            style.borderBottom($`${num}px solid #000`),
            style.borderBox(),
        )),

        div('444',
            style.borderBottom($`${num}px solid`) // react builder
                .fontSize(num) // IReactItem
                .marginLeft(computed(() => num.value + 1)) // IComputedItem
                .marginTop(() => num.value + 1, 'px', 'i') // TComputedFunc
                .marginRight(10)
                .marginBottom('10px')
        )
        
    ];
}