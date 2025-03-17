!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t(require("@peter.naydenov/walk")):"function"==typeof define&&define.amd?define(["@peter.naydenov/walk"],t):(e="undefined"!=typeof globalThis?globalThis:e||self).morph=t(e.walk)}(this,(function(e){"use strict";function t(e){return function t(n){const{TG_PRX:o,TG_SFX:a,TG_SIZE_P:l,TG_SIZE_S:i}=e;let s,c,u,f=[];if("string"!=typeof n)return r("notAString");if(0==n.length)return[];if(s=n.indexOf(o),0<s&&f.push(n.slice(0,s)),-1==s)return f.push(n),f;{if(u=n.indexOf(o,s+l),c=n.indexOf(a),-1==c)return r("missingClosing");if(c<s)return r("closedBeforeOpened");if(c+=i,-1!=u&&u<c)return r("newBeforeClosed");f.push(n.slice(s,c));let e=t(n.slice(c));return f.concat(e)}}}function r(e){switch(e){case"notAString":return"Error: Template is not a string.";case"missingClosing":return"Error: Placeholder with missing closing tag.";case"closedBeforeOpened":return"Error: Placeholder closing tag without starting one.";case"newBeforeClosed":return"Error: Nested placeholders. Close placeholder before open new one.";default:return"Error: Unknown template error."}}function n(t,r){const n=[];let o=0;if(t instanceof Function)return{dataDeepLevel:0,nestedData:[[t()]]};if(null==t)return{dataDeepLevel:0,nestedData:[null]};if("string"==typeof t)return{dataDeepLevel:0,nestedData:[[t]]};if(!r.includes("#"))return n.push([t]),{dataDeepLevel:0,nestedData:n};return e({data:t,objectCallback:function({key:e,value:t,breadcrumbs:r}){return e===r?(n[0]=[t],t):(o=r.split("/").length-1,n[o]||(n[o]=[]),n[o].push(t),t)}}),{dataDeepLevel:o,nestedData:n}}function*o(e,t){let r=function(e={}){let t=[],{type:r,limit:n,onLimit:o}=Object.assign({},{type:"FIFO",limit:!1,onLimit:"update"},e),a="LIFO"===r.toUpperCase(),l=!1;function i(e=1,r=0){let n=[];return r>0&&Array.from({length:r}).map((()=>t.pop())),1==e?t.pop():(Array.from({length:e}).map((()=>{let e=t.pop();null!=e&&n.push(e)})),n)}function s(e=1,r=0){let n=[],o=t.length-r;return e>1&&Array.from({length:e}).map((()=>{null!=t[o-1]&&n.push(t[o-1]),o--})),1==e?t[t.length-1]:n}function c(){}return c.prototype={pull:i,pullReverse:function(e=1,t=0){let r=i(e,t);return r instanceof Array?r.reverse():r},peek:s,peekReverse:function(e=1,t=0){const r=s(e,t);return r instanceof Array?r.reverse():r},getSize:()=>t.length,isEmpty:()=>0==t.length,reset:()=>(t=[],!0),debug:()=>[...t]},c.prototype.push=a?function(e){const r=e instanceof Array,a=r?e.length:1;let s=!1;if("full"!==o||!l){if(n&&r&&a>n&&(e=e.slice(0,-a+n)),n){const a=(r?e.length:1)+t.length;a>=n&&"full"===o&&(e=e.slice(0,-(a-n))),a>=n&&"update"===o&&(s=i(a-n))}return t=e instanceof Array?t.concat(e):t.concat([e]),l=!!n&&t.length===n,s||void 0}}:function(e){const r=e instanceof Array,a=r?e.length:1;let s=!1;if("full"!==o||!l){if(n&&r&&a>n&&(e=e.slice(a-n)),n){const a=(r?e.length:1)+t.length;a>=n&&"full"===o&&(e=e.slice(0,-(a-n))),a>=n&&"update"===o&&(s=i(a-n))}return t=r?e.reduce(((e,t)=>[t,...e]),t):[e].reduce(((e,t)=>[t,...e]),t),l=!!n&&t.length===n,s||void 0}},new c}({type:"LIFO"});for(let n=0;n<=t;n++)r.push(e[n]);for(;r&&!r.isEmpty();){let e=yield r.pull();e&&r.push(e)}}var a={TG_PRX:"{{",TG_SFX:"}}",TG_SIZE_P:2,TG_SIZE_S:2};function l(e){return null==e?"null":"string"==typeof e||"number"==typeof e||"boolean"==typeof e?"primitive":"function"==typeof e?"function":e instanceof Array?"array":e instanceof Object?"object":void 0}function i(e,r,n,...o){e instanceof Object&&Object.entries(e).forEach((([t,r])=>{r instanceof Object&&(e[t]=r.text),r instanceof Array&&(e[t]=r[0])}));const l="function"==typeof n[r];return e=function(e={}){return"string"==typeof e?{text:e}:e}(e),l?n[r](e,...o):function(e,r){if(null==r)return null;const n=t(a)(e),o=a;return n.forEach(((e,t)=>{if(e.includes(o.TG_PRX)){const a=e.replace(o.TG_PRX,"").replace(o.TG_SFX,"").trim();r[a]&&(n[t]=r[a])}})),n.join("")}(n[r],e)}function s(r,s=!1,c={}){const{hasError:u,placeholders:f,chop:p,helpers:d,handshake:h}=function(e){const{template:r,helpers:n={},handshake:o}=e,{TG_PRX:l,TG_SFX:i}=a,s=[],c="string"==typeof r?r.replace(/<!--[\s\S]*?-->/g,"").replace(/\s{2,}/g," "):r;let u=null;const f=t(a)(c);return"string"==typeof f?u=f:f.forEach(((e,t)=>{const r=RegExp(l+"\\s*(.*?)\\s*(?::\\s*(.*?)\\s*)?"+i,"g");if(e.includes(l)){const o=r.exec(e);s.push({index:t,data:(n=o[1],n||null),action:o[2]?o[2].split(",").map((e=>e.trim())):null})}var n})),s.forEach((e=>{e.action&&e.action.every((e=>"#"===e||(e.startsWith("?")&&(e=e.replace("?","")),e.startsWith("+")&&(e=e.replace("+","")),e.startsWith("[]")&&(e=e.replace("[]","")),e.startsWith(">")&&(e=e.replace(">","")),""===e||!!n[e]||(u=`Error: Missing helper: ${e}`,!1))))})),{hasError:u,placeholders:s,chop:f,helpers:n,handshake:o}}(r);if(u){function y(){return u}return s?[!1,y]:y}{let g=structuredClone(p);function m(t={},r={},...a){const s=[];let u=l(t),p={...c,...r};if(t=e({data:t}),"null"===u)return g.join("");if("string"==typeof t)switch(t){case"raw":return g.join("");case"demo":if(!h)return"Error: No handshake data.";u=l(t=h);break;case"handshake":return h?structuredClone(h):"Error: No handshake data.";case"placeholders":return f.map((e=>g[e.index])).join(", ");default:return`Error: Wrong command "${t}". Available commands: raw, demo, handshake, placeholders.`}return"array"!==u&&(t=[t]),"null"===u?g.join(""):(t.forEach((t=>{f.forEach((r=>{const{index:a,data:s,action:c}=r;if(!c&&s){const e=t[s];switch(l(e)){case"function":return void(g[a]=e());case"primitive":return void(g[a]=e);case"array":return void("primitive"===l(e[0])&&(g[a]=e[0]));case"object":return void(e.text&&(g[a]=e.text))}}else{let{dataDeepLevel:r,nestedData:u}=n("@all"===s||null===s||"@root"===s?t:t[s],c),f=o(function(e,t=10){let r={},n=[...e],o=0,a=0,l=0;n.forEach((e=>{"#"===e&&l++})),l<t&&console.error(`Error: Not enough level markers (#) for data with depth level ${t}. Found ${l} level markers in actions: ${e.join(", ")}`);do{r[a]=[],a++}while(a<=t);return n.every((e=>"#"===e?(o++,!(o>t)):e.startsWith("?")?(r[o].push({type:"route",name:e.replace("?",""),level:o}),!0):e.startsWith("+")?(r[o].push({type:"extendedRender",name:e.replace("+",""),level:o}),!0):e.startsWith("[]")?(r[o].push({type:"mix",name:e.replace("[]",""),level:o}),!0):e.startsWith(">")?(r[o].push({type:"data",name:e.replace(">",""),level:o}),!0):(""===e||r[o].push({type:"render",name:e,level:o}),!0))),r}(c,r),r);for(let t of f){let{type:r,name:n,level:o}=t;(u[o]||[]).forEach((t=>{let a=l(t);switch(r){case"route":switch(a){case"array":t.forEach(((e,r)=>{if(null==e)return;const o=l(e),a=d[n](e);null!=a&&("object"===o?t[r].text=i(e,a,d,p):t[r]=i(e,a,d,p))}));break;case"object":t.text=i(t,n,d,p)}break;case"data":switch(a){case"array":t.forEach(((e,r)=>t[r]=e instanceof Function?d[n](e()):d[n](e)));break;case"object":u[o]=[d[n](t)];break;case"function":u[o]=[d[n](t())];break;case"primitive":u[o]=d[n](t)}break;case"render":const s="function"==typeof d[n];switch(a){case"array":s?t.forEach(((e,r)=>{if(null==e)return;const o=l(e),a=d[n](e,p);null==a&&(t[r]=null),"object"===o?e.text=a:t[r]=a})):t.forEach(((e,r)=>{if(null==e)return;const o=l(e),a=i(e,n,d,p);null==a?t[r]=null:"object"===o?e.text=a:t[r]=a}));break;case"function":u[o]=d[n](t(),p);break;case"primitive":u[o]=i(t,n,d,p);break;case"object":s?u[o][0].text=d[n](t,p):t.text=i(t,n,d,p)}break;case"extendedRender":"function"==typeof d[n]&&(u[o]=d[n](u[0][0]));break;case"mix":if(""===n)switch(a){case"object":Object.keys(t).find((e=>e.includes("/")))?Object.entries(t).forEach((([e,t])=>u[o][e]=t.text)):u[o]=t.text;for(let f=o-1;f>=0;f--)u[f]=e({data:u[f],objectCallback:c});function c({value:e,breadcrumbs:t}){return u[o][t]?u[o][t]:e}break;case"array":t.forEach(((e,r)=>{if(r>0){let n=l(e);if(null==e)return;t[0]+="object"===n?`${e.text}`:`${e}`,t.toSpliced(r,1)}else{let r=l(e);if(t[0]="",null===r)return;t[0]="object"===r?`${e.text}`:`${e}`}})),t.length=1}else{let h=d[n](t),y=l(h);switch(t.forEach(((e,r)=>t.splice(r,1))),t.length=0,y){case"primitive":t[0]=h;break;case"array":t.push(...h)}}}}))}if(u instanceof Array&&1===u.length&&u[0]instanceof Array&&(u=u[0]),null==u[0])return;let h=l(u[0]),y=u[0];switch(h){case"primitive":if(null==y)return;g[a]=y;break;case"object":if(null==y.text)return;g[a]=y.text;break;case"array":const e=l(y[0]);g[a]="object"===e?y.map((e=>e.text)).join(""):y.join("")}}})),s.push(g.join(""))})),"array"===u?s:a?a.reduce(((e,t)=>"function"!=typeof t?e:t(e,p)),s.join("")):s.join(""))}return s?[!0,m]:m}}const c={default:{}};return{build:s,get:function(e){if(!(e instanceof Array))return function(){return'Error: Argument "location" is a string. Should be an array. E.g. ["templateName", "storageName"].'};const[t,r="default"]=e;return c[r]?c[r][t]?c[r][t]:function(){return`Error: Template "${t}" does not exist in storage "${r}".`}:function(){return`Error: Storage "${r}" does not exist.`}},add:function(e,t,...r){const[n,o="default"]=e;if(null==t)return void console.warn(`Warning: Template ${o}/${n} is not added to storage. The template is null.`);let a=t,l=!0;if(c[o]||(c[o]={}),"function"!=typeof t){let e=s(t,!0,...r);l=e[0],a=e[1]}l?c[o][n]=a:console.error(`Error: Template "${n}" looks broken and is not added to storage.`)},list:function(e=["default"]){return e.map((e=>c[e]?Object.keys(c[e]):[])).flat()},clear:function(){Object.keys(c).forEach((e=>{"default"!=e?delete c[e]:c.default={}}))},remove:function(e){const[t,r="default"]=e;return c[r]?c[r][t]?void delete c[r][t]:`Error: Template "${t}" does not exist in storage "${r}".`:`Error: Storage "${r}" does not exist.`}}}));
