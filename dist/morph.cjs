"use strict";var e=require("@peter.naydenov/walk"),t=require("@peter.naydenov/stack");function r(e){return function t(r){const{TG_PRX:a,TG_SFX:o,TG_SIZE_P:s,TG_SIZE_S:i}=e;let c,l,u,f=[];if("string"!=typeof r)return n("notAString");if(0==r.length)return[];if(c=r.indexOf(a),0<c&&f.push(r.slice(0,c)),-1==c)return f.push(r),f;{if(u=r.indexOf(a,c+s),l=r.indexOf(o),-1==l)return n("missingClosing");if(l<c)return n("closedBeforeOpened");if(l+=i,-1!=u&&u<l)return n("newBeforeClosed");f.push(r.slice(c,l));let e=t(r.slice(l));return f.concat(e)}}}function n(e){switch(e){case"notAString":return"Error: Template is not a string.";case"missingClosing":return"Error: Placeholder with missing closing tag.";case"closedBeforeOpened":return"Error: Placeholder closing tag without starting one.";case"newBeforeClosed":return"Error: Nested placeholders. Close placeholder before open new one.";default:return"Error: Unknown template error."}}function a(t){const r={};let n=0;if(null==t)return{dataDeepLevel:0,nestedData:[null]};if("string"==typeof t)return{dataDeepLevel:0,nestedData:[t]};return e({data:t,objectCallback:function({key:e,value:t,breadcrumbs:a}){let o=!1;return n=a.split("/").length-1,isNaN(e)||(o=!0),r[n]||(r[n]=o?[]:{}),"root"===e?r[n]=t:o?r[n].push(t):r[n][a]=t,t}}),{dataDeepLevel:n,nestedData:r}}var o={TG_PRX:"{{",TG_SFX:"}}",TG_SIZE_P:2,TG_SIZE_S:2};function s(e){return null==e?"null":"string"==typeof e||"number"==typeof e||"boolean"==typeof e?"primitive":"function"==typeof e?"function":e instanceof Array?"array":e instanceof Object?"object":void 0}function i(e,t,n){const a="function"==typeof n[t];return"primitive"===s(e)&&(e=function(e={}){return"string"==typeof e?{text:e}:e}(e)),a?n[t](e):function(e,t){if(null==t)return null;const n=r(o)(e),a=o;return n.forEach(((e,r)=>{if(e.includes(a.TG_PRX)){const o=e.replace(a.TG_PRX,"").replace(a.TG_SFX,"").trim();t[o]&&(n[r]=t[o])}})),n.join("")}(n[t],e)}function c(e){const{hasError:n,placeholders:c,chop:l,helpers:u,handshake:f}=function(e){const{template:t,helpers:n,handshake:a}=e,{TG_PRX:s,TG_SFX:i,TG_SIZE_P:c,TG_SIZE_S:l}=o,u=[];let f=null;const d=r(o)(t);return"string"==typeof d?f=d:d.forEach(((e,t)=>{const r=RegExp(s+"\\s*(.*?)\\s*(?::\\s*(.*?)\\s*)?"+i,"g");if(e.includes(s)){const a=r.exec(e);u.push({index:t,data:(n=a[1],n||null),action:a[2]?a[2].split(",").map((e=>e.trim())):null})}var n})),u.forEach((e=>{e.action&&e.action.every((e=>"#"===e||(e.startsWith("!")&&(e=e.replace("!","")),e.startsWith("[]")&&(e=e.replace("[]","")),e.startsWith(">")&&(e=e.replace(">","")),""===e||!!n[e]||(f=`Error: Missing helper: ${e}`,!1))))})),{hasError:f,placeholders:u,chop:d,helpers:n,handshake:a}}(e);if(n)return function(){return n};{let e=structuredClone(l);return function(r={}){const n=s(r),o=[];if("string"==typeof r)switch(r){case"raw":return e.join("");case"demo":if(!f)return"Error: No handshake data.";r=f;break;case"handshake":return f?structuredClone(f):"Error: No handshake data.";case"placeholders":return c.map((t=>e[t.index])).join(", ");default:return`Error: Wrong command "${r}". Available commands: raw, demo, handshake, placeholders.`}return"array"!==n&&(r=[r]),r.forEach((r=>{c.forEach((n=>{const{index:o,data:c,action:l}=n;if(!l&&c){const t=r[c];switch(s(t)){case"primitive":return void(e[o]=t);case"array":return void("primitive"===s(t[0])&&(e[o]=t[0]));case"object":return void(t.text&&(e[o]=t.text))}}else{const{dataDeepLevel:n,nestedData:f}=a("@all"===c||null===c?r:r[c]),d=function*(e,r){let n=t({type:"LIFO"});for(let t=0;t<=r;t++)n.push(e[t]);for(;n&&!n.isEmpty();){let e=yield n.pull();e&&n.push(e)}}(function(e,t=10){let r={},n=0,a=[...e],o=0;do{r[o]=[],o++}while(o<=t);return a.every((e=>"#"===e?(n++,!(n>t)):e.startsWith("!")?(r[n].push({type:"route",name:e.replace("!",""),level:n}),!0):e.startsWith("[]")?(r[n].push({type:"mix",name:e.replace("[]",""),level:n}),!0):e.startsWith(">")?(r[n].push({type:"data",name:e.replace(">",""),level:n}),!0):(""===e||r[n].push({type:"render",name:e,level:n}),!0))),r}(l,n),n);for(let e of d){let{type:t,name:r,level:n}=e,a=f[n],o=s(a);switch(t){case"route":switch(o){case"array":a.forEach(((e,t)=>{if(null==e)return;const n=s(e),o=u[r](e);null!=o&&("object"===n?a[t].text=i(e,o,u):a[t]=i(e,o,u))}));break;case"object":a.text=i(a,routeName,u);break;case"primitive":f[n]=i(a,routeName,u)}break;case"data":switch(o){case"array":a.forEach(((e,t)=>a[t]=u[r](e)));break;case"object":case"primitive":f[n]=u[r](a)}break;case"render":const e="function"==typeof u[r];switch(o){case"array":e?a.forEach(((e,t)=>{if(null==e)return;const n=s(e),o=u[r](e);null==o&&(a[t]=null),"object"===n?e.text=o:a[t]=o})):a.forEach(((e,t)=>{if(null==e)return;const n=s(e),o=i(e,r,u);null==o&&(a[t]=null),"object"===n?e.text=o:a[t]=o}));break;case"primitive":f[n]=i(a,r,u);break;case"object":a.text=i(a,r,u)}break;case"mix":if(""===r)switch(o){case"primitive":case"object":break;case"array":f[n]=a.map((e=>"object"===s(e)?e.text:e)).filter((e=>null!=e)).join("")}else f[n]=u[r](a)}}let p=s(f[0]),h=f[0];switch(p){case"primitive":if(null==h)return;e[o]=h;break;case"object":if(null==h.text)return;e[o]=h.text;break;case"array":e[o]=h.join("")}}})),o.push(e.join(""))})),"array"===n?o:o.join("")}}}const l={default:{}};const u={build:c,get:function(e,t="default"){return l[t]?l[t][e]?l[t][e]:function(){return`Error: Template "${e}" does not exist in storage "${t}".`}:function(){return`Error: Storage "${t}" does not exist.`}},add:function(e,t,r="default"){let n=t;l[r]||(l[r]={}),"function"!=typeof t&&(n=c(t)),"success"===n.name?l[r][e]=n:console.error(`Error: Template "${e}" looks broken and is not added to storage.`)},list:function(e="default"){return l[e]?Object.keys(l[e]):[]},clear:function(){Object.keys(l).forEach((e=>{"default"!=e?delete l[e]:l.default={}}))},remove:function(e,t="default"){return l[t]?l[t][e]?void delete l[t][e]:`Error: Template "${e}" does not exist in storage "${t}".`:`Error: Storage "${t}" does not exist.`}};module.exports=u;
