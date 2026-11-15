/* Text recognition feedback, not acoustic/phoneme scoring. */
(function(root){
'use strict';
function normalize(text){return String(text).normalize('NFKC').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/gu,'').replace(/[أإآٱ]/gu,'ا').replace(/[\s\p{P}\p{Cf}]/gu,'');}
function compare(expected,heard){
 const a=Array.from(normalize(expected)),b=Array.from(normalize(heard));
 const d=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
 for(let i=0;i<=a.length;i++)d[i][0]=i;for(let j=0;j<=b.length;j++)d[0][j]=j;
 for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
 const matched=Array(a.length).fill(false);let i=a.length,j=b.length;
 while(i||j){if(i&&j&&d[i][j]===d[i-1][j-1]+(a[i-1]===b[j-1]?0:1)){matched[i-1]=a[i-1]===b[j-1];i--;j--;}else if(i&&d[i][j]===d[i-1][j]+1)i--;else j--;}
 return {accepted:a.length>0&&b.length>0&&d[a.length][b.length]===0,matched,distance:d[a.length][b.length],heard:normalize(heard)};
}
const api={normalize,compare};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SpeechCheck=api;
})(typeof window!=='undefined'?window:globalThis);
