import assert from 'node:assert/strict';
import { ingestOfficialNews } from '../lib/news/official-ingest';
import { OFFICIAL_SOURCES } from '../lib/news/official-sources';

async function main() {
 const now=new Date(Date.now()+4*3600_000);
 const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 const today=`${now.getUTCDate()} ${months[now.getUTCMonth()]} ${now.getUTCFullYear()}`;
 const sources=Array.from({length:5},(_,i)=>({...OFFICIAL_SOURCES[1],name:`Fixture ${i}`}));
 const page=(name:string,date=today)=>Array.from({length:5},(_,i)=>`<div class="new-component-box"><span class="date-badge">${date}</span><a class="card-title-v2" href="/news/${name.replace(' ','-')}-${i}">Turizm sektoru üçün yeni görüş ${i}</a><p class="card-desc-v2">The article-specific summary provides enough facts for a short draft, without navigation or agency boilerplate being included.</p></div>`).join('');
 const bounded=await ingestOfficialNews(false,async(source)=>page(source.name),sources);
 assert.equal(bounded.accepted.length,12,'global twelve signals cap');
 const counts=new Map<string,number>();for(const item of bounded.accepted)counts.set(item.source,(counts.get(item.source)??0)+1);
 assert([...counts.values()].every(n=>n<=3),'three per source');
 const old=await ingestOfficialNews(false,async()=>page('old','3 Nov 2020'),[sources[0]]);
 assert.equal(old.accepted.length,0);assert.equal(old.tooOld,5);
 const future=await ingestOfficialNews(false,async()=>page('future','3 Nov 2099'),[sources[0]]);
 assert.equal(future.accepted.length,0);
 const missing=await ingestOfficialNews(false,async()=>page('invalid','date unavailable'),[sources[0]]);
 assert.equal(missing.sourcesOk,0);assert.equal(missing.failures.length,1,'layout/date failure not healthy');
 const down=await ingestOfficialNews(false,async()=>{throw new Error('HTTP 403');},[sources[0]]);
 assert.equal(down.sourcesOk,0);assert(down.failures[0].includes('403'));
 const irrelevant=await ingestOfficialNews(false,async()=>page('off-topic').replaceAll('Turizm sektoru üçün yeni görüş','Football championship'),[sources[0]]);
 assert.equal(irrelevant.accepted.length,0);assert.equal(irrelevant.irrelevant,5);
 const kobia=OFFICIAL_SOURCES[3];
 const changedTitle=await ingestOfficialNews(false,async(_source,url)=>url
  ? '<div class="single-news"><span class="title">Football championship for restaurant teams</span><p>This detail text is long enough to be a draft, but its full title must still pass the topic policy before acceptance.</p></div>'
  : `<div class="col-md-4"><a href="/az/all-news/test"><span class="news-title">Restoran üçün...</span><span class="date">${now.getUTCDate()}.${now.getUTCMonth()+1}.${now.getUTCFullYear()}</span></a></div>`,[kobia]);
 assert.equal(changedTitle.accepted.length,0,'full detail title must be rechecked');
 assert.equal(changedTitle.irrelevant,1);
 console.log('official-ingest: OK (read-only caps, freshness, unknown dates, source failures, off-topic rejection)');
}
main().catch((e:unknown)=>{console.error(e);process.exit(1);});
