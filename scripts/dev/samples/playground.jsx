/*
 * @Author: chenzhongsheng
 * @Date: 2023-08-17 20:19:34
 * @Description: Coding something
 */

const a = {a: true};

a.a = false;

window.a = a;

// <div $parent={document.body} style={`color: ${a.a ? '#f44' : '#111'}`}>111</div>;
// <div $parent={document.body} style={{
//     backgroundColor: `${a.a ? '#f44' : '#111'}`
// }}>111</div>;


<div $parent={document.body} class={`def ${a.a ? 'a' : ''}`}>111</div>;
<div $parent={document.body} class={{
    b: () => a.a
}}>111</div>;