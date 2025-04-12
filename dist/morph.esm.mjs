import e from"@peter.naydenov/walk";import t from"@peter.naydenov/stack";function r(e){return function t(r){const{TG_PRX:a,TG_SFX:o,TG_SIZE_P:s,TG_SIZE_S:l}=e;let c,i,u,f=[];if("string"!=typeof r)return n("notAString");if(0==r.length)return[];if(c=r.indexOf(a),0<c&&f.push(r.slice(0,c)),-1==c)return f.push(r),f;{if(u=r.indexOf(a,c+s),i=r.indexOf(o),-1==i)return n("missingClosing");if(i<c)return n("closedBeforeOpened");if(i+=l,-1!=u&&u<i)return n("newBeforeClosed");f.push(r.slice(c,i));let e=t(r.slice(i));return f.concat(e)}}}function n(e){switch(e){case"notAString":return"Error: Template is not a string.";case"missingClosing":return"Error: Placeholder with missing closing tag.";case"closedBeforeOpened":return"Error: Placeholder closing tag without starting one.";case"newBeforeClosed":return"Error: Nested placeholders. Close placeholder before open new one.";default:return"Error: Unknown template error."}}var a={TG_PRX:"{{",TG_SFX:"}}",TG_SIZE_P:2,TG_SIZE_S:2};function o(e){return null==e?"null":"string"==typeof e||"number"==typeof e||"boolean"==typeof e?"primitive":"function"==typeof e?"function":e instanceof Array?"array":e instanceof Object?"object":void 0}function s(e,t,n,...o){e instanceof Object&&Object.entries(e).forEach((([t,r])=>{r instanceof Object&&(e[t]=r.text),r instanceof Array&&(e[t]=r[0])}));const s="function"==typeof n[t];return e=function(e={}){return"string"==typeof e?{text:e}:e}(e),s?n[t](e,...o):function(e,t){if(null==t)return null;const n=r(a)(e),o=a;return n.forEach(((e,r)=>{if(e.includes(o.TG_PRX)){const a=e.replace(o.TG_PRX,"").replace(o.TG_SFX,"").trim();t.hasOwnProperty(a)&&null!=t[a]&&(n[r]=t[a])}})),n.join("")}(n[t],e)}function l(n,l=!1,c={}){const{hasError:i,placeholders:u,chop:f,helpers:d,handshake:p}=function(e){const{template:t,helpers:n={},handshake:o}=e,{TG_PRX:s,TG_SFX:l}=a,c=[],i="string"==typeof t?t.replace(/<!--[\s\S]*?-->/g,"").replace(/\s{2,}/g," "):t;let u=null;const f=r(a)(i);return"string"==typeof f?u=f:f.forEach(((e,t)=>{const r=RegExp(s+"\\s*(.*?)\\s*(?::\\s*(.*?)\\s*)?"+l,"g");if(e.includes(s)){const a=r.exec(e);c.push({index:t,data:(n=a[1],n||null),action:a[2]?a[2].split(",").map((e=>e.trim())):null})}var n})),c.forEach((e=>{e.action&&e.action.every((e=>"#"===e||"^^"===e||!(!e.startsWith("^")||"^^"===e)||(e.startsWith("?")&&(e=e.replace("?","")),e.startsWith("+")&&(e=e.replace("+","")),e.startsWith("[]")&&(e=e.replace("[]","")),e.startsWith(">")&&(e=e.replace(">","")),""===e||!!n[e]||(u=`Error: Missing helper: ${e}`,!1))))})),{hasError:u,placeholders:c,chop:f,helpers:n,handshake:o}}(n);if(i){function h(){return i}return l?[!1,h]:h}{let m=structuredClone(f);function b(r={},n={},...a){const l=[],i={};let f=o(r),h={...c,...n};if(r=e({data:r}),"null"===f)return m.join("");if("string"==typeof r)switch(r){case"raw":return m.join("");case"demo":if(!p)return"Error: No handshake data.";f=o(r=p);break;case"handshake":return p?structuredClone(p):"Error: No handshake data.";case"placeholders":return u.map((e=>m[e.index])).join(", ");default:return`Error: Wrong command "${r}". Available commands: raw, demo, handshake, placeholders.`}return"array"!==f&&(r=[r]),"null"===f?m.join(""):(r.forEach((r=>{u.forEach((n=>{const{index:a,data:l,action:c}=n,u=!c&&l,f=structuredClone(i),p={dependencies:h,memory:f};let b=r;if(l&&l.includes("/")?l.split("/").forEach((e=>{b=b.hasOwnProperty(e)?b[e]:[]})):"@all"===l||null===l||"@root"===l?b=r:l&&(b=b[l]),u){switch(o(b)){case"function":return void(m[a]=b());case"primitive":return void(m[a]=b);case"array":return void("primitive"===o(b[0])&&(m[a]=b[0]));case"object":return void(b.text&&(m[a]=b.text))}}else{let{dataDeepLevel:n,nestedData:l}=function(t,r){const n=[];let a=0;if(t instanceof Function)return{dataDeepLevel:0,nestedData:[[t()]]};if(null==t)return{dataDeepLevel:0,nestedData:[null]};if("string"==typeof t)return{dataDeepLevel:0,nestedData:[[t]]};const o=structuredClone(t);return r.includes("#")?(e({data:o,objectCallback:function({key:e,value:t,breadcrumbs:r}){return e===r?(n[0]=[t],t):(a=r.split("/").length-1,n[a]||(n[a]=[]),n[a].push(t),t)}}),{dataDeepLevel:a,nestedData:n}):(n.push([o]),{dataDeepLevel:0,nestedData:n})}(b,c),u=function*(e,r){let n=t({type:"LIFO"});for(let t=0;t<=r;t++)n.push(e[t]);for(;n&&!n.isEmpty();){let e=yield n.pull();e&&n.push(e)}}(function(e,t=10){let r={},n=[...e],a=0,o=0,s=0;n.forEach((e=>{"#"===e&&s++})),s<t&&console.error(`Error: Not enough level markers (#) for data with depth level ${t}. Found ${s} level markers in actions: ${e.join(", ")}`);do{r[o]=[],o++}while(o<=t);return n.every((e=>"#"===e?(a++,!(a>t)):e.startsWith("?")?(r[a].push({type:"route",name:e.replace("?",""),level:a}),!0):e.startsWith("^")&&"^^"!==e?(r[a].push({type:"save",name:e.replace("^",""),level:a}),!0):"^^"===e?(r[a].push({type:"overwrite",name:"none",level:a}),!0):e.startsWith("+")?(r[a].push({type:"extendedRender",name:e.replace("+",""),level:a}),!0):e.startsWith("[]")?(r[a].push({type:"mix",name:e.replace("[]",""),level:a}),!0):e.startsWith(">")?(r[a].push({type:"data",name:e.replace(">",""),level:a}),!0):(""===e||r[a].push({type:"render",name:e,level:a}),!0))),r}(c,n),n);for(let t of u){let{type:n,name:a,level:c}=t;(l[c]||[]).forEach(((t,u)=>{let f=o(t);switch(n){case"route":switch(f){case"array":t.forEach(((e,r)=>{if(null==e)return;const n=o(e),l=d[a]({data:e,...p});null!=l&&("object"===n?t[r].text=s(e,l,d,h):t[r]=s(e,l,d,h))}));break;case"object":t.text=s(t,a,d,h)}break;case"save":i[a]=structuredClone(t);break;case"overwrite":r=structuredClone(t);break;case"data":switch(f){case"array":t.forEach(((e,r)=>t[r]=e instanceof Function?d[a]({data:e(),...p}):d[a]({data:e,...p})));break;case"object":l[c]=[d[a]({data:t,...p})];break;case"function":l[c]=[d[a]({data:t(),...p})];break;case"primitive":l[c]=d[a]({data:t,...p})}break;case"render":const m="function"==typeof d[a];switch(f){case"array":m?t.forEach(((e,r)=>{if(null==e)return;const n=o(e),s=d[a]({data:e,...p});null==s&&(t[r]=null),"object"===n?e.text=s:t[r]=s})):t.forEach(((e,r)=>{if(null==e)return;const n=o(e),l=s(e,a,d,h);null==l?t[r]=null:"object"===n?e.text=l:t[r]=l}));break;case"function":l[c]=d[a]({data:t(),...p});break;case"primitive":l[c]=s(t,a,d,h);break;case"object":m?l[c][u].text=d[a]({data:t,...p}):t.text=s(t,a,d,h)}break;case"extendedRender":"function"==typeof d[a]&&l[0].forEach(((e,t)=>l[0][t]=d[a]({data:e,...p})));break;case"mix":if(""===a)switch(f){case"object":Object.keys(t).find((e=>e.includes("/")))?Object.entries(t).forEach((([e,t])=>l[c][e]=t.text)):l[c]=t.text;for(let y=c-1;y>=0;y--)l[y]=e({data:l[y],objectCallback:b});function b({value:e,breadcrumbs:t}){return l[c][t]?l[c][t]:e}break;case"array":t.forEach(((e,r)=>{if(r>0){let n=o(e);if(null==e)return;t[0]+="object"===n?`${e.text}`:`${e}`,t.toSpliced(r,1)}else{let r=o(e);if(t[0]="",null===r)return;t[0]="object"===r?`${e.text}`:`${e}`}})),t.length=1}else{let v=d[a]({data:t,...p}),g=o(v);switch(t.forEach(((e,r)=>t.splice(r,1))),t.length=0,g){case"primitive":t[0]=v;break;case"array":t.push(...v)}}}}))}if(l instanceof Array&&1===l.length&&l[0]instanceof Array&&(l=l[0]),null==l[0])return;let f=o(l[0]),y=l[0];switch(f){case"primitive":if(null==y)return;m[a]=y;break;case"object":if(null==y.text)return;m[a]=y.text;break;case"array":const e=o(y[0]);m[a]="object"===e?y.map((e=>e.text)).join(""):y.join("")}}})),l.push(m.join(""))})),"array"===f?l:a?a.reduce(((e,t)=>"function"!=typeof t?e:t(e,h)),l.join("")):l.join(""))}return l?[!0,b]:b}}const c={default:{}};const i={build:l,get:function(e){if(!(e instanceof Array))return function(){return'Error: Argument "location" is a string. Should be an array. E.g. ["templateName", "storageName"].'};const[t,r="default"]=e;return c[r]?c[r][t]?c[r][t]:function(){return`Error: Template "${t}" does not exist in storage "${r}".`}:function(){return`Error: Storage "${r}" does not exist.`}},add:function(e,t,...r){const[n,a="default"]=e;if(null==t)return void console.warn(`Warning: Template ${a}/${n} is not added to storage. The template is null.`);let o=t,s=!0;if(c[a]||(c[a]={}),"function"!=typeof t){let e=l(t,!0,...r);s=e[0],o=e[1]}s?c[a][n]=o:console.error(`Error: Template "${n}" looks broken and is not added to storage.`)},list:function(e=["default"]){return e.map((e=>c[e]?Object.keys(c[e]):[])).flat()},clear:function(){Object.keys(c).forEach((e=>{"default"!=e?delete c[e]:c.default={}}))},remove:function(e){const[t,r="default"]=e;return c[r]?c[r][t]?void delete c[r][t]:`Error: Template "${t}" does not exist in storage "${r}".`:`Error: Storage "${r}" does not exist.`}};export{i as default};
