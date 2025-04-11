"use strict";var e=require("@peter.naydenov/walk"),t=require("@peter.naydenov/stack");function r(e){return function t(r){const{TG_PRX:a,TG_SFX:o,TG_SIZE_P:s,TG_SIZE_S:c}=e;let l,i,u,f=[];if("string"!=typeof r)return n("notAString");if(0==r.length)return[];if(l=r.indexOf(a),0<l&&f.push(r.slice(0,l)),-1==l)return f.push(r),f;{if(u=r.indexOf(a,l+s),i=r.indexOf(o),-1==i)return n("missingClosing");if(i<l)return n("closedBeforeOpened");if(i+=c,-1!=u&&u<i)return n("newBeforeClosed");f.push(r.slice(l,i));let e=t(r.slice(i));return f.concat(e)}}}function n(e){switch(e){case"notAString":return"Error: Template is not a string.";case"missingClosing":return"Error: Placeholder with missing closing tag.";case"closedBeforeOpened":return"Error: Placeholder closing tag without starting one.";case"newBeforeClosed":return"Error: Nested placeholders. Close placeholder before open new one.";default:return"Error: Unknown template error."}}var a={TG_PRX:"{{",TG_SFX:"}}",TG_SIZE_P:2,TG_SIZE_S:2};function o(e){return null==e?"null":"string"==typeof e||"number"==typeof e||"boolean"==typeof e?"primitive":"function"==typeof e?"function":e instanceof Array?"array":e instanceof Object?"object":void 0}function s(e,t,n,...o){e instanceof Object&&Object.entries(e).forEach((([t,r])=>{r instanceof Object&&(e[t]=r.text),r instanceof Array&&(e[t]=r[0])}));const s="function"==typeof n[t];return e=function(e={}){return"string"==typeof e?{text:e}:e}(e),s?n[t](e,...o):function(e,t){if(null==t)return null;const n=r(a)(e),o=a;return n.forEach(((e,r)=>{if(e.includes(o.TG_PRX)){const a=e.replace(o.TG_PRX,"").replace(o.TG_SFX,"").trim();t.hasOwnProperty(a)&&(n[r]=t[a])}})),n.join("")}(n[t],e)}function c(n,c=!1,l={}){const{hasError:i,placeholders:u,chop:f,helpers:d,handshake:p}=function(e){const{template:t,helpers:n={},handshake:o}=e,{TG_PRX:s,TG_SFX:c}=a,l=[],i="string"==typeof t?t.replace(/<!--[\s\S]*?-->/g,"").replace(/\s{2,}/g," "):t;let u=null;const f=r(a)(i);return"string"==typeof f?u=f:f.forEach(((e,t)=>{const r=RegExp(s+"\\s*(.*?)\\s*(?::\\s*(.*?)\\s*)?"+c,"g");if(e.includes(s)){const a=r.exec(e);l.push({index:t,data:(n=a[1],n||null),action:a[2]?a[2].split(",").map((e=>e.trim())):null})}var n})),l.forEach((e=>{e.action&&e.action.every((e=>"#"===e||"^^"===e||!(!e.startsWith("^")||"^^"===e)||(e.startsWith("?")&&(e=e.replace("?","")),e.startsWith("+")&&(e=e.replace("+","")),e.startsWith("[]")&&(e=e.replace("[]","")),e.startsWith(">")&&(e=e.replace(">","")),""===e||!!n[e]||(u=`Error: Missing helper: ${e}`,!1))))})),{hasError:u,placeholders:l,chop:f,helpers:n,handshake:o}}(n);if(i){function h(){return i}return c?[!1,h]:h}{let b=structuredClone(f);function m(r={},n={},...a){const c=[],i={};let f=o(r),h={...l,...n};if(r=e({data:r}),"null"===f)return b.join("");if("string"==typeof r)switch(r){case"raw":return b.join("");case"demo":if(!p)return"Error: No handshake data.";f=o(r=p);break;case"handshake":return p?structuredClone(p):"Error: No handshake data.";case"placeholders":return u.map((e=>b[e.index])).join(", ");default:return`Error: Wrong command "${r}". Available commands: raw, demo, handshake, placeholders.`}return"array"!==f&&(r=[r]),"null"===f?b.join(""):(r.forEach((r=>{u.forEach((n=>{const{index:a,data:c,action:l}=n,u=!l&&c,f=structuredClone(i),p={dependencies:h,memory:f};let m=r;if(c&&c.includes("/")?c.split("/").forEach((e=>{m=m.hasOwnProperty(e)?m[e]:[]})):"@all"===c||null===c||"@root"===c?m=r:c&&(m=m[c]),u){switch(o(m)){case"function":return void(b[a]=m());case"primitive":return void(b[a]=m);case"array":return void("primitive"===o(m[0])&&(b[a]=m[0]));case"object":return void(m.text&&(b[a]=m.text))}}else{let{dataDeepLevel:n,nestedData:c}=function(t,r){const n=[];let a=0;if(t instanceof Function)return{dataDeepLevel:0,nestedData:[[t()]]};if(null==t)return{dataDeepLevel:0,nestedData:[null]};if("string"==typeof t)return{dataDeepLevel:0,nestedData:[[t]]};const o=structuredClone(t);return r.includes("#")?(e({data:o,objectCallback:function({key:e,value:t,breadcrumbs:r}){return e===r?(n[0]=[t],t):(a=r.split("/").length-1,n[a]||(n[a]=[]),n[a].push(t),t)}}),{dataDeepLevel:a,nestedData:n}):(n.push([o]),{dataDeepLevel:0,nestedData:n})}(m,l),u=function*(e,r){let n=t({type:"LIFO"});for(let t=0;t<=r;t++)n.push(e[t]);for(;n&&!n.isEmpty();){let e=yield n.pull();e&&n.push(e)}}(function(e,t=10){let r={},n=[...e],a=0,o=0,s=0;n.forEach((e=>{"#"===e&&s++})),s<t&&console.error(`Error: Not enough level markers (#) for data with depth level ${t}. Found ${s} level markers in actions: ${e.join(", ")}`);do{r[o]=[],o++}while(o<=t);return n.every((e=>"#"===e?(a++,!(a>t)):e.startsWith("?")?(r[a].push({type:"route",name:e.replace("?",""),level:a}),!0):e.startsWith("^")&&"^^"!==e?(r[a].push({type:"save",name:e.replace("^",""),level:a}),!0):"^^"===e?(r[a].push({type:"overwrite",name:"none",level:a}),!0):e.startsWith("+")?(r[a].push({type:"extendedRender",name:e.replace("+",""),level:a}),!0):e.startsWith("[]")?(r[a].push({type:"mix",name:e.replace("[]",""),level:a}),!0):e.startsWith(">")?(r[a].push({type:"data",name:e.replace(">",""),level:a}),!0):(""===e||r[a].push({type:"render",name:e,level:a}),!0))),r}(l,n),n);for(let t of u){let{type:n,name:a,level:l}=t;(c[l]||[]).forEach(((t,u)=>{let f=o(t);switch(n){case"route":switch(f){case"array":t.forEach(((e,r)=>{if(null==e)return;const n=o(e),c=d[a]({data:e,...p});null!=c&&("object"===n?t[r].text=s(e,c,d,h):t[r]=s(e,c,d,h))}));break;case"object":t.text=s(t,a,d,h)}break;case"save":i[a]=structuredClone(t);break;case"overwrite":r=structuredClone(t);break;case"data":switch(f){case"array":t.forEach(((e,r)=>t[r]=e instanceof Function?d[a]({data:e(),...p}):d[a]({data:e,...p})));break;case"object":c[l]=[d[a]({data:t,...p})];break;case"function":c[l]=[d[a]({data:t(),...p})];break;case"primitive":c[l]=d[a]({data:t,...p})}break;case"render":const b="function"==typeof d[a];switch(f){case"array":b?t.forEach(((e,r)=>{if(null==e)return;const n=o(e),s=d[a]({data:e,...p});null==s&&(t[r]=null),"object"===n?e.text=s:t[r]=s})):t.forEach(((e,r)=>{if(null==e)return;const n=o(e),c=s(e,a,d,h);null==c?t[r]=null:"object"===n?e.text=c:t[r]=c}));break;case"function":c[l]=d[a]({data:t(),...p});break;case"primitive":c[l]=s(t,a,d,h);break;case"object":b?c[l][u].text=d[a]({data:t,...p}):t.text=s(t,a,d,h)}break;case"extendedRender":"function"==typeof d[a]&&c[0].forEach(((e,t)=>c[0][t]=d[a]({data:e,...p})));break;case"mix":if(""===a)switch(f){case"object":Object.keys(t).find((e=>e.includes("/")))?Object.entries(t).forEach((([e,t])=>c[l][e]=t.text)):c[l]=t.text;for(let y=l-1;y>=0;y--)c[y]=e({data:c[y],objectCallback:m});function m({value:e,breadcrumbs:t}){return c[l][t]?c[l][t]:e}break;case"array":t.forEach(((e,r)=>{if(r>0){let n=o(e);if(null==e)return;t[0]+="object"===n?`${e.text}`:`${e}`,t.toSpliced(r,1)}else{let r=o(e);if(t[0]="",null===r)return;t[0]="object"===r?`${e.text}`:`${e}`}})),t.length=1}else{let v=d[a]({data:t,...p}),g=o(v);switch(t.forEach(((e,r)=>t.splice(r,1))),t.length=0,g){case"primitive":t[0]=v;break;case"array":t.push(...v)}}}}))}if(c instanceof Array&&1===c.length&&c[0]instanceof Array&&(c=c[0]),null==c[0])return;let f=o(c[0]),y=c[0];switch(f){case"primitive":if(null==y)return;b[a]=y;break;case"object":if(null==y.text)return;b[a]=y.text;break;case"array":const e=o(y[0]);b[a]="object"===e?y.map((e=>e.text)).join(""):y.join("")}}})),c.push(b.join(""))})),"array"===f?c:a?a.reduce(((e,t)=>"function"!=typeof t?e:t(e,h)),c.join("")):c.join(""))}return c?[!0,m]:m}}const l={default:{}};const i={build:c,get:function(e){if(!(e instanceof Array))return function(){return'Error: Argument "location" is a string. Should be an array. E.g. ["templateName", "storageName"].'};const[t,r="default"]=e;return l[r]?l[r][t]?l[r][t]:function(){return`Error: Template "${t}" does not exist in storage "${r}".`}:function(){return`Error: Storage "${r}" does not exist.`}},add:function(e,t,...r){const[n,a="default"]=e;if(null==t)return void console.warn(`Warning: Template ${a}/${n} is not added to storage. The template is null.`);let o=t,s=!0;if(l[a]||(l[a]={}),"function"!=typeof t){let e=c(t,!0,...r);s=e[0],o=e[1]}s?l[a][n]=o:console.error(`Error: Template "${n}" looks broken and is not added to storage.`)},list:function(e=["default"]){return e.map((e=>l[e]?Object.keys(l[e]):[])).flat()},clear:function(){Object.keys(l).forEach((e=>{"default"!=e?delete l[e]:l.default={}}))},remove:function(e){const[t,r="default"]=e;return l[r]?l[r][t]?void delete l[r][t]:`Error: Template "${t}" does not exist in storage "${r}".`:`Error: Storage "${r}" does not exist.`}};module.exports=i;
