/*
 * @Author: chenzhongsheng
 * @Date: 2023-07-11 11:53:54
 * @Description: Coding something
 */

import {
    version,
    createStore,
    _$c, _$cc, _$ce, _$e, _$es, _$if, _$mf, _$mm, _$mnr,
    _$mu, _$r, _$sw, _$w, defineRenderer, useRenderer
} from 'alins';
import { parseWebAlins } from './parser';

function onDOMContentLoaded () {
    const names = [ 'alins', 'babel', 'jsx' ];
    for (const name of names) {
        const scripts = document.querySelectorAll(`script[type="text/${name}"]`);
        // @ts-ignore
        for (const item of scripts) {
            // @ts-ignore
            onSingleScript(item, !item.hasAttribute('node'), item.hasAttribute('ts'));
        }
    }
}

async function onSingleScript (script: HTMLScriptElement, web = true, ts = false) {
    // __DEV__ && console.log(`web=${web}; ts=${ts}`);
    let code = '';
    if (script.innerText.trim() === '') {
        if (script.src) {
            const result = await fetch(script.src);
            if (result.status === 200) {
                code = await result.text();
            } else {
                throw new Error(result.statusText);
            }
        }
    } else {
        code = script.innerText;
    }
    const output = parseWebAlins(code, { useImport: !web, ts });
    // console.warn(code);
    // console.warn('============>');
    if (__DEV__) console.warn('Compiler output:', output);
    if (output) {
        // exeJs(output);
        const script = document.createElement('script');
        script.textContent = output;
        // script.innerHTML = output;
        document.head.appendChild(script);
    }
}

if (typeof window !== 'undefined') {
    // @ts-ignore
    window.Alins = {
        _$c, _$cc, _$ce, _$e, _$es, _$mf, _$mm, _$mnr,
        _$mu, _$r, _$sw, _$w, _$if, version, createStore,
        useRenderer,
        defineRenderer,
    };
    window.addEventListener('DOMContentLoaded', onDOMContentLoaded, false);
}

// function exeJs (code) {
//     const blob = new Blob([ code ], {type: 'text/javascript'});
//     const objectURL = window.URL.createObjectURL(blob);
//     const script = document.createElement('script');
//     script.onload = () => {
//     	console.log('loaded');
//     };
//     script.src = objectURL;
//     document.head.appendChild(script);
// }
