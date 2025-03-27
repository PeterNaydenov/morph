!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t(require("@peter.naydenov/walk")):"function"==typeof define&&define.amd?define(["@peter.naydenov/walk"],t):(e="undefined"!=typeof globalThis?globalThis:e||self).morph=t(e.walk)}(this,(function(e){"use strict";function t(e){return function t(n){const{TG_PRX:a,TG_SFX:o,TG_SIZE_P:l,TG_SIZE_S:s}=e;let i,c,u,f=[];if("string"!=typeof n)return r("notAString");if(0==n.length)return[];if(i=n.indexOf(a),0<i&&f.push(n.slice(0,i)),-1==i)return f.push(n),f;{if(u=n.indexOf(a,i+l),c=n.indexOf(o),-1==c)return r("missingClosing");if(c<i)return r("closedBeforeOpened");if(c+=s,-1!=u&&u<c)return r("newBeforeClosed");f.push(n.slice(i,c));let e=t(n.slice(c));return f.concat(e)}}}function r(e){switch(e){case"notAString":return"Error: Template is not a string.";case"missingClosing":return"Error: Placeholder with missing closing tag.";case"closedBeforeOpened":return"Error: Placeholder closing tag without starting one.";case"newBeforeClosed":return"Error: Nested placeholders. Close placeholder before open new one.";default:return"Error: Unknown template error."}}function n(t,r){const n=[];let a=0;if(t instanceof Function)return{dataDeepLevel:0,nestedData:[[t()]]};if(null==t)return{dataDeepLevel:0,nestedData:[null]};if("string"==typeof t)return{dataDeepLevel:0,nestedData:[[t]]};const o=structuredClone(t);if(!r.includes("#"))return n.push([o]),{dataDeepLevel:0,nestedData:n};return e({data:o,objectCallback:function({key:e,value:t,breadcrumbs:r}){return e===r?(n[0]=[t],t):(a=r.split("/").length-1,n[a]||(n[a]=[]),n[a].push(t),t)}}),{dataDeepLevel:a,nestedData:n}}function*a(e,t){let r=function(e={}){let t=[],{type:r,limit:n,onLimit:a}=Object.assign({},{type:"FIFO",limit:!1,onLimit:"update"},e),o="LIFO"===r.toUpperCase(),l=!1;function s(e=1,r=0){let n=[];return r>0&&Array.from({length:r}).map((()=>t.pop())),1==e?t.pop():(Array.from({length:e}).map((()=>{let e=t.pop();null!=e&&n.push(e)})),n)}function i(e=1,r=0){let n=[],a=t.length-r;return e>1&&Array.from({length:e}).map((()=>{null!=t[a-1]&&n.push(t[a-1]),a--})),1==e?t[t.length-1]:n}function c(){}return c.prototype={pull:s,pullReverse:function(e=1,t=0){let r=s(e,t);return r instanceof Array?r.reverse():r},peek:i,peekReverse:function(e=1,t=0){const r=i(e,t);return r instanceof Array?r.reverse():r},getSize:()=>t.length,isEmpty:()=>0==t.length,reset:()=>(t=[],!0),debug:()=>[...t]},c.prototype.push=o?function(e){const r=e instanceof Array,o=r?e.length:1;let i=!1;if("full"!==a||!l){if(n&&r&&o>n&&(e=e.slice(0,-o+n)),n){const o=(r?e.length:1)+t.length;o>=n&&"full"===a&&(e=e.slice(0,-(o-n))),o>=n&&"update"===a&&(i=s(o-n))}return t=e instanceof Array?t.concat(e):t.concat([e]),l=!!n&&t.length===n,i||void 0}}:function(e){const r=e instanceof Array,o=r?e.length:1;let i=!1;if("full"!==a||!l){if(n&&r&&o>n&&(e=e.slice(o-n)),n){const o=(r?e.length:1)+t.length;o>=n&&"full"===a&&(e=e.slice(0,-(o-n))),o>=n&&"update"===a&&(i=s(o-n))}return t=r?e.reduce(((e,t)=>[t,...e]),t):[e].reduce(((e,t)=>[t,...e]),t),l=!!n&&t.length===n,i||void 0}},new c}({type:"LIFO"});for(let n=0;n<=t;n++)r.push(e[n]);for(;r&&!r.isEmpty();){let e=yield r.pull();e&&r.push(e)}}var o={TG_PRX:"{{",TG_SFX:"}}",TG_SIZE_P:2,TG_SIZE_S:2};function l(e){return null==e?"null":"string"==typeof e||"number"==typeof e||"boolean"==typeof e?"primitive":"function"==typeof e?"function":e instanceof Array?"array":e instanceof Object?"object":void 0}function s(e,r,n,...a){e instanceof Object&&Object.entries(e).forEach((([t,r])=>{r instanceof Object&&(e[t]=r.text),r instanceof Array&&(e[t]=r[0])}));const l="function"==typeof n[r];return e=function(e={}){return"string"==typeof e?{text:e}:e}(e),l?n[r](e,...a):function(e,r){if(null==r)return null;const n=t(o)(e),a=o;return n.forEach(((e,t)=>{if(e.includes(a.TG_PRX)){const o=e.replace(a.TG_PRX,"").replace(a.TG_SFX,"").trim();r[o]&&(n[t]=r[o])}})),n.join("")}(n[r],e)}function i(r,i=!1,c={}){const{hasError:u,placeholders:f,chop:d,helpers:p,handshake:h}=function(e){const{template:r,helpers:n={},handshake:a}=e,{TG_PRX:l,TG_SFX:s}=o,i=[],c="string"==typeof r?r.replace(/<!--[\s\S]*?-->/g,"").replace(/\s{2,}/g," "):r;let u=null;const f=t(o)(c);return"string"==typeof f?u=f:f.forEach(((e,t)=>{const r=RegExp(l+"\\s*(.*?)\\s*(?::\\s*(.*?)\\s*)?"+s,"g");if(e.includes(l)){const a=r.exec(e);i.push({index:t,data:(n=a[1],n||null),action:a[2]?a[2].split(",").map((e=>e.trim())):null})}var n})),i.forEach((e=>{e.action&&e.action.every((e=>"#"===e||"^^"===e||!(!e.startsWith("^")||"^^"===e)||(e.startsWith("?")&&(e=e.replace("?","")),e.startsWith("+")&&(e=e.replace("+","")),e.startsWith("[]")&&(e=e.replace("[]","")),e.startsWith(">")&&(e=e.replace(">","")),""===e||!!n[e]||(u=`Error: Missing helper: ${e}`,!1))))})),{hasError:u,placeholders:i,chop:f,helpers:n,handshake:a}}(r);if(u){function m(){return u}return i?[!1,m]:m}{let y=structuredClone(d);function g(t={},r={},...o){const i=[],u={};let d=l(t),m={...c,...r};if(t=e({data:t}),"null"===d)return y.join("");if("string"==typeof t)switch(t){case"raw":return y.join("");case"demo":if(!h)return"Error: No handshake data.";d=l(t=h);break;case"handshake":return h?structuredClone(h):"Error: No handshake data.";case"placeholders":return f.map((e=>y[e.index])).join(", ");default:return`Error: Wrong command "${t}". Available commands: raw, demo, handshake, placeholders.`}return"array"!==d&&(t=[t]),"null"===d?y.join(""):(t.forEach((t=>{f.forEach((r=>{const{index:o,data:i,action:c}=r,f=!c&&i,d=structuredClone(u),h={dependencies:m,memory:d};if(f){const e=t[i];switch(l(e)){case"function":return void(y[o]=e());case"primitive":return void(y[o]=e);case"array":return void("primitive"===l(e[0])&&(y[o]=e[0]));case"object":return void(e.text&&(y[o]=e.text))}}else{let{dataDeepLevel:r,nestedData:f}=n("@all"===i||null===i||"@root"===i?t:t[i],c),d=a(function(e,t=10){let r={},n=[...e],a=0,o=0,l=0;n.forEach((e=>{"#"===e&&l++})),l<t&&console.error(`Error: Not enough level markers (#) for data with depth level ${t}. Found ${l} level markers in actions: ${e.join(", ")}`);do{r[o]=[],o++}while(o<=t);return n.every((e=>"#"===e?(a++,!(a>t)):e.startsWith("?")?(r[a].push({type:"route",name:e.replace("?",""),level:a}),!0):e.startsWith("^")&&"^^"!==e?(r[a].push({type:"save",name:e.replace("^",""),level:a}),!0):"^^"===e?(r[a].push({type:"overwrite",name:"none",level:a}),!0):e.startsWith("+")?(r[a].push({type:"extendedRender",name:e.replace("+",""),level:a}),!0):e.startsWith("[]")?(r[a].push({type:"mix",name:e.replace("[]",""),level:a}),!0):e.startsWith(">")?(r[a].push({type:"data",name:e.replace(">",""),level:a}),!0):(""===e||r[a].push({type:"render",name:e,level:a}),!0))),r}(c,r),r);for(let r of d){let{type:n,name:a,level:o}=r;(f[o]||[]).forEach(((r,i)=>{let c=l(r);switch(n){case"route":switch(c){case"array":r.forEach(((e,t)=>{if(null==e)return;const n=l(e),o=p[a]({data:e,...h});null!=o&&("object"===n?r[t].text=s(e,o,p,m):r[t]=s(e,o,p,m))}));break;case"object":r.text=s(r,a,p,m)}break;case"save":u[a]=structuredClone(r);break;case"overwrite":t=structuredClone(r);break;case"data":switch(c){case"array":r.forEach(((e,t)=>r[t]=e instanceof Function?p[a]({data:e(),...h}):p[a]({data:e,...h})));break;case"object":f[o]=[p[a]({data:r,...h})];break;case"function":f[o]=[p[a]({data:r(),...h})];break;case"primitive":f[o]=p[a]({data:r,...h})}break;case"render":const d="function"==typeof p[a];switch(c){case"array":d?r.forEach(((e,t)=>{if(null==e)return;const n=l(e),o=p[a]({data:e,...h});null==o&&(r[t]=null),"object"===n?e.text=o:r[t]=o})):r.forEach(((e,t)=>{if(null==e)return;const n=l(e),o=s(e,a,p,m);null==o?r[t]=null:"object"===n?e.text=o:r[t]=o}));break;case"function":f[o]=p[a]({data:r(),...h});break;case"primitive":f[o]=s(r,a,p,m);break;case"object":d?f[o][i].text=p[a]({data:r,...h}):r.text=s(r,a,p,m)}break;case"extendedRender":"function"==typeof p[a]&&f[0].forEach(((e,t)=>f[0][t]=p[a]({data:e,...h})));break;case"mix":if(""===a)switch(c){case"object":Object.keys(r).find((e=>e.includes("/")))?Object.entries(r).forEach((([e,t])=>f[o][e]=t.text)):f[o]=r.text;for(let g=o-1;g>=0;g--)f[g]=e({data:f[g],objectCallback:y});function y({value:e,breadcrumbs:t}){return f[o][t]?f[o][t]:e}break;case"array":r.forEach(((e,t)=>{if(t>0){let n=l(e);if(null==e)return;r[0]+="object"===n?`${e.text}`:`${e}`,r.toSpliced(t,1)}else{let t=l(e);if(r[0]="",null===t)return;r[0]="object"===t?`${e.text}`:`${e}`}})),r.length=1}else{let b=p[a]({data:r,...h}),v=l(b);switch(r.forEach(((e,t)=>r.splice(t,1))),r.length=0,v){case"primitive":r[0]=b;break;case"array":r.push(...b)}}}}))}if(f instanceof Array&&1===f.length&&f[0]instanceof Array&&(f=f[0]),null==f[0])return;let g=l(f[0]),b=f[0];switch(g){case"primitive":if(null==b)return;y[o]=b;break;case"object":if(null==b.text)return;y[o]=b.text;break;case"array":const e=l(b[0]);y[o]="object"===e?b.map((e=>e.text)).join(""):b.join("")}}})),i.push(y.join(""))})),"array"===d?i:o?o.reduce(((e,t)=>"function"!=typeof t?e:t(e,m)),i.join("")):i.join(""))}return i?[!0,g]:g}}const c={default:{}};return{build:i,get:function(e){if(!(e instanceof Array))return function(){return'Error: Argument "location" is a string. Should be an array. E.g. ["templateName", "storageName"].'};const[t,r="default"]=e;return c[r]?c[r][t]?c[r][t]:function(){return`Error: Template "${t}" does not exist in storage "${r}".`}:function(){return`Error: Storage "${r}" does not exist.`}},add:function(e,t,...r){const[n,a="default"]=e;if(null==t)return void console.warn(`Warning: Template ${a}/${n} is not added to storage. The template is null.`);let o=t,l=!0;if(c[a]||(c[a]={}),"function"!=typeof t){let e=i(t,!0,...r);l=e[0],o=e[1]}l?c[a][n]=o:console.error(`Error: Template "${n}" looks broken and is not added to storage.`)},list:function(e=["default"]){return e.map((e=>c[e]?Object.keys(c[e]):[])).flat()},clear:function(){Object.keys(c).forEach((e=>{"default"!=e?delete c[e]:c.default={}}))},remove:function(e){const[t,r="default"]=e;return c[r]?c[r][t]?void delete c[r][t]:`Error: Template "${t}" does not exist in storage "${r}".`:`Error: Storage "${r}" does not exist.`}}}));
