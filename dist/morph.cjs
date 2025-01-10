"use strict";var e=require("@peter.naydenov/walk"),t=require("@peter.naydenov/stack");function r(e){return function t(r){const{TG_PRX:a,TG_SFX:o,TG_SIZE_P:s,TG_SIZE_S:c}=e;let i,l,u,f=[];if("string"!=typeof r)return n("notAString");if(0==r.length)return[];if(i=r.indexOf(a),0<i&&f.push(r.slice(0,i)),-1==i)return f.push(r),f;{if(u=r.indexOf(a,i+s),l=r.indexOf(o),-1==l)return n("missingClosing");if(l<i)return n("closedBeforeOpened");if(l+=c,-1!=u&&u<l)return n("newBeforeClosed");f.push(r.slice(i,l));let e=t(r.slice(l));return f.concat(e)}}}function n(e){switch(e){case"notAString":return"Error: Template is not a string.";case"missingClosing":return"Error: Placeholder with missing closing tag.";case"closedBeforeOpened":return"Error: Placeholder closing tag without starting one.";case"newBeforeClosed":return"Error: Nested placeholders. Close placeholder before open new one.";default:return"Error: Unknown template error."}}function a(t,r){const n={};let a=0;if(t instanceof Function)return{dataDeepLevel:0,nestedData:[t()]};if(null==t)return{dataDeepLevel:0,nestedData:[null]};if("string"==typeof t)return{dataDeepLevel:0,nestedData:[t]};if(!r.includes("#"))return{dataDeepLevel:0,nestedData:[t]};return e({data:t,objectCallback:function({key:e,value:t,breadcrumbs:r}){let o=!1;return a=r.split("/").length-1,isNaN(e)||(o=!0),n[a]||(n[a]=o?[]:{}),"root"===e?n[a]=t:o?n[a].push(t):n[a][r]=t,t}}),{dataDeepLevel:a,nestedData:n}}var o={TG_PRX:"{{",TG_SFX:"}}",TG_SIZE_P:2,TG_SIZE_S:2};function s(e){return null==e?"null":"string"==typeof e||"number"==typeof e||"boolean"==typeof e?"primitive":"function"==typeof e?"function":e instanceof Array?"array":e instanceof Object?"object":void 0}function c(e,t,n,...a){e instanceof Object&&Object.entries(e).forEach((([t,r])=>{r instanceof Object&&(e[t]=r.text)}));const s="function"==typeof n[t];return e=function(e={}){return"string"==typeof e?{text:e}:e}(e),s?n[t](e,...a):function(e,t){if(null==t)return null;const n=r(o)(e),a=o;return n.forEach(((e,r)=>{if(e.includes(a.TG_PRX)){const o=e.replace(a.TG_PRX,"").replace(a.TG_SFX,"").trim();t[o]&&(n[r]=t[o])}})),n.join("")}(n[t],e)}function i(n,i=!1,l={}){const{hasError:u,placeholders:f,chop:d,helpers:p,handshake:h}=function(e){const{template:t,helpers:n={},handshake:a}=e,{TG_PRX:s,TG_SFX:c,TG_SIZE_P:i,TG_SIZE_S:l}=o,u=[];let f=null;const d=r(o)(t);return"string"==typeof d?f=d:d.forEach(((e,t)=>{const r=RegExp(s+"\\s*(.*?)\\s*(?::\\s*(.*?)\\s*)?"+c,"g");if(e.includes(s)){const a=r.exec(e);u.push({index:t,data:(n=a[1],n||null),action:a[2]?a[2].split(",").map((e=>e.trim())):null})}var n})),u.forEach((e=>{e.action&&e.action.every((e=>"#"===e||(e.startsWith("?")&&(e=e.replace("?","")),e.startsWith("+")&&(e=e.replace("+","")),e.startsWith("[]")&&(e=e.replace("[]","")),e.startsWith(">")&&(e=e.replace(">","")),""===e||!!n[e]||(f=`Error: Missing helper: ${e}`,!1))))})),{hasError:f,placeholders:u,chop:d,helpers:n,handshake:a}}(n);if(u){function b(){return u}return i?[!1,b]:b}{let m=structuredClone(d);function y(r={},n={},...o){const i=s(r),u=[];if(r=e({data:r}),"null"===i)return m.join("");if("string"==typeof r)switch(r){case"raw":return m.join("");case"demo":if(!h)return"Error: No handshake data.";r=h;break;case"handshake":return h?structuredClone(h):"Error: No handshake data.";case"placeholders":return f.map((e=>m[e.index])).join(", ");default:return`Error: Wrong command "${r}". Available commands: raw, demo, handshake, placeholders.`}return"array"!==i&&(r=[r]),r.forEach((r=>{f.forEach((o=>{const{index:i,data:u,action:f}=o;if(!f&&u){const d=r[u];switch(s(d)){case"function":return void(m[i]=d());case"primitive":return void(m[i]=d);case"array":return void("primitive"===s(d[0])&&(m[i]=d[0]));case"object":return void(d.text&&(m[i]=d.text))}}else{const{dataDeepLevel:h,nestedData:b}=a("@all"===u||null===u||"@root"===u?r:r[u],f),y=function*(e,r){let n=t({type:"LIFO"});for(let t=0;t<=r;t++)n.push(e[t]);for(;n&&!n.isEmpty();){let e=yield n.pull();e&&n.push(e)}}(function(e,t=10){let r={},n=0,a=[...e],o=0;do{r[o]=[],o++}while(o<=t);return a.every((e=>"#"===e?(n++,!(n>t)):e.startsWith("?")?(r[n].push({type:"route",name:e.replace("?",""),level:n}),!0):e.startsWith("+")?(r[n].push({type:"extendedRender",name:e.replace("+",""),level:n}),!0):e.startsWith("[]")?(r[n].push({type:"mix",name:e.replace("[]",""),level:n}),!0):e.startsWith(">")?(r[n].push({type:"data",name:e.replace(">",""),level:n}),!0):(""===e||r[n].push({type:"render",name:e,level:n}),!0))),r}(f,h),h);for(let j of y){let{type:k,name:x,level:g}=j,_=b[g],w=s(_);switch(k){case"route":switch(w){case"array":_.forEach(((e,t)=>{if(null==e)return;const r=s(e),a=p[x](e);null!=a&&("object"===r?_[t].text=c(e,a,p,{...l,...n}):_[t]=c(e,a,p,{...l,...n}))}));break;case"object":_.text=c(_,x,p,{...l,...n});break;case"primitive":b[g]=c(_,x,p,{...l,...n})}break;case"data":switch(w){case"array":_.forEach(((e,t)=>_[t]=e instanceof Function?p[x](e()):p[x](e)));break;case"object":case"primitive":b[g]=p[x](_);break;case"function":b[g]=p[x](_())}break;case"render":const T="function"==typeof p[x];switch(w){case"array":T?_.forEach(((e,t)=>{if(null==e)return;const r=s(e),a=p[x](e,{...l,...n});null==a&&(_[t]=null),"object"===r?e.text=a:_[t]=a})):_.forEach(((e,t)=>{if(null==e)return;const r=s(e),a=c(e,x,p,{...l,...n});null==a&&(_[t]=null),"object"===r?e.text=a:_[t]=a}));break;case"function":b[g]=p[x](_(),{...l,...n});break;case"primitive":b[g]=c(_,x,p,{...l,...n});break;case"object":if(T)b[g].text=p[x](_,{...l,...n});else{Object.keys(_).find((e=>e.includes("/")))?Object.entries(_).forEach((([e,t])=>t.text=c(t,x,p,{...l,...n}))):_.text=c(_,x,p,{...l,...n})}}break;case"extendedRender":"function"==typeof p[x]&&(b[g]=p[x](b[0]));break;case"mix":if(""===x)switch(w){case"object":Object.keys(_).find((e=>e.includes("/")))?Object.entries(_).forEach((([e,t])=>b[g][e]=t.text)):b[g]=_.text;for(let O=g-1;O>=0;O--)b[O]=e({data:b[O],objectCallback:S});function S({value:e,breadcrumbs:t}){return b[g][t]?b[g][t]:e}break;case"array":b[g]=_.map((e=>"object"===s(e)?e.text:e)).filter((e=>null!=e)).join("")}else b[g]=p[x](_)}}let E=s(b[0]),v=b[0];switch(E){case"primitive":if(null==v)return;m[i]=v;break;case"object":if(null==v.text)return;m[i]=v.text;break;case"array":const G=s(v[0]);m[i]="object"===G?v.map((e=>e.text)).join(""):v.join("")}}})),u.push(m.join(""))})),"array"===i?u:o?o.reduce(((e,t)=>"function"!=typeof t?e:t(e,{...l,...n})),u.join("")):u.join("")}return i?[!0,y]:y}}const l={default:{}};const u={build:i,get:function(e){const[t,r="default"]=e;return l[r]?l[r][t]?l[r][t]:function(){return`Error: Template "${t}" does not exist in storage "${r}".`}:function(){return`Error: Storage "${r}" does not exist.`}},add:function(e,t,...r){const[n,a="default"]=e;let o=t,s=!0;if(l[a]||(l[a]={}),"function"!=typeof t){let e=i(t,!0,...r);s=e[0],o=e[1]}s?l[a][n]=o:console.error(`Error: Template "${n}" looks broken and is not added to storage.`)},list:function(e=["default"]){return e.map((e=>l[e]?Object.keys(l[e]):[])).flat()},clear:function(){Object.keys(l).forEach((e=>{"default"!=e?delete l[e]:l.default={}}))},remove:function(e){const[t,r="default"]=e;return l[r]?l[r][t]?void delete l[r][t]:`Error: Template "${t}" does not exist in storage "${r}".`:`Error: Storage "${r}" does not exist.`}};module.exports=u;
