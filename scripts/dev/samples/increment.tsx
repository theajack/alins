/*
 * @Author: chenzhongsheng
 * @Date: 2023-08-02 23:54:52
 * @Description: Coding something
 */

let count = 1;

let v1 = 1; // @reactive

let v2 = v1 + 1; set: v=>{
    v1 = v;
}

const a = <div>1<></></div>;

<button
    $parent={document.body}
    onclick={() => {count++;}}
>click:{count}</button>;