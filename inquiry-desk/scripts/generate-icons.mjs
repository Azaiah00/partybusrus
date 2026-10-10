import {deflateSync} from 'node:zlib';
import {writeFileSync} from 'node:fs';
function crc(buf){let c=0xffffffff;for(const v of buf){c^=v;for(let i=0;i<8;i++)c=(c>>>1)^(c&1?0xedb88320:0);}return (c^0xffffffff)>>>0;}
function chunk(type,data){const name=Buffer.from(type),len=Buffer.alloc(4),checksum=Buffer.alloc(4);len.writeUInt32BE(data.length);checksum.writeUInt32BE(crc(Buffer.concat([name,data])));return Buffer.concat([len,name,data,checksum]);}
function png(size){const rows=Buffer.alloc((size*4+1)*size);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const px=x*512/size,py=y*512/size;const outer=px>=164&&px<=334&&py>=142&&py<=300;const hole=px>=213&&px<=286&&py>=188&&py<=250;const stem=px>=164&&px<=213&&py>=142&&py<=370;const color=(outer&&!hole)||stem?[211,239,155]:[21,43,37];const i=y*(size*4+1)+1+x*4;rows.set([...color,255],i);}const head=Buffer.alloc(13);head.writeUInt32BE(size);head.writeUInt32BE(size,4);head[8]=8;head[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',head),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);}
for(const [file,size] of [['icon-192.png',192],['icon-512.png',512],['icon-maskable.png',512]])writeFileSync('public/'+file,png(size));
console.log('Generated home-screen icons.');
